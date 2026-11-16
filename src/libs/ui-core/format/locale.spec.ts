import { afterEach, describe, expect, test, vi } from 'vitest';
import {
	byLocale,
	configureLocale,
	DEFAULT_CURRENCY,
	DEFAULT_LOCALE,
	getLocale,
	getLocaleSnapshot,
	LOCALE_STORAGE_KEY,
	setLocale,
	subscribeLocale,
} from './locale.ts';

const CHILE = 'es-CL';
const SANTIAGO = 'America/Santiago';

describe('locale store', () => {
	// hooks
	afterEach(() => {
		setLocale(null);
		configureLocale({});
		localStorage.clear();
		vi.restoreAllMocks();
	});

	// tests
	test('is English, US dollars and the time zone of the browser for an app that says nothing', () => {
		expect(getLocaleSnapshot()).toStrictEqual({
			currency: DEFAULT_CURRENCY,
			locale: DEFAULT_LOCALE,
			timeZone: undefined,
		});
		expect(getLocale()).toBe('en');
	});

	test('takes what the app sets, and says the language on the page', () => {
		configureLocale({ currency: 'CLP', locale: CHILE, timeZone: SANTIAGO });

		expect(getLocaleSnapshot()).toStrictEqual({
			currency: 'CLP',
			locale: CHILE,
			timeZone: SANTIAGO,
		});
		expect(document.documentElement).toHaveAttribute('lang', CHILE);

		configureLocale({});

		expect(getLocale()).toBe(DEFAULT_LOCALE);
		expect(document.documentElement).toHaveAttribute('lang', 'en');
	});

	test('remembers the language a person chose, which wins over the one of the app', () => {
		configureLocale({ locale: 'en-GB' });
		setLocale(CHILE);

		expect(getLocale()).toBe(CHILE);
		expect(localStorage.getItem(LOCALE_STORAGE_KEY)).toBe(CHILE);

		setLocale(null);

		expect(getLocale()).toBe('en-GB');
		expect(localStorage.getItem(LOCALE_STORAGE_KEY)).toBeNull();
	});

	test.each(['no es un idioma', 'zz-ZZ', ''])(
		'keeps its language when it is given «%s», which is none it knows',
		(locale) => {
			configureLocale({ locale });

			expect(getLocale()).toBe(DEFAULT_LOCALE);

			setLocale(locale);

			expect(getLocale()).toBe(DEFAULT_LOCALE);
			expect(localStorage.getItem(LOCALE_STORAGE_KEY)).toBeNull();
		},
	);

	test('keeps the choice of a person for the page when the storage is blocked', () => {
		vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
			throw new Error('blocked');
		});
		vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
			throw new Error('blocked');
		});

		setLocale(CHILE);

		expect(getLocale()).toBe(CHILE);
	});

	test('keeps the same snapshot until something changes, and tells its listeners then', () => {
		const listener = vi.fn();
		const unsubscribe = subscribeLocale(listener);
		const before = getLocaleSnapshot();

		configureLocale({});

		expect(getLocaleSnapshot()).toBe(before);
		expect(listener).not.toHaveBeenCalled();

		setLocale(CHILE);
		unsubscribe();
		setLocale('en-GB');

		expect(getLocaleSnapshot()).not.toBe(before);
		expect(listener).toHaveBeenCalledOnce();
	});
});

describe(byLocale, () => {
	// hooks
	afterEach(() => {
		setLocale(null);
		configureLocale({});
	});

	// tests
	test('makes a thing once per locale and time zone, and gives it again', () => {
		const make = vi.fn((locale: string, timeZone?: string) => ({
			locale,
			timeZone,
		}));
		const made = byLocale(make);

		expect(made(CHILE)).toBe(made(CHILE));
		expect(made('en-US')).toStrictEqual({
			locale: 'en-US',
			timeZone: undefined,
		});

		configureLocale({ timeZone: SANTIAGO });

		expect(made(CHILE)).toStrictEqual({
			locale: CHILE,
			timeZone: SANTIAGO,
		});
		expect(make).toHaveBeenCalledTimes(3);
	});

	test('takes the locale of the page when it is given none', () => {
		const made = byLocale((locale) => locale);

		expect(made()).toBe(DEFAULT_LOCALE);

		setLocale(CHILE);

		expect(made()).toBe(CHILE);
	});
});
