import { describe, expect, test } from 'vitest';
import { inChile } from '../__mocks__/locale.mock.ts';
import {
	addDays,
	addMonths,
	clampIsoDate,
	displayIsoDate,
	isoDateParts,
	maskPastedDate,
	maskTypedDate,
	monthNames,
	parseTypedDate,
	spokenDate,
	todayIso,
	toIsoDate,
	weekdayNames,
	weekdayOf,
} from './iso-date.ts';

inChile();

const DAY = '2026-11-05';
const TYPED = '05-11-2026';
const LEAP_DAY = '2024-02-29';
describe(isoDateParts, () => {
	test.each([
		[DAY, [2026, 11, 5]],
		[LEAP_DAY, [2024, 2, 29]],
		['2026-02-29', undefined],
		['2026-04-31', undefined],
		['2026-13-01', undefined],
		[TYPED, undefined],
		['', undefined],
		[null, undefined],
	])('reads %j as %j', (value, expected) => {
		expect(isoDateParts(value)).toStrictEqual(expected);
	});
});

describe(toIsoDate, () => {
	test('pads the month, the day and the year', () => {
		expect(toIsoDate(2026, 3, 7)).toBe('2026-03-07');
		expect(toIsoDate(987, 12, 31)).toBe('0987-12-31');
	});
});

describe(todayIso, () => {
	test.each([
		// 02:30 UTC is still the day before in Chile
		['2026-11-05T02:30:00Z', '2026-11-04'],
		['2026-07-01T16:00:00Z', '2026-07-01'],
		['2026-12-31T23:30:00-03:00', '2026-12-31'],
	])('is the day in Chile at %s: %s', (moment, expected) => {
		expect(todayIso(new Date(moment))).toBe(expected);
	});

	test('reads the present by default', () => {
		expect(todayIso()).toMatch(/^\d{4}-\d{2}-\d{2}$/u);
	});
});

describe(displayIsoDate, () => {
	test.each([
		[DAY, TYPED],
		['2026-02-30', ''],
		['', ''],
		[undefined, ''],
	])('shows %j as %j', (value, expected) => {
		expect(displayIsoDate(value)).toBe(expected);
	});
});

describe(maskTypedDate, () => {
	test.each([
		['', ''],
		['0', '0'],
		['05', '05'],
		['051', '05-1'],
		['0511', '05-11'],
		['05112026', TYPED],
		['05/11/2026', TYPED],
		// key by key the digits come one after another: a date written whole, with a
		// day or a month of one digit, is for `maskPastedDate`
		['5.11.2026', '51-12-026'],
		// every digit: with more than a date has it is no date, and none is cut to make one
		['051120269999', '05-11-20269999'],
		['mañana', 'mañana'],
	])('masks %j as %j', (text, expected) => {
		expect(maskTypedDate(text)).toBe(expected);
	});
});

describe(maskPastedDate, () => {
	test.each([
		['5/11/2026', TYPED],
		['5-11-2026', TYPED],
		['5.11.2026', TYPED],
		['5 11 2026', TYPED],
		['05/11/2026', TYPED],
		[TYPED, TYPED],
		['  5/11/2026\n', TYPED],
		['5/1/2026', '05-01-2026'],
		['15/1/2026', '15-01-2026'],
		// as a system writes it, and as the picker itself gives it
		[DAY, TYPED],
		['2026-1-5', '05-01-2026'],
		['2026/11/05', TYPED],
		// whole, but no real date: it is shown as it was written, for the field to say so
		['31/2/2026', '31-02-2026'],
	])('writes %j, a date written whole, as %j', (text, expected) => {
		expect(maskPastedDate(text)).toBe(expected);
	});

	test.each([
		'',
		'5/11',
		'5/11/26',
		'05112026',
		'5/11/2026/1',
		'5/11/20261',
		'125/11/2026',
		'2026/11/5/1',
		'mañana',
		'el 5/11/2026',
	])('takes %j for no date written whole', (text) => {
		expect(maskPastedDate(text)).toBeUndefined();
	});
});

describe(parseTypedDate, () => {
	test.each([
		[TYPED, DAY],
		['05/11/2026', DAY],
		['05112026', DAY],
		['31-02-2026', undefined],
		['05-11-26', undefined],
		['051120269', undefined],
		['05-11-20269999', undefined],
		['', undefined],
		['mañana', undefined],
	])('parses %j as %j', (text, expected) => {
		expect(parseTypedDate(text)).toBe(expected);
	});
});

describe(addDays, () => {
	test.each([
		[DAY, 1, '2026-11-06'],
		['2026-11-30', 1, '2026-12-01'],
		['2026-01-01', -1, '2025-12-31'],
		['2024-02-28', 2, '2024-03-01'],
		[DAY, 0, DAY],
	])('%s plus %i days is %s', (value, days, expected) => {
		expect(addDays(value, days)).toBe(expected);
	});

	test('refuses what is not a date', () => {
		expect(() => addDays('ayer', 1)).toThrow(RangeError);
	});
});

describe(addMonths, () => {
	test.each([
		[DAY, 1, '2026-12-05'],
		['2026-12-05', 1, '2027-01-05'],
		['2026-01-31', 1, '2026-02-28'],
		['2024-01-31', 1, LEAP_DAY],
		['2026-03-31', -1, '2026-02-28'],
		[DAY, -12, '2025-11-05'],
		[LEAP_DAY, 12, '2025-02-28'],
	])('%s plus %i months is %s', (value, months, expected) => {
		expect(addMonths(value, months)).toBe(expected);
	});
});

describe(weekdayOf, () => {
	test.each([
		['2026-11-02', 0],
		[DAY, 3],
		['2026-11-08', 6],
	])('%s is weekday %i, from Monday', (value, expected) => {
		expect(weekdayOf(value)).toBe(expected);
	});
});

describe('monthNames and weekdayNames', () => {
	test('are the names the language gives them, the week from Monday', () => {
		const months = monthNames();

		expect(months).toHaveLength(12);
		expect([months[0], months[8], months[11]]).toStrictEqual([
			'enero',
			'septiembre',
			'diciembre',
		]);
		expect(weekdayNames()).toStrictEqual([
			'lunes',
			'martes',
			'miércoles',
			'jueves',
			'viernes',
			'sábado',
			'domingo',
		]);
	});

	test('name the weekday that weekdayOf counts', () => {
		// a Thursday
		expect(weekdayNames()[weekdayOf(DAY)]).toBe('jueves');
		expect(spokenDate(DAY).startsWith('jueves')).toBe(true);
	});
});

describe(spokenDate, () => {
	test.each([
		[DAY, 'jueves, 5 de noviembre de 2026'],
		['2026-01-01', 'jueves, 1 de enero de 2026'],
		[LEAP_DAY, 'jueves, 29 de febrero de 2024'],
		['2026-11-08', 'domingo, 8 de noviembre de 2026'],
	])('says %s as «%s»', (value, expected) => {
		expect(spokenDate(value)).toBe(expected);
	});
});

describe(clampIsoDate, () => {
	test.each([
		[DAY, undefined, undefined, DAY],
		[DAY, '2026-11-10', undefined, '2026-11-10'],
		[DAY, undefined, '2026-11-01', '2026-11-01'],
		[DAY, '2026-11-01', '2026-11-30', DAY],
	])('keeps %s within %s and %s: %s', (value, min, max, expected) => {
		expect(clampIsoDate(value, min, max)).toBe(expected);
	});
});
