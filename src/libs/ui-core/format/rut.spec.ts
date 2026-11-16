import { describe, expect, test } from 'vitest';
import {
	checkDigit,
	cleanRut,
	formatRut,
	maskRut,
	normalizeRut,
	rutStatus,
} from './rut.ts';

const FORMATTED = '12.345.678-5';

describe(cleanRut, () => {
	test.each([
		['12.345.678-k', '12345678K'],
		[' 012.345.678 - 5 ', '123456785'],
		['', ''],
		[null, ''],
	])('cleans %j to %j', (value, expected) => {
		expect(cleanRut(value)).toBe(expected);
	});
});

describe(checkDigit, () => {
	test.each([
		['12345678', '5'],
		['11111111', '1'],
		['7654321', '6'],
		['20347878', 'K'],
		['12345675', '0'],
	])('of %s is %s', (body, digit) => {
		expect(checkDigit(body)).toBe(digit);
	});
});

describe(rutStatus, () => {
	test.each([
		['', 'empty'],
		['   ', 'empty'],
		[null, 'empty'],
		['ana@example.com', 'text'],
		['12.345.678-X', 'text'],
		['12.345', 'incomplete'],
		['1234567', 'incomplete'],
		[FORMATTED, 'valid'],
		['123456785', 'valid'],
		['20.347.878-k', 'valid'],
		['7.654.321-6', 'valid'],
		['12.345.678-9', 'invalid'],
		['123.456.789-01', 'invalid'],
		['123.456.785-9', 'invalid'],
	] as const)('%j is %s', (value, status) => {
		expect(rutStatus(value)).toBe(status);
	});
});

describe(normalizeRut, () => {
	test.each([
		[FORMATTED, '12345678-5'],
		['20347878k', '20347878-K'],
		['12.345.678-9', ''],
		['12.345', ''],
		['1234567859', ''],
		[undefined, ''],
	])('normalizes %j to %j', (value, expected) => {
		expect(normalizeRut(value)).toBe(expected);
	});
});

describe(maskRut, () => {
	test.each([
		['', ''],
		['1', '1'],
		['12', '1-2'],
		['1234', '123-4'],
		['123456785', FORMATTED],
		[FORMATTED, FORMATTED],
		['20347878k', '20.347.878-K'],
		['2k0347878k', '20.347.878-K'],
		['0012345678', '1.234.567-8'],
		// every character: with more than a RUT has it is no RUT, and none is cut to make one
		['1234567890123', '123.456.789.012-3'],
		['1234567859', '123.456.785-9'],
		['abc', ''],
		[null, ''],
	])('masks %j as %j', (value, expected) => {
		expect(maskRut(value)).toBe(expected);
	});
});

describe(formatRut, () => {
	test.each([
		['12345678-5', FORMATTED],
		['7654321-6', '7.654.321-6'],
		['sin guion', 'sin guion'],
		['', '—'],
		[null, '—'],
	])('formats %j as %j', (value, expected) => {
		expect(formatRut(value)).toBe(expected);
	});
});
