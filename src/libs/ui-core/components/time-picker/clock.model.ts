/** Where the numbers of a ring sit, as a share of the radius of the dial. */
export const RINGS = { inner: 0.52, outer: 0.82 } as const;

/** Nearer the center than this share of the radius is the inner ring of the hours. */
const INNER_LIMIT = 0.67;

export type ClockRing = keyof typeof RINGS;

/** A value of a clock face: where it is drawn and what it reads as. */
export interface ClockMark {
	/** Clockwise from twelve o'clock, in degrees. */
	angle: number;
	/** Shown as a number; the minutes between two numbers are dots. */
	isNumbered: boolean;
	label: string;
	ring: ClockRing;
	value: number;
}

const pad = (value: number) => String(value).padStart(2, '0');

/**
 * The 24 hours of a clock face, in order: 1 to 12 on the outer ring (12 on top)
 * and 13 to 23 with 00 on the inner one (00 on top).
 *
 * @returns the hours, from 0 to 23
 */
export const hourMarks = (): ClockMark[] =>
	Array.from({ length: 24 }, (_, hour) => ({
		angle: (hour % 12) * 30,
		isNumbered: true,
		label: pad(hour),
		ring: hour >= 1 && hour <= 12 ? 'outer' : 'inner',
		value: hour,
	}));

/**
 * The minutes of a clock face, one every `step`: those that are a multiple of
 * five carry their number, the others are dots between them.
 *
 * @param step - minutes between one mark and the next (1 to 30)
 *
 * @returns the minutes, in order
 */
export const minuteMarks = (step: number): ClockMark[] => {
	const every = Math.min(30, Math.max(1, Math.trunc(step)));

	return Array.from({ length: Math.ceil(60 / every) }, (_, index) => ({
		angle: index * every * 6,
		isNumbered: (index * every) % 5 === 0,
		label: pad(index * every),
		ring: 'outer' as const,
		value: index * every,
	}));
};

/**
 * Where the hand of the face points for a value: its angle and the ring it
 * reaches. A minute between two marks has its own angle.
 *
 * @param isHours - whether the face shows the hours (the minutes otherwise)
 * @param value - the hour or the minute chosen
 *
 * @returns the angle, clockwise from twelve o'clock, and the ring
 */
export const handOf = (
	isHours: boolean,
	value: number,
): Pick<ClockMark, 'angle' | 'ring'> =>
	isHours
		? {
				angle: (value % 12) * 30,
				ring: value >= 1 && value <= 12 ? 'outer' : 'inner',
			}
		: { angle: value * 6, ring: 'outer' };

/** The angle of a point around the center, clockwise from twelve o'clock, 0 to 360. */
const angleOf = (dx: number, dy: number) =>
	(Math.atan2(dx, -dy) * (180 / Math.PI) + 360) % 360;

/**
 * The hour under a point of the dial: its direction says which of the twelve, its
 * distance to the center which ring.
 *
 * @example
 * ```ts
 * hourAt(0, -90, 100); // 12 (straight up, outer ring)
 * hourAt(0, -50, 100); // 0 (straight up, inner ring)
 * ```
 *
 * @param dx - the point, from the center, to the right
 * @param dy - the point, from the center, downwards
 * @param radius - the radius of the dial
 *
 * @returns the hour, 0 to 23
 */
export const hourAt = (dx: number, dy: number, radius: number) => {
	const twelfth = Math.round(angleOf(dx, dy) / 30) % 12;
	const isInner = Math.hypot(dx, dy) < radius * INNER_LIMIT;

	if (isInner) return twelfth === 0 ? 0 : twelfth + 12;

	return twelfth === 0 ? 12 : twelfth;
};

/**
 * The minute under a point of the dial: the mark of the step that is nearest. With
 * a step that does not divide the hour the last mark is closer to the top than a
 * whole step (56 with a step of 7), and past halfway between them it is the top.
 *
 * @param dx - the point, from the center, to the right
 * @param dy - the point, from the center, downwards
 * @param step - minutes between one mark and the next
 *
 * @returns the minute of a mark, 0 to 59
 */
export const minuteAt = (dx: number, dy: number, step: number) => {
	const every = Math.min(30, Math.max(1, Math.trunc(step)));
	const minutes = angleOf(dx, dy) / 6;
	const last = (Math.ceil(60 / every) - 1) * every;

	if (minutes >= (last + 60) / 2) return 0;

	return Math.min(last, Math.round(minutes / every) * every);
};

/**
 * Where a mark goes inside the dial, as percentages of its box.
 *
 * @param mark - the mark: its angle and its ring
 *
 * @returns `left` and `top` of its center
 */
export const placeOf = ({ angle, ring }: Pick<ClockMark, 'angle' | 'ring'>) => {
	const turn = (angle * Math.PI) / 180;
	const reach = RINGS[ring] * 50;

	return {
		left: `${(50 + Math.sin(turn) * reach).toFixed(3)}%`,
		top: `${(50 - Math.cos(turn) * reach).toFixed(3)}%`,
	};
};
