import { afterEach, describe, expect, test } from 'vitest';
import { plural } from '../internal/plural.ts';
import {
	formatDate,
	formatDateTime,
	formatRelative,
	formatTime,
} from './date.ts';
import {
	datePattern,
	displayIsoDate,
	firstWeekday,
	maskPastedDate,
	maskTypedDate,
	monthNames,
	parseTypedDate,
	spokenDate,
	todayIso,
	weekdayNames,
	weekdayOf,
} from './iso-date.ts';
import { configureLocale } from './locale.ts';
import { shortName } from './name.ts';
import { formatNumber } from './number.ts';
import { nowTime } from './time.ts';

const DAY = '2026-11-05';
/** That day, as the United States writes it. */
const US_DAY = '11/05/2026';
const US = 'en-US';
const UK = 'en-GB';
const CHILE = 'es-CL';
const GERMANY = 'de-DE';
const JAPAN = 'ja-JP';

/** Half past two in the morning in UTC: the day before in New York, the same day in Tokyo. */
const NIGHT = '2026-11-05T02:30:00Z';

describe(datePattern, () => {
	test.each([
		[US, ['month', 'day', 'year'], '/'],
		[UK, ['day', 'month', 'year'], '/'],
		[CHILE, ['day', 'month', 'year'], '-'],
		[GERMANY, ['day', 'month', 'year'], '.'],
		[JAPAN, ['year', 'month', 'day'], '/'],
	])('says how %s writes a date in figures', (locale, order, separator) => {
		expect(datePattern(locale)).toStrictEqual({ order, separator });
	});

	test('is the one of the United States for an app that says nothing', () => {
		expect(datePattern()).toStrictEqual(datePattern(US));
	});
});

describe('a date, as each place writes it', () => {
	test.each([
		[US, US_DAY],
		[UK, '05/11/2026'],
		[CHILE, '05-11-2026'],
		[GERMANY, '05.11.2026'],
		[JAPAN, '2026/11/05'],
	])('is shown in %s as «%s», and read back from it', (locale, text) => {
		expect(displayIsoDate(DAY, locale)).toBe(text);
		expect(formatDate(DAY, locale)).toBe(text);
		expect(parseTypedDate(text, locale)).toBe(DAY);
		expect(maskTypedDate(text.replaceAll(/\D/gu, ''), locale)).toBe(text);
	});

	test.each([
		[US, '1105', '11/05'],
		[US, '11052', '11/05/2'],
		[JAPAN, '20261', '2026/1'],
		[JAPAN, '202611', '2026/11'],
		[GERMANY, '0511202', '05.11.202'],
	])(
		'gets its separators in %s while «%s» is typed: «%s»',
		(locale, typed, masked) => {
			expect(maskTypedDate(typed, locale)).toBe(masked);
		},
	);

	test.each([
		// its parts in the order of the place, a day or a month of one digit
		[US, '11/5/2026', US_DAY],
		[US, '1-5-2026', '01/05/2026'],
		[JAPAN, '2026.11.5', '2026/11/05'],
		// as a system writes it, wherever
		[US, DAY, US_DAY],
		[GERMANY, '2026-1-5', '05.01.2026'],
		// whole, but no real date: shown as written, for the field to say so
		[US, '13/45/2026', '13/45/2026'],
	])(
		'reads in %s the date «%s», pasted whole, as «%s»',
		(locale, pasted, text) => {
			expect(maskPastedDate(pasted, locale)).toBe(text);
		},
	);

	test.each([
		[US, '11/5'],
		[US, '11/5/26'],
		[JAPAN, '26/11/5'],
	])('takes in %s «%s» for no date written whole', (locale, pasted) => {
		expect(maskPastedDate(pasted, locale)).toBeUndefined();
	});

	test('reads no date from one written as another place does', () => {
		// the 25th is no month
		expect(parseTypedDate('25/11/2026', US)).toBeUndefined();
		expect(parseTypedDate('25/11/2026', UK)).toBe('2026-11-25');
	});
});

describe('a week, as each place starts it', () => {
	test.each([
		[US, 6],
		[UK, 0],
		[CHILE, 0],
		[GERMANY, 0],
	])('starts in %s on day %i, counted from Monday', (locale, day) => {
		expect(firstWeekday(locale)).toBe(day);
	});

	test('names its days from the one it starts on', () => {
		expect(weekdayNames(US)).toStrictEqual([
			'Sunday',
			'Monday',
			'Tuesday',
			'Wednesday',
			'Thursday',
			'Friday',
			'Saturday',
		]);
		expect(weekdayNames(UK).at(0)).toBe('Monday');
	});

	test.each([
		// a Thursday
		[DAY, US, 4],
		[DAY, UK, 3],
		// a Sunday
		['2026-11-08', US, 0],
		['2026-11-08', UK, 6],
	])('counts %s in %s as day %i of its week', (value, locale, day) => {
		expect(weekdayOf(value, locale)).toBe(day);
		expect(weekdayNames(locale)[weekdayOf(value, locale)]).toBe(
			spokenDate(value, locale).split(',')[0],
		);
	});
});

describe('what the kit writes for an app that says nothing', () => {
	// hooks
	afterEach(() => configureLocale({}));

	// tests
	test('is in English', () => {
		expect(monthNames().slice(0, 2)).toStrictEqual(['January', 'February']);
		expect(spokenDate(DAY)).toBe('Thursday, November 5, 2026');
		expect(formatNumber(12_345.6)).toBe('12,345.6');
		expect(plural(1, 'result', 'results')).toBe('result');
		expect(plural(0, 'result', 'results')).toBe('results');
	});

	test('says how long ago in English, and the date and the time after a day', () => {
		const now = Date.parse('2026-11-05T12:00:00Z');

		configureLocale({ timeZone: 'UTC' });

		expect(formatRelative(now - 20_000, now)).toBe('now');
		expect(formatRelative(now - 5 * 60_000, now)).toBe('5 min. ago');
		expect(formatRelative(now - 2 * 3_600_000, now)).toBe('2 hr. ago');
		expect(formatRelative(now - 48 * 3_600_000, now)).toBe(
			'11/03/2026 12:00',
		);
		expect(formatRelative(now - 5 * 60_000, now, CHILE)).toBe('hace 5 min');
	});

	test.each([
		['America/New_York', '2026-11-04', '11/04/2026', '21:30'],
		['UTC', DAY, US_DAY, '02:30'],
		['Asia/Tokyo', DAY, US_DAY, '11:30'],
	])(
		'reads the day and the time of a moment in the time zone of the app (%s)',
		(timeZone, today, date, time) => {
			configureLocale({ timeZone });

			expect(todayIso(Date.parse(NIGHT))).toBe(today);
			expect(formatDate(NIGHT)).toBe(date);
			expect(formatTime(NIGHT)).toBe(time);
			expect(nowTime(Date.parse(NIGHT))).toBe(time);
			expect(formatDateTime(NIGHT, UK)).toBe(
				`${displayIsoDate(today, UK)} ${time}`,
			);
		},
	);

	test.each([
		['John Ronald Reuel Tolkien', 'John Tolkien'],
		['Tolkien, John Ronald', 'John Tolkien'],
		['LUDWIG VAN BEETHOVEN', 'Ludwig van Beethoven'],
		['Cher', 'Cher'],
		['', ''],
	])(
		'shortens the name «%s» to «%s»: its first word and its last',
		(name, short) => {
			expect(shortName(name)).toBe(short);
		},
	);

	test('shortens a name as its language does when it is told which', () => {
		expect(shortName('Ana María Pérez Soto', {}, CHILE)).toBe('Ana Pérez');
		expect(shortName('Ana María Pérez Soto', {}, US)).toBe('Ana Soto');
	});
});
