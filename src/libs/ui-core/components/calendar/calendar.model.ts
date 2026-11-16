import {
	firstWeekday,
	spokenDateFormat,
	toIsoDate,
} from '../../format/iso-date.ts';
import { byLocale } from '../../format/locale.ts';

/** A day of the grid of a month. */
export interface CalendarDay {
	/** YYYY-MM-DD. */
	date: string;
	/** The day of its month. */
	day: number;
	/** The date as the language says it: «Thursday, November 5, 2026». */
	spoken: string;
}

const shortWeekdayFormat = byLocale(
	(locale) =>
		new Intl.DateTimeFormat(locale, { timeZone: 'UTC', weekday: 'short' }),
);

const monthOfYearFormat = byLocale(
	(locale) =>
		new Intl.DateTimeFormat(locale, {
			month: 'long',
			timeZone: 'UTC',
			year: 'numeric',
		}),
);

/**
 * The days of the week as the head of a calendar abbreviates them, from the day a week
 * starts on where the locale is from («Sun» … «Sat» in en-US, «lun» … «dom» in es-CL): the
 * short form of the language, not a cut of its long one.
 *
 * @param locale - the locale (default: the current one)
 *
 * @returns the seven short names
 */
export const weekdayLabels = byLocale((locale): readonly string[] =>
	Array.from({ length: 7 }, (_, index) =>
		// the first of January of 2024 is a Monday
		shortWeekdayFormat(locale).format(
			new Date(Date.UTC(2024, 0, 1 + firstWeekday(locale) + index)),
		),
	),
);

/**
 * A month of a year in words, as the language writes it: what a calendar says it
 * shows.
 *
 * @example
 * ```ts
 * monthLabel(2026, 11); // 'November 2026'
 * monthLabel(2026, 11, 'es-CL'); // 'noviembre de 2026'
 * ```
 *
 * @param year - the year
 * @param month - the month, from 1
 * @param locale - the locale (default: the current one)
 *
 * @returns the month and the year
 */
export const monthLabel = (year: number, month: number, locale?: string) =>
	monthOfYearFormat(locale).format(new Date(Date.UTC(year, month - 1, 1)));

/**
 * The six weeks a calendar shows for a month, from the first day of the week of its
 * first day (a Monday or a Sunday, as the locale has it): the days of the month and those
 * of its neighbours that fill the grid. Worked out in one pass, with no date read back from
 * its text.
 *
 * @example
 * ```ts
 * monthDays(2026, 11, 'es-CL')[0]; // { date: '2026-10-26', day: 26, spoken: 'lunes, 26 de octubre de 2026' }
 * ```
 *
 * @param year - the year
 * @param month - the month, from 1
 * @param locale - the locale (default: the current one)
 *
 * @returns the 42 days of the grid, in order
 */
export const monthDays = (
	year: number,
	month: number,
	locale?: string,
): CalendarDay[] => {
	const first = new Date(Date.UTC(year, month - 1, 1));
	// days back to the first day of that week (0 for a month that starts on one)
	const lead = (first.getUTCDay() + 6 - firstWeekday(locale) + 7) % 7;

	return Array.from({ length: 42 }, (_, index) => {
		const moment = new Date(Date.UTC(year, month - 1, 1 - lead + index));
		const day = moment.getUTCDate();

		return {
			day,
			spoken: spokenDateFormat(locale).format(moment),
			date: toIsoDate(
				moment.getUTCFullYear(),
				moment.getUTCMonth() + 1,
				day,
			),
		};
	});
};
