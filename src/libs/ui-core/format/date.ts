/*
 * Dates and times as the screens show them: in the order of the locale and in the time zone
 * of the app (`locale.ts`), whatever the time zone of the browser. Every function takes an
 * ISO text or a timestamp and answers '—' for an empty value, and the text as it came when it
 * is not a date.
 */

import { displayIsoDate, isoDateParts, toIsoDate } from './iso-date.ts';
import { byLocale, datePartsOf } from './locale.ts';

type DateInput = Date | number | string | null | undefined;

const EMPTY = '—';

/** The day of a moment in the time zone of the app, in figures. */
const dayFormat = byLocale(
	(_locale, timeZone) =>
		new Intl.DateTimeFormat('en', {
			calendar: 'gregory',
			day: '2-digit',
			month: '2-digit',
			numberingSystem: 'latn',
			timeZone,
			year: 'numeric',
		}),
);

/** The time of a moment in the time zone of the app, in figures and 24 hours. */
const timeFormat = byLocale(
	(_locale, timeZone) =>
		new Intl.DateTimeFormat('en', {
			hour: '2-digit',
			hourCycle: 'h23',
			minute: '2-digit',
			numberingSystem: 'latn',
			timeZone,
		}),
);

/** How long ago, as the language says it in short: «5 min. ago», «now». */
const relativeFormat = byLocale(
	(locale) =>
		new Intl.RelativeTimeFormat(locale, {
			numeric: 'auto',
			style: 'short',
		}),
);

const dateOf = (value: Date | number | string) => {
	const date = new Date(value);

	return Number.isNaN(date.getTime()) ? undefined : date;
};

/** The day of a moment, as the locale writes a date in figures. */
const dayOf = (date: Date, locale?: string) => {
	const { day, month, year } = datePartsOf(dayFormat(), date);

	return displayIsoDate(
		toIsoDate(Number(year), Number(month), Number(day)),
		locale,
	);
};

const clockOf = (date: Date) => {
	const { hour, minute } = datePartsOf(timeFormat(), date);

	return `${hour}:${minute}`;
};

/**
 * A date in figures, as the locale writes it.
 *
 * @example
 * ```ts
 * formatDate('2026-11-05'); // '11/05/2026' (a date without time is never shifted)
 * formatDate('2026-11-05', 'es-CL'); // '05-11-2026'
 * formatDate('2026-11-05T02:30:00Z'); // the day in the time zone of the app
 * ```
 *
 * @param value - an ISO date, an ISO timestamp, a Date or milliseconds
 * @param locale - the locale (default: the current one)
 *
 * @returns the date
 */
export const formatDate = (value: DateInput, locale?: string) => {
	if (value === null || value === undefined || value === '') return EMPTY;

	if (typeof value === 'string' && isoDateParts(value))
		return displayIsoDate(value, locale);

	const date = dateOf(value);

	return date ? dayOf(date, locale) : String(value);
};

/**
 * A time as hh:mm (24 hours).
 *
 * @param value - a time ('08:30:00'), an ISO timestamp, a Date or milliseconds
 *
 * @returns the time in the time zone of the app
 */
export const formatTime = (value: DateInput) => {
	if (value === null || value === undefined || value === '') return EMPTY;

	if (typeof value === 'string' && /^\d{2}:\d{2}/u.test(value))
		return value.slice(0, 5);

	const date = dateOf(value);

	return date ? clockOf(date) : String(value);
};

/**
 * A moment as its date and hh:mm.
 *
 * @param value - an ISO timestamp, a Date or milliseconds
 * @param locale - the locale (default: the current one)
 *
 * @returns the date and the time in the time zone of the app
 */
export const formatDateTime = (value: DateInput, locale?: string) => {
	if (value === null || value === undefined || value === '') return EMPTY;

	const date = dateOf(value);

	return date ? `${dayOf(date, locale)} ${clockOf(date)}` : String(value);
};

/**
 * How long ago a moment was, in words; the date and time after a day.
 *
 * @example
 * ```ts
 * formatRelative(Date.now() - 5 * 60_000); // '5 min. ago'
 * ```
 *
 * @param value - an ISO timestamp, a Date or milliseconds
 * @param now - the moment to compare with (default: now)
 * @param locale - the locale (default: the current one)
 *
 * @returns «now», «5 min. ago», «2 hr. ago», or the date and time
 */
export const formatRelative = (
	value: DateInput,
	now: number = Date.now(),
	locale?: string,
) => {
	if (value === null || value === undefined || value === '') return EMPTY;

	const date = dateOf(value);

	if (!date) return String(value);

	const minutes = Math.round((now - date.getTime()) / 60_000);
	const relative = relativeFormat(locale);

	if (minutes < 1) return relative.format(0, 'second');

	if (minutes < 60) return relative.format(-minutes, 'minute');

	return minutes < 24 * 60
		? relative.format(-Math.round(minutes / 60), 'hour')
		: formatDateTime(date, locale);
};
