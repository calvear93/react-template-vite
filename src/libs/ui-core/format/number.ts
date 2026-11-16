import { byLocale } from './locale.ts';

const numberFormat = byLocale((locale) => new Intl.NumberFormat(locale));

/**
 * A number as the locale writes it.
 *
 * @example
 * ```ts
 * formatNumber(12345.6); // '12,345.6'
 * formatNumber(12345.6, 'es-CL'); // '12.345,6'
 * ```
 *
 * @param value - the number
 * @param locale - the locale (default: the current one)
 *
 * @returns the number with its thousands apart; '0' without one
 */
export const formatNumber = (
	value: number | null | undefined,
	locale?: string,
) => numberFormat(locale).format(value ?? 0);
