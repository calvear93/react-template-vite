/*
 * Chilean RUT (modulo 11). A RUT is complete when, without dots, dash or spaces, it is a body
 * of 7 or 8 digits plus its check digit (0-9 or K), and that digit matches: a RUT still being
 * typed is never taken for a complete one.
 */

/** What a text is as a RUT. */
export type RutStatus = 'empty' | 'incomplete' | 'invalid' | 'text' | 'valid';

/** "12345678" → "12.345.678" */
const thousands = (body: string) => {
	const groups: string[] = [];

	for (let end = body.length; end > 0; end -= 3)
		groups.unshift(body.slice(Math.max(0, end - 3), end));

	return groups.join('.');
};

/**
 * Without dots, dash or spaces, uppercase K, no leading zeros.
 *
 * @example
 * ```ts
 * cleanRut('12.345.678-k'); // '12345678K'
 * ```
 *
 * @param value - a RUT as typed
 *
 * @returns its digits and check digit
 */
export const cleanRut = (value: string | null | undefined) =>
	(value ?? '')
		.replaceAll(/[\s\-.]/gu, '')
		.toUpperCase()
		.replace(/^0+/u, '');

/**
 * The check digit of a RUT body.
 *
 * @param body - digits only
 *
 * @returns '0'-'9' or 'K'
 */
export const checkDigit = (body: string) => {
	let sum = 0;
	let factor = 2;

	for (const digit of [...body].toReversed()) {
		sum += Number(digit) * factor;
		factor = factor === 7 ? 2 : factor + 1;
	}

	const digit = 11 - (sum % 11);

	if (digit === 11) return '0';

	return digit === 10 ? 'K' : String(digit);
};

/**
 * What a text is as a RUT: `empty` (nothing typed), `text` (other characters:
 * not a RUT), `incomplete` (fewer than 8 digits), `invalid` (complete, but the
 * check digit does not match, or too long) or `valid`.
 *
 * @param value - a RUT as typed
 *
 * @returns its status
 */
export const rutStatus = (value: string | null | undefined): RutStatus => {
	const raw = (value ?? '').trim();

	if (!raw) return 'empty';

	if (!/^[\s\d\-.]*[\dk]?$/iu.test(raw)) return 'text';

	const clean = cleanRut(raw);

	if (clean.length < 8) return 'incomplete';

	if (!/^\d{7,8}[\dK]$/u.test(clean)) return 'invalid';

	return checkDigit(clean.slice(0, -1)) === clean.slice(-1)
		? 'valid'
		: 'invalid';
};

/**
 * The format a RUT travels in.
 *
 * @example
 * ```ts
 * normalizeRut('12.345.678-5'); // '12345678-5'
 * normalizeRut('12.345'); // ''
 * ```
 *
 * @param value - a RUT as typed
 *
 * @returns body, dash and check digit of a valid RUT; '' otherwise
 */
export const normalizeRut = (value: string | null | undefined) => {
	if (rutStatus(value) !== 'valid') return '';

	const clean = cleanRut(value);

	return `${clean.slice(0, -1)}-${clean.slice(-1)}`;
};

/** As many characters as a RUT has at most: eight digits and its check digit. */
export const RUT_MAX_LENGTH = 9;

/**
 * A RUT as it is typed: only digits and a final K are kept, and the last one is
 * always the check digit, so the dash never has to be typed. Every one of them is
 * kept: with more than `RUT_MAX_LENGTH` the text is no RUT (`rutStatus` says it is
 * not valid), and it is for the field not to take them, never for a cut to make
 * another RUT of it, with another check digit.
 *
 * @example
 * ```ts
 * maskRut('123456785'); // '12.345.678-5'
 * ```
 *
 * @param value - what was typed or pasted
 *
 * @returns the masked text
 */
export const maskRut = (value: string | null | undefined) => {
	const typed = (value ?? '').toUpperCase().replaceAll(/[^\dK]/gu, '');
	// K only as the check digit
	const clean = (
		typed.slice(0, -1).replaceAll('K', '') + typed.slice(-1)
	).replace(/^0+/u, '');

	if (clean.length < 2) return clean;

	return `${thousands(clean.slice(0, -1))}-${clean.slice(-1)}`;
};

/**
 * A RUT for display.
 *
 * @example
 * ```ts
 * formatRut('12345678-5'); // '12.345.678-5'
 * ```
 *
 * @param value - a RUT with its dash
 *
 * @returns the RUT with dots; '—' when empty; the text as it is without a dash
 */
export const formatRut = (value: string | null | undefined) => {
	if (!value) return '—';

	const [body, digit] = value.split('-');

	return digit ? `${thousands(body)}-${digit}` : value;
};
