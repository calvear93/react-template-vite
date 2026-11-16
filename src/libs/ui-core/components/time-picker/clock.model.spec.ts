import { describe, expect, test } from 'vitest';
import {
	handOf,
	hourAt,
	hourMarks,
	minuteAt,
	minuteMarks,
	placeOf,
} from './clock.model.ts';

const RADIUS = 100;

/** A point of the dial: at this angle (clockwise from the top) and distance. */
const point = (angle: number, distance: number) => {
	const turn = (angle * Math.PI) / 180;

	return [Math.sin(turn) * distance, -Math.cos(turn) * distance] as const;
};

describe(hourMarks, () => {
	test('lists the 24 hours in order, 1 to 12 outside and the rest inside', () => {
		const marks = hourMarks();

		expect(marks.map((mark) => mark.value)).toStrictEqual(
			Array.from({ length: 24 }, (_, hour) => hour),
		);
		expect(
			marks
				.filter((mark) => mark.ring === 'outer')
				.map((mark) => mark.value),
		).toStrictEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
		expect(marks[0]).toMatchObject({
			angle: 0,
			label: '00',
			ring: 'inner',
		});
		expect(marks[12]).toMatchObject({
			angle: 0,
			label: '12',
			ring: 'outer',
		});
		expect(marks[15]).toMatchObject({
			angle: 90,
			label: '15',
			ring: 'inner',
		});
	});
});

describe(minuteMarks, () => {
	test('lists the minutes of its step, numbered every five', () => {
		expect(minuteMarks(5).map((mark) => mark.label)).toStrictEqual([
			'00',
			'05',
			'10',
			'15',
			'20',
			'25',
			'30',
			'35',
			'40',
			'45',
			'50',
			'55',
		]);
		expect(minuteMarks(5).every((mark) => mark.isNumbered)).toBe(true);
		expect(minuteMarks(15).map((mark) => mark.angle)).toStrictEqual([
			0, 90, 180, 270,
		]);
	});

	test('marks every minute, most of them as dots', () => {
		const marks = minuteMarks(1);

		expect(marks).toHaveLength(60);
		expect(marks.filter((mark) => mark.isNumbered)).toHaveLength(12);
		expect(marks[7]).toMatchObject({
			angle: 42,
			isNumbered: false,
			value: 7,
		});
	});

	test.each([
		[0, 60],
		[45, 2],
		[2.9, 30],
	])('keeps a step of %d within reason: %i marks', (step, count) => {
		expect(minuteMarks(step)).toHaveLength(count);
	});
});

describe(hourAt, () => {
	test.each([
		[0, 90, 12],
		[30, 90, 1],
		[90, 90, 3],
		[180, 90, 6],
		[330, 90, 11],
		[0, 50, 0],
		[30, 50, 13],
		[180, 50, 18],
		[330, 50, 23],
		// between two hours it is the nearest one
		[44, 90, 1],
		[46, 90, 2],
		[352, 90, 12],
	])('at %i° and %i%% of the radius it is %i h', (angle, distance, hour) => {
		expect(hourAt(...point(angle, distance), RADIUS)).toBe(hour);
	});
});

describe(minuteAt, () => {
	test.each([
		[0, 5, 0],
		[90, 5, 15],
		[180, 5, 30],
		[270, 5, 45],
		[100, 5, 15],
		[110, 5, 20],
		[358, 5, 0],
		[42, 1, 7],
		[100, 15, 15],
		[140, 15, 30],
	])('at %i° with a step of %i it is minute %i', (angle, step, minute) => {
		expect(minuteAt(...point(angle, 80), step)).toBe(minute);
	});

	// a step that does not divide the hour: the last mark is not a whole step from the top
	test.each([
		[180, 7, 28],
		[342, 7, 56],
		[351, 7, 0],
		[358, 7, 0],
		[336, 9, 54],
		[348, 9, 0],
	])(
		'at %i° with a step of %i it is the mark that is nearest, minute %i',
		(angle, step, minute) => {
			expect(minuteAt(...point(angle, 80), step)).toBe(minute);
		},
	);

	test.each([7, 9, 11, 13, 25])(
		'gives one of its marks all around the face with a step of %i',
		(step) => {
			const marks = new Set(minuteMarks(step).map(({ value }) => value));

			for (let angle = 0; angle < 360; angle += 1)
				expect(marks).toContain(minuteAt(...point(angle, 80), step));
		},
	);
});

describe(handOf, () => {
	test.each([
		[true, 3, { angle: 90, ring: 'outer' }],
		[true, 12, { angle: 0, ring: 'outer' }],
		[true, 0, { angle: 0, ring: 'inner' }],
		[true, 21, { angle: 270, ring: 'inner' }],
		[false, 15, { angle: 90, ring: 'outer' }],
		[false, 37, { angle: 222, ring: 'outer' }],
	])('points (hours: %s) at %i', (isHours, value, hand) => {
		expect(handOf(isHours, value)).toStrictEqual(hand);
	});
});

describe(placeOf, () => {
	test('puts a mark on its ring, around the center of the dial', () => {
		expect(placeOf({ angle: 0, ring: 'outer' })).toStrictEqual({
			left: '50.000%',
			top: '9.000%',
		});
		expect(placeOf({ angle: 90, ring: 'outer' })).toStrictEqual({
			left: '91.000%',
			top: '50.000%',
		});
		expect(placeOf({ angle: 180, ring: 'inner' })).toStrictEqual({
			left: '50.000%',
			top: '76.000%',
		});
	});
});
