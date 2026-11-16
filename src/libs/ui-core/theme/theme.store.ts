import {
	readPreference as read,
	writePreference as write,
} from '../internal/preference.ts';
import {
	CONTRAST_STORAGE_KEY,
	type ContrastPreference,
	LINKS_STORAGE_KEY,
	MOTION_STORAGE_KEY,
	type MotionPreference,
	type ResolvedTheme,
	TEXT_STORAGE_KEY,
	type TextSize,
	THEME_STORAGE_KEY,
	type ThemePreference,
	THEMES,
} from './theme.constants.ts';

/**
 * The appearance of the page: the theme (auto follows the system, light, dark) and the contrast
 * (more, normal, or the system's while the person did not choose). It lives on <html> as
 * data-theme="light|dark" and data-contrast="more", which the tokens read (styles/), and the
 * choices are remembered per browser. A blocked storage keeps them for the page only.
 *
 * `public/ui-theme-init.js` applies the same rules before the first paint; this store keeps
 * them in step afterwards. Importing it has no side effect: UiProvider starts the sync.
 */
export interface ThemeSnapshot {
	contrast: ContrastPreference;
	highContrast: boolean;
	/** The motion the person chose; `null` while they follow the system. */
	motion: MotionPreference;
	/** Whether the page moves less: the choice of the person, or what the system asks. */
	reducedMotion: boolean;
	resolvedTheme: ResolvedTheme;
	/** What the system asks for, whatever the person chose. */
	system: { contrast: boolean; reducedMotion: boolean };
	textSize: TextSize;
	theme: ThemePreference;
	underlineLinks: boolean;
}

const DARK_QUERY = '(prefers-color-scheme: dark)';
const CONTRAST_QUERY = '(prefers-contrast: more)';
const MOTION_QUERY = '(prefers-reduced-motion: reduce)';

const listeners = new Set<() => void>();
let snapshot: ThemeSnapshot | undefined;

const isTheme = (value: unknown): value is ThemePreference =>
	THEMES.includes(value as ThemePreference);

const compute = (): ThemeSnapshot => {
	const storedTheme = read(THEME_STORAGE_KEY);
	const theme = isTheme(storedTheme) ? storedTheme : 'auto';
	const storedContrast = read(CONTRAST_STORAGE_KEY);
	const contrast =
		storedContrast === 'more' || storedContrast === 'normal'
			? storedContrast
			: null;
	const storedMotion = read(MOTION_STORAGE_KEY);
	const motion =
		storedMotion === 'reduce' || storedMotion === 'full'
			? storedMotion
			: null;
	const system = {
		contrast: matchMedia(CONTRAST_QUERY).matches,
		reducedMotion: matchMedia(MOTION_QUERY).matches,
	};
	const isDark =
		theme === 'dark' ||
		(theme === 'auto' && matchMedia(DARK_QUERY).matches);

	return {
		contrast,
		motion,
		resolvedTheme: isDark ? 'dark' : 'light',
		system,
		textSize: read(TEXT_STORAGE_KEY) === 'large' ? 'large' : 'normal',
		theme,
		underlineLinks: read(LINKS_STORAGE_KEY) === 'underline',
		highContrast:
			contrast === 'more' || (contrast === null && system.contrast),
		reducedMotion:
			motion === 'reduce' || (motion === null && system.reducedMotion),
	};
};

/**
 * Writes an attribute of the root element, or takes it away: only when it is another,
 * since each write makes the browser work out the styles of the whole page again.
 */
const mark = (name: string, value: string | undefined) => {
	const root = document.documentElement;
	const attribute = `data-${name}`;

	if ((root.getAttribute(attribute) ?? undefined) === value) return;

	if (value === undefined) root.removeAttribute(attribute);
	else root.setAttribute(attribute, value);
};

const apply = () => {
	const next = compute();
	// the same appearance (the system told of a change that changes nothing here): the
	// page is as it should be, and nobody is told
	const isSame = JSON.stringify(snapshot) === JSON.stringify(next);

	if (!isSame) snapshot = next;

	mark('theme', next.resolvedTheme);
	mark('contrast', next.highContrast ? 'more' : undefined);
	// always said, either way: the stylesheet stops asking the system once the kit knows
	mark('motion', next.reducedMotion ? 'reduce' : 'full');
	mark('text', next.textSize === 'large' ? 'large' : undefined);
	mark('links', next.underlineLinks ? 'underline' : undefined);

	if (isSame) return;

	for (const listener of listeners) listener();
};

/**
 * The appearance now. The same object until something changes
 * (a stable snapshot for useSyncExternalStore).
 *
 * @returns the current snapshot
 */
export const getThemeSnapshot = (): ThemeSnapshot => (snapshot ??= compute());

/**
 * Listens to every change of the appearance.
 *
 * @param listener - called after each change
 *
 * @returns the function that stops listening
 */
export const subscribeTheme = (listener: () => void) => {
	listeners.add(listener);

	return () => {
		listeners.delete(listener);
	};
};

/**
 * Chooses the theme and remembers it.
 *
 * @param theme - auto (the system's), light or dark
 */
export const setTheme = (theme: ThemePreference) => {
	write(THEME_STORAGE_KEY, theme === 'auto' ? null : theme);
	apply();
};

/**
 * Chooses the contrast and remembers it.
 *
 * @param contrast - more, normal, or null to follow the system
 */
export const setContrast = (contrast: ContrastPreference) => {
	write(CONTRAST_STORAGE_KEY, contrast);
	apply();
};

/**
 * Chooses how much the page moves and remembers it; `null` follows the system again.
 *
 * @param motion - reduce, full, or null to follow the system
 */
export const setMotion = (motion: MotionPreference) => {
	write(MOTION_STORAGE_KEY, motion);
	apply();
};

/**
 * Chooses the size of the text of the page and remembers it.
 *
 * @param size - normal or large
 */
export const setTextSize = (size: TextSize) => {
	write(TEXT_STORAGE_KEY, size === 'large' ? 'large' : null);
	apply();
};

/**
 * Chooses whether links are always underlined and remembers it.
 *
 * @param isUnderlined - whether every link carries its underline
 */
export const setUnderlineLinks = (isUnderlined: boolean) => {
	write(LINKS_STORAGE_KEY, isUnderlined ? 'underline' : null);
	apply();
};

/**
 * Applies the appearance and follows the system's changes
 * (a page on the auto theme, or with no contrast chosen).
 *
 * @returns the function that stops following
 */
export const startThemeSync = () => {
	const queries = [
		matchMedia(DARK_QUERY),
		matchMedia(CONTRAST_QUERY),
		matchMedia(MOTION_QUERY),
	];

	for (const query of queries) query.addEventListener('change', apply);

	apply();

	return () => {
		for (const query of queries) query.removeEventListener('change', apply);
	};
};
