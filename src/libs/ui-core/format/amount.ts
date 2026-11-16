/*
 * Amounts of money as a locale writes them: the separator of its thousands, the one of its
 * decimals, and as many decimals as the currency has (two for US dollars, none for Chilean
 * pesos). The currency and the locale are those of the app (`locale.ts`) when a function is
 * given none.
 */

import { getLocale, getLocaleSnapshot } from './locale.ts';

/**
 * As many digits as an amount has at most, its decimals included: those a number keeps
 * exactly (`Number.MAX_SAFE_INTEGER` has 16).
 */
export const AMOUNT_MAX_DIGITS = 15;

/** How a locale writes an amount of a currency. */
export interface AmountShape {
	/** What starts its decimals: `.` or `,`. */
	decimal: string;
	/** How many decimals the currency has. */
	fraction: number;
	/** What separates its thousands. */
	group: string;
	/** The sign of the currency, as short as the locale writes it: `$`, `€`. */
	symbol: string;
}

/** Where what was just typed or pasted in a field is, in its text. */
interface InsertedRange {
	end: number;
	start: number;
}

/** The parts of an amount as it was typed: the digits before its decimals, and those after. */
interface AmountParts {
	/** The digits of the decimals; `undefined` when the text has no decimal separator. */
	fraction: string | undefined;
	/** The digits before the decimals, without leading zeros. */
	whole: string;
}

const NOT_DIGITS = /\D/gu;

const digitsOf = (part: string) => part.replaceAll(NOT_DIGITS, '');

const shapes = new Map<string, AmountShape>();
const wholeFormats = new Map<string, Intl.NumberFormat>();
const moneyFormats = new Map<string, Intl.NumberFormat>();

const currencyOf = (currency: string | undefined) =>
	currency ?? getLocaleSnapshot().currency;

/** A number in the currency of an amount, written whole by the locale: sign, separators, decimals. */
const moneyFormat = (currency: string, locale: string) => {
	const key = `${locale}|${currency}`;
	let format = moneyFormats.get(key);

	if (!format) {
		format = new Intl.NumberFormat(locale, {
			currency,
			currencyDisplay: 'narrowSymbol',
			style: 'currency',
		});
		moneyFormats.set(key, format);
	}

	return format;
};

/** The digits before the decimals, with their thousands apart whatever their number. */
const wholeFormat = (locale: string) => {
	let format = wholeFormats.get(locale);

	if (!format) {
		format = new Intl.NumberFormat(locale, {
			maximumFractionDigits: 0,
			useGrouping: 'always',
		});
		wholeFormats.set(locale, format);
	}

	return format;
};

/**
 * How a locale writes an amount of a currency: its separators, how many decimals the
 * currency has, and its sign.
 *
 * @example
 * ```ts
 * amountShape('USD', 'en-US'); // { decimal: '.', fraction: 2, group: ',', symbol: '$' }
 * amountShape('CLP', 'es-CL'); // { decimal: ',', fraction: 0, group: '.', symbol: '$' }
 * ```
 *
 * @param currency - the currency, as ISO 4217 (default: the one of the app)
 * @param locale - the locale (default: the current one)
 *
 * @returns the shape of an amount
 */
export const amountShape = (
	currency?: string,
	locale: string = getLocale(),
): AmountShape => {
	const money = currencyOf(currency);
	const key = `${locale}|${money}`;
	let shape = shapes.get(key);

	if (!shape) {
		const format = moneyFormat(money, locale);
		// a number with thousands and decimals, to read the separators of the locale from
		const parts = new Intl.NumberFormat(locale, {
			minimumFractionDigits: 1,
			useGrouping: 'always',
		}).formatToParts(1234.5);
		const part = (type: Intl.NumberFormatPartTypes, fallback: string) =>
			parts.find((item) => item.type === type)?.value ?? fallback;

		shape = {
			decimal: part('decimal', '.'),
			fraction: format.resolvedOptions().maximumFractionDigits ?? 0,
			group: part('group', ','),
			symbol:
				format.formatToParts(0).find((item) => item.type === 'currency')
					?.value ?? money,
		};
		shapes.set(key, shape);
	}

	return shape;
};

/**
 * Where the decimals of a text start, or -1 when it has none. As the locale writes them,
 * they follow its decimal separator, when the text has one and no other separator after it
 * («1,250.50» in the United States, «1.250,50» in Chile). As the other half of the world
 * does, they follow the last separator of thousands when one or two digits come after it
 * and nothing else: thousands have three («1250.50» pasted in Chile, «1.250,5» in the
 * United States). Any other separator starts no decimals.
 */
const decimalsAt = (text: string, { decimal, group }: AmountShape) => {
	const own = text.indexOf(decimal);
	const rest = text.slice(own + 1);

	if (own !== -1 && !rest.includes(decimal) && !rest.includes(group))
		return own;

	const other = text.lastIndexOf(group);
	const after = text.slice(other + 1);

	return other !== -1 &&
		/^\d{1,2}\D*$/u.test(after) &&
		!after.includes(decimal)
		? other
		: -1;
};

/**
 * What was just put in a field, as the locale writes an amount: its digits, and its
 * decimals after the decimal separator of the locale. In a currency without decimals they
 * are left out.
 */
const settled = (put: string, shape: AmountShape) => {
	const at = decimalsAt(put, shape);

	if (at === -1) return digitsOf(put);

	return shape.fraction === 0
		? digitsOf(put.slice(0, at))
		: `${digitsOf(put.slice(0, at))}${shape.decimal}${digitsOf(put.slice(at + 1))}`;
};

/**
 * The digits of an amount as it was typed or pasted, read as the locale writes one: before
 * its decimal separator and after it. All of them: it is for the caller to say that there
 * are more than an amount has, never for a cut to make another amount of it.
 *
 * What is read into is `inserted` only, what was just typed or pasted (the whole text
 * without it): there its decimals are looked for, however they were written. What the field
 * already had is taken as the field wrote it, so a key takes away no digit it did not touch.
 */
const amountParts = (
	text: string,
	shape: AmountShape,
	inserted?: InsertedRange,
): AmountParts => {
	const { end, start } = inserted ?? { end: text.length, start: 0 };
	const read = `${text.slice(0, start)}${settled(text.slice(start, end), shape)}${text.slice(end)}`;
	const at = shape.fraction === 0 ? -1 : read.indexOf(shape.decimal);

	return {
		fraction: at === -1 ? undefined : digitsOf(read.slice(at + 1)),
		whole: digitsOf(at === -1 ? read : read.slice(0, at)).replace(
			/^0+(?=\d)/u,
			'',
		),
	};
};

/** The parts of a number: its sign gone, its decimals those of the currency when it has any. */
const numberParts = (
	value: number,
	shape: AmountShape,
): AmountParts | undefined => {
	// not a number, an infinity or more digits than an amount has: none of them is one
	if (!Number.isFinite(value) || Math.abs(value) >= 10 ** AMOUNT_MAX_DIGITS)
		return;

	const [whole, fraction = ''] = Math.abs(value)
		.toFixed(shape.fraction)
		.split('.');

	return {
		fraction: Number(fraction) === 0 ? undefined : fraction,
		whole,
	};
};

/** Whether the digits of an amount are no more than one has, and its decimals those of its currency. */
const fits = ({ fraction = '', whole }: AmountParts, shape: AmountShape) =>
	whole.length + fraction.length <= AMOUNT_MAX_DIGITS &&
	fraction.length <= shape.fraction;

/**
 * Whether what was typed fits in an amount: at most `AMOUNT_MAX_DIGITS` digits, and no
 * more decimals than the currency has. A field refuses the key or the paste that does not.
 *
 * @param text - what was typed
 * @param options - the currency and the locale, and where what was just put in is
 *
 * @returns whether the text can be an amount
 */
export const isAmountText = (text: string, options: AmountOptions = {}) => {
	const shape = amountShape(options.currency, options.locale);

	return fits(amountParts(text, shape, options.inserted), shape);
};

/**
 * An amount with its thousands separated as the locale writes them: what an amount field
 * shows while it is typed in. A number loses its sign and gets the decimals of its
 * currency when it has any; a text keeps the decimals typed so far. A number or a text with
 * more digits than an amount has is no amount: it is never shown cut to another one.
 *
 * @example
 * ```ts
 * maskAmount('1250000'); // '1,250,000'
 * maskAmount('1250.5'); // '1,250.5'
 * maskAmount(1250.5); // '1,250.50'
 * maskAmount('1250000', { currency: 'CLP', locale: 'es-CL' }); // '1.250.000'
 * maskAmount(null); // ''
 * ```
 *
 * @param value - the amount, or what was typed
 * @param options - the currency and the locale; in a text, where what was just put in is
 *
 * @returns the amount with its separators; `''` for none
 */
export const maskAmount = (
	value: number | string | null | undefined,
	options: AmountOptions = {},
) => {
	const locale = options.locale ?? getLocale();
	const shape = amountShape(options.currency, locale);
	const typed =
		typeof value === 'number'
			? numberParts(value, shape)
			: amountParts(value ?? '', shape, options.inserted);

	if (!typed || !fits(typed, shape)) return '';

	const { fraction, whole } = typed;

	if (whole === '' && fraction === undefined) return '';

	const written = wholeFormat(locale).format(Number(whole));

	return fraction === undefined
		? written
		: `${written}${shape.decimal}${fraction}`;
};

/**
 * The number of an amount as it was typed.
 *
 * @example
 * ```ts
 * parseAmount('1,250.50'); // 1250.5
 * parseAmount('1.250.000', { currency: 'CLP', locale: 'es-CL' }); // 1250000
 * parseAmount(''); // null
 * ```
 *
 * @param text - what was typed
 * @param options - the currency and the locale
 *
 * @returns the amount; `null` when nothing was typed, or when it has more digits than an
 *   amount has
 */
export const parseAmount = (text: string, options: AmountOptions = {}) => {
	const shape = amountShape(options.currency, options.locale);
	const parts = amountParts(text, shape, options.inserted);
	const { fraction = '', whole } = parts;

	return (whole === '' && fraction === '') || !fits(parts, shape)
		? null
		: Number(`${whole || '0'}.${fraction || '0'}`);
};

/**
 * An amount as people read it: with the sign of its currency and all its decimals.
 *
 * @example
 * ```ts
 * formatAmount(1250.5); // '$1,250.50'
 * formatAmount(1250000, 'CLP', 'es-CL'); // '$1.250.000'
 * ```
 *
 * @param value - the amount
 * @param currency - the currency, as ISO 4217 (default: the one of the app)
 * @param locale - the locale (default: the current one)
 *
 * @returns the amount; '—' without one
 */
export const formatAmount = (
	value: number | null | undefined,
	currency?: string,
	locale: string = getLocale(),
) =>
	value === null || value === undefined
		? '—'
		: moneyFormat(currencyOf(currency), locale).format(value);

export interface AmountOptions {
	/** The currency, as ISO 4217 (default: the one of the app). */
	currency?: string;
	/** Where what was just typed or pasted in a field is, in its text. */
	inserted?: InsertedRange;
	/** The locale (default: the current one). */
	locale?: string;
}
