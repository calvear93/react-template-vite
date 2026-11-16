import { byLocale } from '../format/locale.ts';

const rules = byLocale((locale) => new Intl.PluralRules(locale));

/**
 * The form of a word for a count, as a language counts: the one for one, or the one
 * for every other number (none, several, a million).
 *
 * @example
 * ```ts
 * plural(1, 'result', 'results'); // 'result'
 * plural(0, 'result', 'results'); // 'results'
 * ```
 *
 * @param count - how many
 * @param one - the word for one
 * @param other - the word for any other count
 * @param locale - the locale (default: the current one)
 *
 * @returns the word that goes with the count
 */
export const plural = (
	count: number,
	one: string,
	other: string,
	locale?: string,
) => (rules(locale).select(count) === 'one' ? one : other);
