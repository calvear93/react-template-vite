import { describe, expect, test } from 'vitest';
import { inChile } from '../__mocks__/locale.mock.ts';
import {
	formatDate,
	formatDateTime,
	formatRelative,
	formatTime,
} from './date.ts';
import { formatNumber } from './number.ts';

inChile();

const EMPTY = '—';
const FORMATS = 'formats %j as %s';

describe(formatDate, () => {
	test.each([
		['2026-11-05', '05-11-2026'],
		// 02:30 UTC is still the day before in Chile
		['2026-11-05T02:30:00Z', '04-11-2026'],
		[new Date('2026-07-01T16:00:00Z'), '01-07-2026'],
		[Date.UTC(2026, 0, 15, 12), '15-01-2026'],
		['no es fecha', 'no es fecha'],
		['', EMPTY],
		[null, EMPTY],
		[undefined, EMPTY],
	])(FORMATS, (value, expected) => {
		expect(formatDate(value)).toBe(expected);
	});
});

describe(formatTime, () => {
	test.each([
		['08:30:00', '08:30'],
		// winter in Chile is UTC-4
		['2026-07-01T16:05:00Z', '12:05'],
		[new Date('2026-07-01T03:00:00Z'), '23:00'],
		['pronto', 'pronto'],
		['', EMPTY],
		[null, EMPTY],
	])(FORMATS, (value, expected) => {
		expect(formatTime(value)).toBe(expected);
	});
});

describe(formatDateTime, () => {
	test.each([
		['2026-07-01T16:05:00Z', '01-07-2026 12:05'],
		[Date.UTC(2026, 6, 1, 3), '30-06-2026 23:00'],
		['ayer', 'ayer'],
		['', EMPTY],
		[undefined, EMPTY],
	])(FORMATS, (value, expected) => {
		expect(formatDateTime(value)).toBe(expected);
	});
});

describe(formatRelative, () => {
	const now = Date.UTC(2026, 6, 1, 16);

	test.each([
		[now - 20_000, 'ahora'],
		// later than now, the clock of whoever wrote it a little ahead
		[now + 90_000, 'ahora'],
		[now - 60_000, 'hace 1 min'],
		[now - 5 * 60_000, 'hace 5 min'],
		[now - 61 * 60_000, 'hace 1 h'],
		[now - 2 * 3_600_000, 'hace 2 h'],
		[now - 26 * 3_600_000, '30-06-2026 10:00'],
		[new Date(now - 59 * 60_000).toISOString(), 'hace 59 min'],
		['nunca', 'nunca'],
		['', EMPTY],
		[null, EMPTY],
	])('says %j as «%s»', (value, expected) => {
		expect(formatRelative(value, now)).toBe(expected);
	});

	test('compares with the present by default', () => {
		expect(formatRelative(Date.now())).toBe('ahora');
	});
});

describe(formatNumber, () => {
	test.each([
		[12_345, '12.345'],
		[1234.5, '1.234,5'],
		[0, '0'],
		[null, '0'],
		[undefined, '0'],
	])(FORMATS, (value, expected) => {
		expect(formatNumber(value)).toBe(expected);
	});
});
