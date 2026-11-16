import { formatTime } from './date.ts';

const pad = (value: number) => String(value).padStart(2, '0');

/**
 * A time of the day as `HH:mm`, 24 hours.
 *
 * @param hours - 0 to 23
 * @param minutes - 0 to 59
 *
 * @returns the time, zero-padded
 */
export const toTime = (hours: number, minutes: number) =>
	`${pad(hours)}:${pad(minutes)}`;

/**
 * The hours and the minutes of a time written as `HH:mm`.
 *
 * @example
 * ```ts
 * timeParts('14:35'); // { hours: 14, minutes: 35 }
 * timeParts('24:00'); // undefined
 * ```
 *
 * @param value - the time
 *
 * @returns its parts, or undefined when it is not a time of the day
 */
export const timeParts = (value: string | null | undefined) => {
	const match = /^(?<hours>\d{2}):(?<minutes>\d{2})$/u.exec(value ?? '');
	const hours = Number(match?.groups?.hours);
	const minutes = Number(match?.groups?.minutes);

	return match && hours < 24 && minutes < 60 ? { hours, minutes } : undefined;
};

/** As many digits as a time has: two of its hour, two of its minutes. */
export const TIME_DIGITS = 4;

/** A time with an hour of one digit: the hour, its separator, and two digits at most. */
const SHORT_HOUR = /^\d[.:]\d{0,2}\s*$/u;

/**
 * What is being typed as a time, shaped as hh:mm while it is typed: the colon
 * goes in by itself, and an hour typed with one digit before a colon («9:») gets
 * its zero. Anything that is not a time so far is left as typed.
 *
 * The zero is for a text that is «h:mm» and nothing else: in any other its digits are
 * read as they come, and none is moved («0:9:30», a colon typed after the first digit
 * of «09:30», is still 09:30). A field gives `inserted`, where what was just typed or
 * pasted is in its text: when that is nothing, a digit was taken away («0:30», the 9
 * of «09:30» gone), and a zero would take the place the next key is meant for.
 *
 * @example
 * ```ts
 * maskTypedTime('1435'); // '14:35'
 * maskTypedTime('9:3'); // '09:3'
 * maskTypedTime('0:30', { start: 1, end: 1 }); // '03:0': a digit was taken away
 * ```
 *
 * @param text - what was typed or pasted
 * @param inserted - where what was just typed or pasted starts and ends; without it,
 *   the text is read as one that was put in whole
 *
 * @returns the text as hh:mm so far
 */
export const maskTypedTime = (
	text: string,
	inserted?: { end: number; start: number },
) => {
	if (!/^[\s\d.:]*$/u.test(text)) return text;

	const typed = text.trimStart();
	const isPutIn = !inserted || inserted.end > inserted.start;
	// every digit: more than a time has make no time, and none is cut to make one
	const digits = (
		isPutIn && SHORT_HOUR.test(typed) ? `0${typed}` : typed
	).replaceAll(/\D/gu, '');

	return [digits.slice(0, 2), digits.slice(2)].filter(Boolean).join(':');
};

/**
 * What was typed (hh:mm, with a colon, a dot or none) as a time of the day.
 *
 * @example
 * ```ts
 * parseTypedTime('14:35'); // '14:35'
 * parseTypedTime('0930'); // '09:30'
 * parseTypedTime('25:00'); // undefined
 * ```
 *
 * @param text - the typed time
 *
 * @returns `HH:mm`, or undefined when it is not a complete, real time
 */
export const parseTypedTime = (text: string) => {
	const digits = maskTypedTime(text).replaceAll(/\D/gu, '');
	const value = `${digits.slice(0, 2)}:${digits.slice(2)}`;

	return digits.length === 4 && timeParts(value) ? value : undefined;
};

/**
 * The time it is now, in the time zone of the app, as `HH:mm`.
 *
 * @param now - the instant; now by default
 *
 * @returns the time of the day
 */
export const nowTime = (now: Date | number = Date.now()) => formatTime(now);

/**
 * The times of a day at a regular interval, from midnight: what a list of times
 * to pick from shows.
 *
 * @example
 * ```ts
 * timeSlots(30); // ['00:00', '00:30', '01:00', … '23:30']
 * ```
 *
 * @param interval - minutes between one time and the next (at least 1)
 *
 * @returns the times, in order
 */
export const timeSlots = (interval: number) => {
	const step = Math.max(1, Math.trunc(interval));

	return Array.from({ length: Math.ceil(1440 / step) }, (_, index) =>
		toTime(Math.trunc((index * step) / 60), (index * step) % 60),
	);
};

/**
 * A time kept within two others.
 *
 * @example
 * ```ts
 * clampTime('08:00', '08:30', '18:00'); // '08:30'
 * ```
 *
 * @param value - the time, as `HH:mm`
 * @param min - the earliest one allowed, if any
 * @param max - the latest one allowed, if any
 *
 * @returns the time, or the limit it went over
 */
export const clampTime = (value: string, min?: string, max?: string) => {
	if (min && value < min) return min;

	return max && value > max ? max : value;
};

/**
 * Whether a time is within two limits, either of which may be missing.
 *
 * @param value - the time, as `HH:mm`
 * @param min - the earliest one allowed
 * @param max - the latest one allowed
 *
 * @returns whether the time can be chosen
 */
export const isTimeWithin = (value: string, min?: string, max?: string) =>
	!(min && value < min) && !(max && value > max);
