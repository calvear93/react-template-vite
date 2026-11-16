import { describe, expect, test } from 'vitest';
import { computePosition } from './position.ts';

const VIEWPORT = { height: 800, width: 1280 };
const POPUP = { height: 200, width: 240 };
const anchorAt = (top: number, left = 100, width = 120) => ({
	height: 40,
	left,
	top,
	width,
});

describe(computePosition, () => {
	test('goes below its anchor, lined up with its start', () => {
		expect(computePosition(anchorAt(100), POPUP, VIEWPORT)).toStrictEqual({
			left: 100,
			maxHeight: 648,
			side: 'bottom',
			top: 144,
		});
	});

	test('flips above when it does not fit below and there is more room above', () => {
		expect(computePosition(anchorAt(700), POPUP, VIEWPORT)).toStrictEqual({
			left: 100,
			maxHeight: 688,
			side: 'top',
			top: 496,
		});
	});

	test('stays below when above is even smaller, and keeps a minimum height', () => {
		const position = computePosition(
			anchorAt(60),
			{ height: 900, width: 240 },
			{ height: 200, width: 1280 },
		);

		expect(position.side).toBe('bottom');
		expect(position.top).toBe(104);
		expect(position.maxHeight).toBe(120);
	});

	test('never goes over the top edge when it flips', () => {
		const position = computePosition(
			anchorAt(300),
			{ height: 600, width: 240 },
			{ height: 400, width: 1280 },
			{ minHeight: 400 },
		);

		expect(position.side).toBe('top');
		expect(position.top).toBe(8);
	});

	test('lines up with the end of its anchor', () => {
		expect(
			computePosition(anchorAt(100, 1000), POPUP, VIEWPORT, {
				align: 'end',
			}).left,
		).toBe(880);
	});

	test.each([
		{ case: 'the right edge', expected: 1032, left: 1200 },
		{ case: 'the left edge', expected: 8, left: -50 },
	])('stays inside $case of the viewport', ({ expected, left }) => {
		expect(computePosition(anchorAt(100, left), POPUP, VIEWPORT).left).toBe(
			expected,
		);
	});

	test('takes the width of its anchor when asked', () => {
		expect(
			computePosition(anchorAt(100, 100, 320), POPUP, VIEWPORT, {
				matchWidth: true,
			}),
		).toMatchObject({ left: 100, width: 320 });
	});

	test('is limited to the height given, and uses it to decide the side', () => {
		const position = computePosition(
			anchorAt(560),
			{ height: 600, width: 240 },
			VIEWPORT,
			{ maxHeight: 180 },
		);

		expect(position).toMatchObject({ maxHeight: 180, side: 'bottom' });
	});

	test('takes the gap and the margin given', () => {
		expect(
			computePosition(anchorAt(100), POPUP, VIEWPORT, {
				gap: 10,
				margin: 20,
			}),
		).toMatchObject({ maxHeight: 630, top: 150 });
	});

	test('goes above when that is the side it prefers, and below when it does not fit there', () => {
		expect(
			computePosition(anchorAt(400), POPUP, VIEWPORT, { side: 'top' }),
		).toMatchObject({ side: 'top', top: 196 });
		expect(
			computePosition(anchorAt(60), POPUP, VIEWPORT, { side: 'top' }),
		).toMatchObject({ side: 'bottom', top: 104 });
	});

	test.each([
		{ align: 'center', left: 40 },
		{ align: 'end', left: -20 + 8 + 20 },
	] as const)('lines up with the $align of its anchor', ({ align, left }) => {
		// anchor from 100 to 220: its center is 160, its end 220
		expect(
			computePosition(anchorAt(100), POPUP, VIEWPORT, { align }).left,
		).toBe(left);
	});

	test.each([
		{ expected: 'right', left: 100, side: 'right', x: 224 },
		{ expected: 'left', left: 600, side: 'left', x: 356 },
		// no room at the left of an anchor near the edge: it goes across
		{ expected: 'right', left: 100, side: 'left', x: 224 },
		{ expected: 'left', left: 1100, side: 'right', x: 856 },
	] as const)(
		'goes to the $side of its anchor at $left, or across: $expected',
		({ expected, left, side, x }) => {
			const position = computePosition(
				anchorAt(300, left),
				POPUP,
				VIEWPORT,
				{
					side,
				},
			);

			// centered on the anchor (300 to 340): from 220 to 420
			expect(position).toMatchObject({
				left: x,
				side: expected,
				top: 220,
			});
		},
	);

	test('keeps a popup beside its anchor inside the viewport', () => {
		expect(
			computePosition(anchorAt(10), POPUP, VIEWPORT, { side: 'right' })
				.top,
		).toBe(8);
		expect(
			computePosition(anchorAt(780), POPUP, VIEWPORT, { side: 'right' })
				.top,
		).toBe(592);
	});
});
