/*
 * Calendar dates as YYYY-MM-DD texts: the value a date field holds and a form sends. No
 * time and no time zone, so a date never shifts; the arithmetic runs in UTC. Only «today»
 * depends on a place: it is the day in the time zone of the app.
 *
 * What a person reads and types follows the locale: the order of the day, the month and the
 * year and what goes between them (`11/05/2026` in the United States, `05-11-2026` in Chile,
 * `05.11.2026` in Germany), the names of the months and the day a week starts on.
 */

import { byLocale, datePartsOf } from './locale.ts';

type DatePart = 'day' | 'month' | 'year';

/** How a locale writes a date in figures. */
export interface DatePattern {
	/** Its parts, in the order they are written. */
	order: readonly DatePart[];
	/** What goes between them: `-`, `/` or `.`. */
	separator: string;
}

/** How many figures each part of a date has. */
const SIZES = { day: 2, month: 2, year: 4 } as const;

/** The order of a date as a system writes it, and as a date field gives it. */
const SYSTEM_ORDER: readonly DatePart[] = ['year', 'month', 'day'];

const NOT_DIGITS = /\D/gu;

const pad = (value: number) => String(value).padStart(2, '0');

const utc = (year: number, month: number, day: number) =>
	new Date(Date.UTC(year, month - 1, day));

const isDatePart = (type: string): type is DatePart => type in SIZES;

/**
 * How a locale writes a date in figures: the order of its day, its month and its year, and
 * what it puts between them. A separator that is not a dash, a slash or a dot is a dash.
 *
 * @example
 * ```ts
 * datePattern('en-US'); // { order: ['month', 'day', 'year'], separator: '/' }
 * datePattern('es-CL'); // { order: ['day', 'month', 'year'], separator: '-' }
 * ```
 *
 * @param locale - the locale (default: the current one)
 *
 * @returns the order and the separator
 */
export const datePattern = byLocale((locale): DatePattern => {
	const parts = new Intl.DateTimeFormat(locale, {
		calendar: 'gregory',
		day: '2-digit',
		month: '2-digit',
		numberingSystem: 'latn',
		timeZone: 'UTC',
		year: 'numeric',
	}).formatToParts(0);
	const literal =
		parts.find(({ type }) => type === 'literal')?.value.trim() ?? '';

	return {
		order: parts.map(({ type }) => type).filter((type) => isDatePart(type)),
		separator: /^[-./]$/u.test(literal) ? literal : '-',
	};
});

/** The parts of a date, each already in figures, as a locale writes them. */
const written = (parts: Record<DatePart, string>, locale?: string) => {
	const { order, separator } = datePattern(locale);

	return order.map((part) => parts[part]).join(separator);
};

/** The day in the time zone of the app, in figures: its parts make a YYYY-MM-DD. */
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

const monthFormat = byLocale(
	(locale) =>
		new Intl.DateTimeFormat(locale, { month: 'long', timeZone: 'UTC' }),
);

const weekdayFormat = byLocale(
	(locale) =>
		new Intl.DateTimeFormat(locale, { timeZone: 'UTC', weekday: 'long' }),
);

/**
 * A date in words, as the language writes it («Thursday, November 5, 2026»). In UTC: a
 * date has no time to shift it, so it is given as the UTC midnight of its day.
 */
export const spokenDateFormat = byLocale(
	(locale) =>
		new Intl.DateTimeFormat(locale, {
			day: 'numeric',
			month: 'long',
			timeZone: 'UTC',
			weekday: 'long',
			year: 'numeric',
		}),
);

/**
 * The day a week starts on where a locale is from, counted from Monday: 0 in Chile and in
 * most of Europe, 6 (Sunday) in the United States. Monday where the browser cannot tell.
 *
 * @param locale - the locale (default: the current one)
 *
 * @returns 0 for Monday … 6 for Sunday
 */
export const firstWeekday = byLocale((locale) => {
	const tag = new Intl.Locale(locale) as Intl.Locale & {
		weekInfo?: { firstDay: number };
		getWeekInfo?: () => { firstDay: number };
	};
	// 1 for Monday … 7 for Sunday
	const firstDay = (tag.getWeekInfo?.() ?? tag.weekInfo)?.firstDay ?? 1;

	return (firstDay + 6) % 7;
});

/**
 * The months, as a language names them («January» … «December»).
 *
 * @param locale - the locale (default: the current one)
 *
 * @returns the twelve names, from January
 */
export const monthNames = byLocale((locale): readonly string[] =>
	Array.from({ length: 12 }, (_, index) =>
		monthFormat(locale).format(utc(2024, index + 1, 1)),
	),
);

/**
 * The days of the week, as a language names them, from the day its week starts on.
 *
 * @param locale - the locale (default: the current one)
 *
 * @returns the seven names: `weekdayNames()[weekdayOf(date)]` names the day of a date
 */
export const weekdayNames = byLocale((locale): readonly string[] =>
	Array.from({ length: 7 }, (_, index) =>
		// the first of January of 2024 is a Monday
		weekdayFormat(locale).format(
			utc(2024, 1, 1 + firstWeekday(locale) + index),
		),
	),
);

/**
 * A date as YYYY-MM-DD.
 *
 * @param year - the year
 * @param month - the month, from 1
 * @param day - the day of the month
 *
 * @returns the ISO date
 */
export const toIsoDate = (year: number, month: number, day: number) =>
	`${String(year).padStart(4, '0')}-${pad(month)}-${pad(day)}`;

/**
 * The parts of an ISO date.
 *
 * @param value - a YYYY-MM-DD text
 *
 * @returns [year, month (1-12), day], or undefined when it is not a real date
 */
export const isoDateParts = (
	value: string | null | undefined,
): [year: number, month: number, day: number] | undefined => {
	const match = /^(?<year>\d{4})-(?<month>\d{2})-(?<day>\d{2})$/u.exec(
		value ?? '',
	);

	if (!match?.groups) return undefined;

	const year = Number(match.groups.year);
	const month = Number(match.groups.month);
	const day = Number(match.groups.day);
	const date = utc(year, month, day);

	// the 31st of a month of 30 days rolls over: not a real date
	return date.getUTCMonth() === month - 1 && date.getUTCDate() === day
		? [year, month, day]
		: undefined;
};

const partsOf = (value: string) => {
	const parts = isoDateParts(value);

	if (!parts) throw new RangeError(`Not an ISO date: ${value}`);

	return parts;
};

/**
 * Today, in the time zone of the app.
 *
 * @param now - the moment to read the day of (default: now)
 *
 * @returns the ISO date of the day
 */
export const todayIso = (now: Date | number = Date.now()) => {
	const { day, month, year } = datePartsOf(dayFormat(), now);

	return `${year}-${month}-${day}`;
};

/**
 * An ISO date as people type it where the locale is from.
 *
 * @example
 * ```ts
 * displayIsoDate('2026-11-05'); // '11/05/2026'
 * displayIsoDate('2026-11-05', 'es-CL'); // '05-11-2026'
 * ```
 *
 * @param value - a YYYY-MM-DD text
 * @param locale - the locale (default: the current one)
 *
 * @returns the date in figures, or '' when it is not a date
 */
export const displayIsoDate = (
	value: string | null | undefined,
	locale?: string,
) => {
	const parts = isoDateParts(value);

	return parts
		? written(
				{
					day: pad(parts[2]),
					month: pad(parts[1]),
					year: String(parts[0]).padStart(4, '0'),
				},
				locale,
			)
		: '';
};

/** As many digits as a date has: two of its day, two of its month, four of its year. */
export const DATE_DIGITS = 8;

/**
 * What is typed in a date field, with its separators as the digits come: nothing typed
 * is refused, a text that is not a date is left as it is. Every digit is kept: with
 * more than `DATE_DIGITS` the text is no date (`parseTypedDate` has none for it),
 * and it is for the field not to take them, never for a cut to make a date of it.
 *
 * @example
 * ```ts
 * maskTypedDate('1105'); // '11/05'
 * maskTypedDate('05/11/2026', 'es-CL'); // '05-11-2026'
 * ```
 *
 * @param text - what was typed or pasted
 * @param locale - the locale (default: the current one)
 *
 * @returns the text as the locale writes a date, so far
 */
export const maskTypedDate = (text: string, locale?: string) => {
	if (!/^[\s\d\-./]*$/u.test(text)) return text;

	const { order, separator } = datePattern(locale);
	const digits = text.replaceAll(NOT_DIGITS, '');
	const first = SIZES[order[0]];
	const second = first + SIZES[order[1]];

	return [
		digits.slice(0, first),
		digits.slice(first, second),
		digits.slice(second),
	]
		.filter(Boolean)
		.join(separator);
};

/**
 * A date that was pasted whole, as a date field shows one. What is typed comes key by
 * key and `maskTypedDate` puts its separators as the digits come; a date written whole has
 * its parts apart already, and a day or a month of one digit («5/11/2026») is not the
 * start of a longer number. It is shown as it was written even when it is no real
 * date («31/2/2026»), for the field to say so.
 *
 * @example
 * ```ts
 * maskPastedDate('5/11/2026', 'es-CL'); // '05-11-2026'
 * maskPastedDate('2026-11-05', 'es-CL'); // '05-11-2026'
 * maskPastedDate('0511', 'es-CL'); // undefined: not a whole date
 * ```
 *
 * @param text - what was pasted
 * @param locale - the locale (default: the current one)
 *
 * @returns the date as the locale writes it, or undefined when the text is not a date
 *   written whole (its three parts in the order of the locale, the year with four digits,
 *   or year, month and day as a system writes them)
 */
export const maskPastedDate = (text: string, locale?: string) => {
	const pieces = text.trim().split(/[\s\-./]+/u);

	if (pieces.length !== 3 || pieces.some((piece) => !/^\d+$/u.test(piece)))
		return;

	const read = [datePattern(locale).order, SYSTEM_ORDER].find((order) =>
		order.every((part, index) =>
			part === 'year'
				? pieces[index].length === SIZES.year
				: pieces[index].length <= SIZES[part],
		),
	);

	if (!read) return;

	const at = (part: DatePart) => pieces[read.indexOf(part)];

	return written(
		{
			day: pad(Number(at('day'))),
			month: pad(Number(at('month'))),
			year: at('year'),
		},
		locale,
	);
};

/**
 * What was typed (as the locale writes a date, with dashes, slashes, dots or none) as an
 * ISO date.
 *
 * @param text - the typed date
 * @param locale - the locale (default: the current one)
 *
 * @returns YYYY-MM-DD, or undefined when it is not a complete, real date
 */
export const parseTypedDate = (text: string, locale?: string) => {
	const digits = text.replaceAll(NOT_DIGITS, '');

	if (digits.length !== DATE_DIGITS) return;

	const { order } = datePattern(locale);
	const parts = { day: 0, month: 0, year: 0 };
	let from = 0;

	for (const part of order) {
		parts[part] = Number(digits.slice(from, from + SIZES[part]));
		from += SIZES[part];
	}

	const value = toIsoDate(parts.year, parts.month, parts.day);

	return isoDateParts(value) ? value : undefined;
};

/**
 * Days added to an ISO date.
 *
 * @param value - a YYYY-MM-DD date
 * @param days - how many days to add (negative to go back)
 *
 * @returns the new ISO date
 */
export const addDays = (value: string, days: number) => {
	const [year, month, day] = partsOf(value);

	return utc(year, month, day + days)
		.toISOString()
		.slice(0, 10);
};

/**
 * Months added to an ISO date, the day kept within the target month
 * (the 31st of January plus one month is the last day of February).
 *
 * @param value - a YYYY-MM-DD date
 * @param months - how many months to add (negative to go back)
 *
 * @returns the new ISO date
 */
export const addMonths = (value: string, months: number) => {
	const [year, month, day] = partsOf(value);
	const first = utc(year, month + months, 1);
	const lastDay = utc(
		first.getUTCFullYear(),
		first.getUTCMonth() + 2,
		0,
	).getUTCDate();

	return toIsoDate(
		first.getUTCFullYear(),
		first.getUTCMonth() + 1,
		Math.min(day, lastDay),
	);
};

/**
 * The day of the week of an ISO date, counted from the day a week starts on where the
 * locale is from.
 *
 * @example
 * ```ts
 * weekdayOf('2026-11-05', 'es-CL'); // 3: a Thursday, in a week that starts on Monday
 * weekdayOf('2026-11-05', 'en-US'); // 4: in a week that starts on Sunday
 * ```
 *
 * @param value - a YYYY-MM-DD date
 * @param locale - the locale (default: the current one)
 *
 * @returns 0 for the first day of the week … 6 for the last
 */
export const weekdayOf = (value: string, locale?: string) => {
	const [year, month, day] = partsOf(value);
	// 0 for Monday … 6 for Sunday
	const fromMonday = (utc(year, month, day).getUTCDay() + 6) % 7;

	return (fromMonday - firstWeekday(locale) + 7) % 7;
};

/**
 * An ISO date in words, as the language writes it.
 *
 * @example
 * ```ts
 * spokenDate('2026-11-05'); // 'Thursday, November 5, 2026'
 * spokenDate('2026-11-05', 'es-CL'); // 'jueves, 5 de noviembre de 2026'
 * ```
 *
 * @param value - a YYYY-MM-DD date
 * @param locale - the locale (default: the current one)
 *
 * @returns the weekday, the day, the month and the year, in words
 */
export const spokenDate = (value: string, locale?: string) => {
	const [year, month, day] = partsOf(value);

	return spokenDateFormat(locale).format(utc(year, month, day));
};

/**
 * An ISO date kept within two others.
 *
 * @param value - a YYYY-MM-DD date
 * @param min - the first date allowed, if any
 * @param max - the last date allowed, if any
 *
 * @returns the date, or the limit it went over
 */
export const clampIsoDate = (value: string, min?: string, max?: string) => {
	if (min && value < min) return min;

	return max && value > max ? max : value;
};
