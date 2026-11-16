import { describe, expect, test } from 'vitest';
import { inChile } from '../../__mocks__/locale.mock.ts';
import {
	addDays,
	spokenDate,
	toIsoDate,
	weekdayOf,
} from '../../format/iso-date.ts';
import { monthDays, monthLabel, weekdayLabels } from './calendar.model.ts';

inChile();

describe(weekdayLabels, () => {
	test('are the short names of the week, from Monday', () => {
		expect(weekdayLabels()).toStrictEqual([
			'lun',
			'mar',
			'mié',
			'jue',
			'vie',
			'sáb',
			'dom',
		]);
	});
});

describe(monthLabel, () => {
	test.each([
		[2026, 11, 'noviembre de 2026'],
		[2027, 1, 'enero de 2027'],
		[2024, 9, 'septiembre de 2024'],
	])('says the month %i-%i as «%s»', (year, month, label) => {
		expect(monthLabel(year, month)).toBe(label);
	});
});

describe(monthDays, () => {
	test('gives six weeks from the Monday of the week of the first day', () => {
		const days = monthDays(2026, 11);

		expect(days).toHaveLength(42);
		expect(days[0]).toStrictEqual({
			date: '2026-10-26',
			day: 26,
			spoken: 'lunes, 26 de octubre de 2026',
		});
		expect(days[6]?.date).toBe('2026-11-01');
		expect(days[41]?.date).toBe('2026-12-06');
	});

	test('starts on the first day of a month that starts on a Monday', () => {
		expect(monthDays(2026, 6)[0]?.date).toBe('2026-06-01');
	});

	test('crosses the year at both ends', () => {
		const january = monthDays(2027, 1);
		const december = monthDays(2026, 12);

		expect(january[0]?.date).toBe('2026-12-28');
		expect(december[41]?.date).toBe('2027-01-10');
		expect(december[41]?.spoken).toBe('domingo, 10 de enero de 2027');
	});

	test('counts the 29th of February of a leap year', () => {
		const dates = monthDays(2028, 2).map(({ date }) => date);

		expect(dates).toContain('2028-02-29');
		expect(monthDays(2027, 2).map(({ date }) => date)).not.toContain(
			'2027-02-29',
		);
	});

	test('gives the days the dates read one by one give, over twenty years', () => {
		for (let year = 2015; year < 2035; year += 1)
			for (let month = 1; month <= 12; month += 1) {
				const first = toIsoDate(year, month, 1);
				const start = addDays(first, -weekdayOf(first));
				const expected = Array.from({ length: 42 }, (_, index) => {
					const date = addDays(start, index);

					return {
						date,
						day: Number(date.slice(8)),
						spoken: spokenDate(date),
					};
				});

				expect(monthDays(year, month)).toStrictEqual(expected);
			}
	});
});
