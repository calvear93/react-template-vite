import { describe, expect, test } from 'vitest';
import { inChile } from '../__mocks__/locale.mock.ts';
import {
	clampTime,
	isTimeWithin,
	maskTypedTime,
	nowTime,
	parseTypedTime,
	timeParts,
	timeSlots,
	toTime,
} from './time.ts';

inChile();

describe(toTime, () => {
	test.each([
		[0, 0, '00:00'],
		[9, 5, '09:05'],
		[23, 59, '23:59'],
	])('writes %i h %i min as %s', (hours, minutes, time) => {
		expect(toTime(hours, minutes)).toBe(time);
	});
});

describe(timeParts, () => {
	test('reads the hours and the minutes of a time', () => {
		expect(timeParts('14:35')).toStrictEqual({ hours: 14, minutes: 35 });
		expect(timeParts('00:00')).toStrictEqual({ hours: 0, minutes: 0 });
	});

	test.each(['24:00', '12:60', '9:30', '0930', '', null, undefined])(
		'has nothing for %j',
		(value) => {
			expect(timeParts(value)).toBeUndefined();
		},
	);
});

describe(maskTypedTime, () => {
	test.each([
		['', ''],
		['1', '1'],
		['14', '14'],
		['143', '14:3'],
		['1435', '14:35'],
		// every digit: with more than a time has it is no time, and none is cut to make one
		['14359', '14:359'],
		['14:35', '14:35'],
		['14.35', '14:35'],
		['9:', '09'],
		['9:3', '09:3'],
		['9.30', '09:30'],
		[' 0930 ', '09:30'],
		['9:30 ', '09:30'],
		// no «h:mm»: its digits are read as they come, none is moved by a zero
		['0:9:30', '09:30'],
		['0:9:3', '09:3'],
	])('shapes %j as %j', (typed, masked) => {
		expect(maskTypedTime(typed)).toBe(masked);
	});

	// in a field: an hour of one digit gets its zero when something was just typed or
	// pasted, never when a digit was taken away
	test.each([
		// «:» typed after «9», and «9:30» pasted
		['9:', 1, 2, '09'],
		['9:30', 0, 4, '09:30'],
		// the hour of «09:30» selected and typed over
		['8:30', 0, 1, '08:30'],
		// a separator typed in a time that is no «h:mm» with it
		['0:9:30', 1, 2, '09:30'],
		['0:9:3', 1, 2, '09:3'],
		['09::30', 2, 3, '09:30'],
		['09:3:0', 4, 5, '09:30'],
		// a digit taken away: nothing was put in, the rest are read as they come
		['0:30', 1, 1, '03:0'],
		['9:30', 0, 0, '93:0'],
		['0:3', 1, 1, '03'],
	])(
		'shapes %j, where %i to %i was just typed or pasted, as %j',
		(typed, start, end, masked) => {
			expect(maskTypedTime(typed, { end, start })).toBe(masked);
		},
	);

	test('leaves what is not a time as it was typed', () => {
		expect(maskTypedTime('mediodía')).toBe('mediodía');
		expect(maskTypedTime('14h')).toBe('14h');
	});
});

describe(parseTypedTime, () => {
	test.each([
		['14:35', '14:35'],
		['1435', '14:35'],
		['9:05', '09:05'],
		['00:00', '00:00'],
		['23.59', '23:59'],
	])('reads %j as %s', (typed, time) => {
		expect(parseTypedTime(typed)).toBe(time);
	});

	test.each([
		'',
		'14',
		'14:3',
		'24:00',
		'12:60',
		'930',
		'14359',
		'14:359',
		'ahora',
	])('has nothing for %j', (typed) => {
		expect(parseTypedTime(typed)).toBeUndefined();
	});
});

describe(nowTime, () => {
	test('says the time of an instant in Chile', () => {
		// 17:35 UTC is 14:35 in Santiago in summer time
		expect(nowTime(Date.UTC(2026, 10, 15, 17, 35))).toBe('14:35');
		expect(nowTime(new Date(Date.UTC(2026, 10, 15, 3, 5)))).toBe('00:05');
	});

	test('says a time of now', () => {
		expect(timeParts(nowTime())).toBeDefined();
	});
});

describe(timeSlots, () => {
	test('lists the times of a day at its interval', () => {
		expect(timeSlots(30)).toHaveLength(48);
		expect(timeSlots(30).slice(0, 3)).toStrictEqual([
			'00:00',
			'00:30',
			'01:00',
		]);
		expect(timeSlots(30).at(-1)).toBe('23:30');
		expect(timeSlots(360)).toStrictEqual([
			'00:00',
			'06:00',
			'12:00',
			'18:00',
		]);
	});

	test('takes an interval that does not divide the day, and at least a minute', () => {
		expect(timeSlots(420)).toStrictEqual([
			'00:00',
			'07:00',
			'14:00',
			'21:00',
		]);
		expect(timeSlots(0)).toHaveLength(1440);
	});
});

describe(clampTime, () => {
	test.each([
		['09:30', undefined, undefined, '09:30'],
		['08:00', '08:30', '18:00', '08:30'],
		['18:45', '08:30', '18:00', '18:00'],
		['12:00', '08:30', '18:00', '12:00'],
		['08:30', '08:30', undefined, '08:30'],
		['23:59', undefined, '18:00', '18:00'],
	])('%s within %s and %s is %s', (value, min, max, clamped) => {
		expect(clampTime(value, min, max)).toBe(clamped);
	});
});

describe(isTimeWithin, () => {
	test.each([
		['09:30', undefined, undefined, true],
		['09:30', '09:30', '18:00', true],
		['09:29', '09:30', undefined, false],
		['18:01', undefined, '18:00', false],
		['18:00', '09:30', '18:00', true],
	])('%s within %s and %s: %s', (value, min, max, isWithin) => {
		expect(isTimeWithin(value, min, max)).toBe(isWithin);
	});
});
