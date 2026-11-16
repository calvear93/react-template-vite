import { describe, expect, test } from 'vitest';
import {
	amountShape,
	formatAmount,
	isAmountText,
	maskAmount,
	parseAmount,
} from './amount.ts';

/** Chilean pesos, written in Chile: no decimals, dots between the thousands. */
const CL = { currency: 'CLP', locale: 'es-CL' };

/** US dollars, written in the United States: two decimals after a dot. */
const US = { currency: 'USD', locale: 'en-US' };

/** Euros, written in Germany: two decimals after a comma. */
const DE = { currency: 'EUR', locale: 'de-DE' };

/** An amount as it is copied from a sheet in Chile, with its decimals. */
const AS_CHILE = '1.250.000,00';

/** The same amount as English writes it, and most systems do. */
const AS_ENGLISH = '1250000.50';

describe(amountShape, () => {
	test.each([
		[US, { decimal: '.', fraction: 2, group: ',', symbol: '$' }],
		[CL, { decimal: ',', fraction: 0, group: '.', symbol: '$' }],
		[DE, { decimal: ',', fraction: 2, group: '.', symbol: '€' }],
	])('is, for %j, %j', ({ currency, locale }, shape) => {
		expect(amountShape(currency, locale)).toStrictEqual(shape);
	});

	test('is the one of US dollars in English for an app that says nothing', () => {
		expect(amountShape()).toStrictEqual(
			amountShape(US.currency, US.locale),
		);
	});

	test('has no decimals for a currency without them, whatever the locale', () => {
		expect(amountShape('JPY', 'en-US').fraction).toBe(0);
		expect(amountShape('CLP', 'en-US').fraction).toBe(0);
	});
});

describe(maskAmount, () => {
	test.each([
		['1250000', '1.250.000'],
		['980', '980'],
		['1000', '1.000'],
		['12a34', '1.234'],
		['$ 1.250.000', '1.250.000'],
		['0012', '12'],
		['0', '0'],
		['000', '0'],
		[1_250_000, '1.250.000'],
		[0, '0'],
		// a number takes the decimals of its currency: none
		[4500.4, '4.500'],
		[-4500.9, '4.501'],
		[Number.NaN, ''],
		[Number.POSITIVE_INFINITY, ''],
		// fifteen digits is the most an amount has
		[999_999_999_999_999, '999.999.999.999.999'],
		// a number with more is no amount: never one cut to fifteen, or read from «1e+21»
		[1_000_000_000_000_000, ''],
		[Number.MAX_SAFE_INTEGER, ''],
		[1e21, ''],
		[-1e21, ''],
		// a text with more digits than an amount has is no amount either
		['123456789012345', '123.456.789.012.345'],
		['1234567890123456', ''],
		['12345678901234567890', ''],
		['0000000000000000980', '980'],
		['abc', ''],
		['', ''],
		[null, ''],
		[undefined, ''],
	])('writes %s in Chilean pesos as «%s»', (value, masked) => {
		expect(maskAmount(value, CL)).toBe(masked);
	});

	test.each([
		// as Chile writes them: one comma, and no separator after it
		[AS_CHILE, '1.250.000'],
		['$ 1.250.000,5 CLP', '1.250.000'],
		['1.250.000,', '1.250.000'],
		['0,99', '0'],
		[',50', ''],
		// as English writes them: a last dot with one or two digits after it
		[AS_ENGLISH, '1.250.000'],
		['1,250,000.00', '1.250.000'],
		['1250000.5 USD', '1.250.000'],
		['12.50', '12'],
		['1,250.5', '1.250'],
	])(
		'leaves the decimals of «%s» out of an amount of pesos: «%s»',
		(text, masked) => {
			expect(maskAmount(text, CL)).toBe(masked);
		},
	);

	test.each([
		// a dot follows the comma
		['1.250,.000', '1.250.000'],
		// more than one comma: not a number as Chile writes it
		['1,250,000', '1.250.000'],
		// three digits after the dot: thousands
		['1.250.000', '1.250.000'],
		['1.250', '1.250'],
		// more digits follow
		['1.2505', '12.505'],
		// not the last dot
		['1.25.000', '125.000'],
	])(
		'takes a separator that starts no decimals for no digit: «%s» is «%s»',
		(text, masked) => {
			expect(maskAmount(text, CL)).toBe(masked);
		},
	);

	// in a field: the decimals are those of what was just typed or pasted, and what the
	// field already had, before it or after it, is no decimal of anything
	test.each([
		// a comma typed in an amount with no dot, and in the last group of one with dots
		['9,80', 1, 2, '980'],
		['12.3,45', 4, 5, '12.345'],
		[',980', 0, 1, '980'],
		['980,', 3, 4, '980'],
		['1.250,.000', 5, 6, '1.250.000'],
		// a digit typed one or two places after a dot the field had
		['1.2950', 3, 4, '12.950'],
		['1.2505', 5, 6, '12.505'],
		['1.9250', 2, 3, '19.250'],
		// a digit taken away: nothing was put in, and «.00» is of the field
		['1.250.00', 8, 8, '125.000'],
		['1.25', 4, 4, '125'],
		// a dot typed: it has no digit of its own after it
		['12.3.45', 4, 5, '12.345'],
		// pasted: its decimals go, the digits around it stay
		[AS_CHILE, 0, 12, '1.250.000'],
		[AS_ENGLISH, 0, 10, '1.250.000'],
		['1,250,000.00', 0, 12, '1.250.000'],
		['95,580', 1, 4, '9.580'],
		['91.580', 1, 4, '9.180'],
		['91,250,00080', 1, 10, '9.125.000.080'],
	])(
		'writes «%s» in pesos, where %i to %i was just typed or pasted, as «%s»',
		(text, start, end, masked) => {
			expect(maskAmount(text, { ...CL, inserted: { end, start } })).toBe(
				masked,
			);
		},
	);

	test.each([
		['1250000', '1,250,000'],
		['1250.5', '1,250.5'],
		['1250.50', '1,250.50'],
		// the decimals are being typed: their separator stays, and a zero stands before it
		['1250.', '1,250.'],
		['.5', '0.5'],
		['.', '0.'],
		// a number has all the decimals of its currency, or none
		[1250.5, '1,250.50'],
		[1250, '1,250'],
		[0.05, '0.05'],
		[1250.559, '1,250.56'],
		// as the other half of the world writes it
		['1.250.000,50', '1,250,000.50'],
		// more decimals than a dollar has, or more digits than an amount: no amount
		['1250.505', ''],
		['1234567890123.45', '1,234,567,890,123.45'],
		['12345678901234.56', ''],
	])('writes %s in US dollars as «%s»', (value, masked) => {
		expect(maskAmount(value, US)).toBe(masked);
	});

	test.each([
		['1250,5', '1.250,5'],
		[1250.5, '1.250,50'],
		['1,250.50', '1.250,50'],
	])('writes %s in euros, in Germany, as «%s»', (value, masked) => {
		expect(maskAmount(value, DE)).toBe(masked);
	});

	test.each([
		// a second dot typed in an amount that has its decimals: what follows it is too much
		['1.,250.5', 1, 2, ''],
		// a comma typed in the United States separates nothing by itself
		['12,50', 2, 3, '1,250'],
		// a digit typed among the decimals
		['1,250.57', 7, 8, '1,250.57'],
	])(
		'writes «%s» in dollars, where %i to %i was just typed, as «%s»',
		(text, start, end, masked) => {
			expect(maskAmount(text, { ...US, inserted: { end, start } })).toBe(
				masked,
			);
		},
	);

	test('writes an amount as the app does when it is told nothing', () => {
		expect(maskAmount('1250.5')).toBe('1,250.5');
	});
});

describe(isAmountText, () => {
	test.each([
		['123.456.789.012.345', CL, true],
		['1.234.567.890.123.456', CL, false],
		['1,250.50', US, true],
		['1,250.505', US, false],
		['', US, true],
	])('says of «%s», for %j: %s', (text, money, expected) => {
		expect(isAmountText(text, money)).toBe(expected);
	});
});

describe(parseAmount, () => {
	test.each([
		['1.250.000', 1_250_000],
		['0', 0],
		['$ 980', 980],
		[AS_CHILE, 1_250_000],
		[AS_ENGLISH, 1_250_000],
		['1,250,000.00', 1_250_000],
		['123.456.789.012.345', 123_456_789_012_345],
		// more digits than an amount has: no amount, never one cut to fifteen
		['1234567890123456', null],
		['1.234.567.890.123.456', null],
		['', null],
		['sin monto', null],
	])('reads «%s», in pesos, as %s', (text, amount) => {
		expect(parseAmount(text, CL)).toBe(amount);
	});

	test.each([
		['1,250.50', 1250.5],
		['1,250', 1250],
		['0.5', 0.5],
		['1,250.', 1250],
		['.', null],
		['', null],
		['1,250.505', null],
	])('reads «%s», in dollars, as %s', (text, amount) => {
		expect(parseAmount(text, US)).toBe(amount);
	});
});

describe(formatAmount, () => {
	test('writes an amount with the sign of its currency and all its decimals', () => {
		expect(formatAmount(1250.5, US.currency, US.locale)).toBe('$1,250.50');
		expect(formatAmount(1_250_000, CL.currency, CL.locale)).toBe(
			'$1.250.000',
		);
		expect(formatAmount(1250.5)).toBe('$1,250.50');
	});

	test.each([null, undefined])('has a dash for %s', (value) => {
		expect(formatAmount(value)).toBe('—');
	});
});
