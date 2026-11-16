/*
 * The language and the place of everything the kit writes: its locale (every `Intl` format
 * and the texts of the components follow it), its time zone and its currency. No month,
 * weekday, plural or separator is spelled out in the kit: each one is asked of `Intl`.
 *
 * The app says its own with `UiProvider` (English, the time zone of the browser and US dollars
 * when it says none); a person may choose another language (`setLocale`), which is remembered
 * per browser and wins. Importing this module has no side effect.
 */

import { readPreference, writePreference } from '../internal/preference.ts';

/** Storage key of the language the person chose (absent: the one of the app). */
export const LOCALE_STORAGE_KEY = 'ui.locale';

/** The locale of an app that sets none. */
export const DEFAULT_LOCALE = 'en';

/** The currency of an app that sets none. */
export const DEFAULT_CURRENCY = 'USD';

/** What an app sets for itself: each one left out keeps the default of the kit. */
export interface LocaleOptions {
	/** The currency of its amounts, as ISO 4217 (`USD`, `CLP`, `EUR`). */
	currency?: string;
	/** Its language and region, as BCP 47 (`en`, `en-GB`, `es-CL`). */
	locale?: string;
	/** The time zone of its dates (`America/Santiago`). Default: the one of the browser. */
	timeZone?: string;
}

export interface LocaleSnapshot {
	currency: string;
	locale: string;
	/** `undefined` is the time zone of the browser. */
	timeZone: string | undefined;
}

const listeners = new Set<() => void>();
let options: LocaleOptions = {};
let snapshot: LocaleSnapshot | undefined;

/** The locale as `Intl` knows it, or nothing when it has no data for it. */
const supported = (locale: string | null | undefined) => {
	if (!locale) return;

	try {
		return Intl.NumberFormat.supportedLocalesOf(locale).at(0);
	} catch {
		// not a locale at all
	}
};

const compute = (): LocaleSnapshot => ({
	currency: options.currency ?? DEFAULT_CURRENCY,
	timeZone: options.timeZone,
	locale:
		supported(readPreference(LOCALE_STORAGE_KEY)) ??
		supported(options.locale) ??
		DEFAULT_LOCALE,
});

const apply = () => {
	const next = compute();

	// the page says its language, for the browser and for assistive technology
	if (document.documentElement.lang !== next.locale)
		document.documentElement.lang = next.locale;

	if (JSON.stringify(snapshot) === JSON.stringify(next)) return;

	snapshot = next;

	for (const listener of listeners) listener();
};

/**
 * The locale, the time zone and the currency now. The same object until one changes
 * (a stable snapshot for useSyncExternalStore).
 *
 * @returns the current snapshot
 */
export const getLocaleSnapshot = (): LocaleSnapshot => (snapshot ??= compute());

/**
 * The locale every format takes when it is given none.
 *
 * @returns the locale, as BCP 47
 */
export const getLocale = () => getLocaleSnapshot().locale;

/**
 * Listens to every change of the locale, the time zone or the currency.
 *
 * @param listener - called after each change
 *
 * @returns the function that stops listening
 */
export const subscribeLocale = (listener: () => void) => {
	listeners.add(listener);

	return () => {
		listeners.delete(listener);
	};
};

/**
 * Sets the locale, the time zone and the currency of the app. `UiProvider` calls it with its
 * props; an app without one (a script, a test) may call it itself.
 *
 * @param next - what the app sets; what is left out goes back to the default of the kit
 */
export const configureLocale = (next: LocaleOptions) => {
	options = next;
	apply();
};

/**
 * Chooses the language of this person and remembers it: it wins over the one of the app.
 *
 * @example
 * ```ts
 * setLocale('es-CL');
 * setLocale(null); // back to the language of the app
 * ```
 *
 * @param locale - a BCP 47 locale, or null to follow the app again
 */
export const setLocale = (locale: string | null) => {
	writePreference(LOCALE_STORAGE_KEY, supported(locale) ?? null);
	apply();
};

/**
 * Something made from a locale (an `Intl` formatter, the shape of its dates), made once per
 * locale and time zone and kept: making a formatter costs far more than using it.
 *
 * @example
 * ```ts
 * const numberFormat = byLocale((locale) => new Intl.NumberFormat(locale));
 *
 * numberFormat('es-CL').format(1250); // '1.250'
 * ```
 *
 * @param make - makes it for a locale and the time zone of the app
 *
 * @returns the function that gives it for a locale (default: the current one)
 */
export const byLocale = <T>(
	make: (locale: string, timeZone: string | undefined) => T,
) => {
	const made = new Map<string, T>();

	return (locale: string = getLocale()): T => {
		const { timeZone } = getLocaleSnapshot();
		const key = `${locale}|${timeZone ?? ''}`;

		if (!made.has(key)) made.set(key, make(locale, timeZone));

		return made.get(key) as T;
	};
};

/**
 * The parts of a moment as a formatter writes them, by name: the day, the month and
 * the year to put in an order of the kit's own, whatever order the formatter has.
 *
 * @param format - the formatter, which says the time zone and how each part is written
 * @param moment - the moment
 *
 * @returns each part by its type
 */
export const datePartsOf = (
	format: Intl.DateTimeFormat,
	moment: Date | number,
) => {
	const parts: Partial<Record<Intl.DateTimeFormatPartTypes, string>> = {};

	for (const { type, value } of format.formatToParts(moment))
		parts[type] = value;

	return parts;
};
