import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { mockMatchMedia } from '../__mocks__/match-media.mock.ts';
import initScript from '../../../../public/ui-theme-init.js?raw';
import {
	BLACK_STORAGE_KEY,
	CONTRAST_STORAGE_KEY,
	LINKS_STORAGE_KEY,
	MOTION_STORAGE_KEY,
	TEXT_STORAGE_KEY,
	THEME_STORAGE_KEY,
} from './theme.constants.ts';
import {
	getThemeSnapshot,
	setContrast,
	setMotion,
	setPureBlack,
	setTextSize,
	setTheme,
	setUnderlineLinks,
	startThemeSync,
	subscribeTheme,
} from './theme.store.ts';

const DARK = '(prefers-color-scheme: dark)';
const CONTRAST = '(prefers-contrast: more)';
const MOTION = '(prefers-reduced-motion: reduce)';

describe('theme store', () => {
	const root = document.documentElement;
	let media: ReturnType<typeof mockMatchMedia>;

	// hooks
	beforeEach(() => {
		media = mockMatchMedia();
	});

	afterEach(() => {
		setTheme('auto');
		setContrast(null);
		setMotion(null);
		setTextSize('normal');
		setUnderlineLinks(false);
		setPureBlack(false);
		delete root.dataset.motion;
		delete root.dataset.theme;
		localStorage.clear();
		vi.restoreAllMocks();
		media.restore();
	});

	// tests
	test('follows the system while nothing was chosen', () => {
		media.set(DARK, true);
		media.set(CONTRAST, true);

		const stop = startThemeSync();

		expect(getThemeSnapshot()).toMatchObject({
			contrast: null,
			highContrast: true,
			resolvedTheme: 'dark',
			theme: 'auto',
		});
		expect(root.dataset.theme).toBe('dark');
		expect(root.dataset.contrast).toBe('more');

		stop();
	});

	test('follows a change of the system only while the sync runs', () => {
		const stop = startThemeSync();

		media.set(DARK, true);

		expect(root.dataset.theme).toBe('dark');

		stop();
		media.set(DARK, false);

		expect(root.dataset.theme).toBe('dark');
	});

	test('applies and remembers the theme chosen over the system', () => {
		media.set(DARK, true);

		setTheme('light');

		expect(root.dataset.theme).toBe('light');
		expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('light');
		expect(getThemeSnapshot().theme).toBe('light');
	});

	test('forgets the theme when it goes back to auto', () => {
		setTheme('dark');
		setTheme('auto');

		expect(localStorage.getItem(THEME_STORAGE_KEY)).toBeNull();
		expect(root.dataset.theme).toBe('light');
	});

	test.each([
		{ chosen: 'more', system: false, wears: 'more' },
		{ chosen: 'normal', system: true, wears: undefined },
		{ chosen: null, system: true, wears: 'more' },
		{ chosen: null, system: false, wears: undefined },
	] as const)(
		'contrast $chosen with the system at $system wears $wears',
		({ chosen, system, wears }) => {
			media.set(CONTRAST, system);

			setContrast(chosen);

			expect(root.dataset.contrast).toBe(wears);
			expect(localStorage.getItem(CONTRAST_STORAGE_KEY)).toBe(chosen);
			expect(getThemeSnapshot().highContrast).toBe(wears === 'more');
		},
	);

	test.each([
		{ chosen: 'reduce', system: false, wears: 'reduce' },
		{ chosen: 'full', system: true, wears: 'full' },
		{ chosen: null, system: true, wears: 'reduce' },
		{ chosen: null, system: false, wears: 'full' },
	] as const)(
		'motion $chosen with the system at $system wears $wears',
		({ chosen, system, wears }) => {
			media.set(MOTION, system);

			setMotion(chosen);

			// said either way: the stylesheet stops asking the system once the kit knows
			expect(root.dataset.motion).toBe(wears);
			expect(localStorage.getItem(MOTION_STORAGE_KEY)).toBe(chosen);
			expect(getThemeSnapshot()).toMatchObject({
				motion: chosen,
				reducedMotion: wears === 'reduce',
			});
		},
	);

	test('follows the motion the system asks for while the sync runs', () => {
		const stop = startThemeSync();

		expect(root.dataset.motion).toBe('full');

		media.set(MOTION, true);

		expect(root.dataset.motion).toBe('reduce');
		expect(getThemeSnapshot().system).toStrictEqual({
			contrast: false,
			reducedMotion: true,
		});

		stop();
	});

	test('makes the text larger and remembers it, until it is normal again', () => {
		setTextSize('large');

		expect(root.dataset.text).toBe('large');
		expect(localStorage.getItem(TEXT_STORAGE_KEY)).toBe('large');
		expect(getThemeSnapshot().textSize).toBe('large');

		setTextSize('normal');

		expect(root.dataset.text).toBeUndefined();
		expect(localStorage.getItem(TEXT_STORAGE_KEY)).toBeNull();
	});

	test('underlines every link and remembers it, until it is asked not to', () => {
		setUnderlineLinks(true);

		expect(root.dataset.links).toBe('underline');
		expect(localStorage.getItem(LINKS_STORAGE_KEY)).toBe('underline');
		expect(getThemeSnapshot().underlineLinks).toBe(true);

		setUnderlineLinks(false);

		expect(root.dataset.links).toBeUndefined();
		expect(localStorage.getItem(LINKS_STORAGE_KEY)).toBeNull();
	});

	test('paints the dark theme in pure black when asked, and remembers it', () => {
		setTheme('dark');
		setPureBlack(true);

		expect(root.dataset.dark).toBe('black');
		expect(localStorage.getItem(BLACK_STORAGE_KEY)).toBe('true');
		expect(getThemeSnapshot().pureBlack).toBe(true);

		setPureBlack(false);

		expect(root.dataset.dark).toBeUndefined();
		expect(localStorage.getItem(BLACK_STORAGE_KEY)).toBeNull();
	});

	test('keeps pure black for the dark theme: a light page never wears it', () => {
		const stop = startThemeSync();

		setPureBlack(true);

		// the system is light, and the theme follows it
		expect(root.dataset.dark).toBeUndefined();
		expect(getThemeSnapshot().pureBlack).toBe(true);

		media.set(DARK, true);

		expect(root.dataset.dark).toBe('black');

		setTheme('light');

		expect(root.dataset.dark).toBeUndefined();

		stop();
	});

	test('keeps the same snapshot until something changes', () => {
		const before = getThemeSnapshot();

		expect(getThemeSnapshot()).toBe(before);

		setTheme('dark');

		expect(getThemeSnapshot()).not.toBe(before);
	});

	test('notifies its listeners until they unsubscribe', () => {
		const listener = vi.fn();
		const unsubscribe = subscribeTheme(listener);

		setTheme('dark');
		unsubscribe();
		setTheme('light');

		expect(listener).toHaveBeenCalledOnce();
	});

	test('tells nobody and writes nothing on the page when nothing changes', () => {
		const stop = startThemeSync();

		setTheme('dark');

		const before = getThemeSnapshot();
		const listener = vi.fn();
		const unsubscribe = subscribeTheme(listener);
		const written = new MutationObserver(vi.fn());

		written.observe(root, { attributes: true });

		// the same choices again, and a change of the system that changes nothing here
		setTheme('dark');
		media.set(DARK, true);

		expect(listener).not.toHaveBeenCalled();
		expect(getThemeSnapshot()).toBe(before);
		expect(
			written
				.takeRecords()
				.filter(({ attributeName }) =>
					/^data-(?:contrast|dark|links|motion|text|theme)$/u.test(
						attributeName ?? '',
					),
				),
		).toHaveLength(0);

		setTextSize('large');

		expect(listener).toHaveBeenCalledOnce();
		expect(root.dataset.text).toBe('large');

		written.disconnect();
		unsubscribe();
		stop();
	});

	test('holds a choice for the page when the storage is blocked', () => {
		vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
			throw new Error('blocked');
		});

		setTheme('dark');

		expect(getThemeSnapshot().theme).toBe('dark');
		expect(root.dataset.theme).toBe('dark');
	});

	describe('on a fresh page', () => {
		const freshStore = () => {
			vi.resetModules();

			return import('./theme.store.ts');
		};

		// (0, eval): the script is a classic one, run in the global scope as the browser does
		const runInitScript = () => (0, eval)(initScript) as unknown;

		// a fresh page has nothing written on its root yet
		beforeEach(() => {
			delete root.dataset.contrast;
			delete root.dataset.dark;
			delete root.dataset.links;
			delete root.dataset.motion;
			delete root.dataset.text;
			delete root.dataset.theme;
		});

		test('reads what the person chose before', async () => {
			localStorage.setItem(THEME_STORAGE_KEY, 'dark');
			localStorage.setItem(CONTRAST_STORAGE_KEY, 'more');

			const store = await freshStore();

			expect(store.getThemeSnapshot()).toMatchObject({
				contrast: 'more',
				resolvedTheme: 'dark',
				theme: 'dark',
			});
		});

		test('ignores a stored value it does not know', async () => {
			localStorage.setItem(THEME_STORAGE_KEY, 'sepia');
			localStorage.setItem(CONTRAST_STORAGE_KEY, 'max');
			localStorage.setItem(MOTION_STORAGE_KEY, 'none');
			localStorage.setItem(TEXT_STORAGE_KEY, 'huge');
			localStorage.setItem(LINKS_STORAGE_KEY, 'yes');
			localStorage.setItem(BLACK_STORAGE_KEY, 'yes');

			const store = await freshStore();

			expect(store.getThemeSnapshot()).toMatchObject({
				contrast: null,
				motion: null,
				pureBlack: false,
				textSize: 'normal',
				theme: 'auto',
				underlineLinks: false,
			});
		});

		test('falls back to the system when the storage cannot be read', async () => {
			vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
				throw new Error('blocked');
			});
			media.set(DARK, true);

			const store = await freshStore();

			expect(store.getThemeSnapshot().resolvedTheme).toBe('dark');

			runInitScript();

			expect(root.dataset.theme).toBe('dark');
		});

		test.each([
			{ dark: false, stored: {}, system: false },
			{ dark: true, stored: {}, system: true },
			{
				dark: true,
				system: true,
				stored: {
					[CONTRAST_STORAGE_KEY]: 'normal',
					[THEME_STORAGE_KEY]: 'light',
				},
			},
			{
				dark: false,
				system: false,
				stored: {
					[CONTRAST_STORAGE_KEY]: 'more',
					[THEME_STORAGE_KEY]: 'dark',
				},
			},
			{
				dark: false,
				system: true,
				stored: {
					[LINKS_STORAGE_KEY]: 'underline',
					[MOTION_STORAGE_KEY]: 'full',
					[TEXT_STORAGE_KEY]: 'large',
				},
			},
			{
				dark: true,
				stored: { [MOTION_STORAGE_KEY]: 'reduce' },
				system: false,
			},
			// pure black: on a dark page, chosen or the system's, and never on a light one
			{
				dark: true,
				stored: { [BLACK_STORAGE_KEY]: 'true' },
				system: false,
			},
			{
				dark: false,
				stored: { [BLACK_STORAGE_KEY]: 'true' },
				system: false,
			},
			{
				dark: false,
				system: false,
				stored: {
					[BLACK_STORAGE_KEY]: 'true',
					[THEME_STORAGE_KEY]: 'dark',
				},
			},
			{
				dark: true,
				system: false,
				stored: {
					[BLACK_STORAGE_KEY]: 'true',
					[THEME_STORAGE_KEY]: 'light',
				},
			},
		])(
			'the pre-paint script writes what the store would (stored $stored, system dark $dark, contrast and motion $system)',
			async ({ dark, stored, system }) => {
				for (const [key, value] of Object.entries(stored))
					localStorage.setItem(key, value);

				media.set(DARK, dark);
				media.set(CONTRAST, system);
				media.set(MOTION, system);

				runInitScript();

				const painted = { ...root.dataset };
				const store = await freshStore();

				store.startThemeSync()();

				expect({ ...root.dataset }).toStrictEqual(painted);
			},
		);
	});
});
