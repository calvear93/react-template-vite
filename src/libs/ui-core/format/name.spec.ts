import { describe, expect, test } from 'vitest';
import { inChile } from '../__mocks__/locale.mock.ts';
import { initials, shortName } from './name.ts';

inChile();

describe(shortName, () => {
	test.each([
		['Pérez Soto, Ana María', 'Ana Pérez'],
		['Ana María Pérez Soto', 'Ana Pérez'],
		['Ana Pérez Soto', 'Ana Pérez'],
		['Ana Pérez', 'Ana Pérez'],
		['ANA PÉREZ', 'Ana Pérez'],
		['Juan Pablo de la Cruz Soto', 'Juan de la Cruz'],
		['JUAN PABLO DE LA CRUZ SOTO', 'Juan de la Cruz'],
		['  Ana  ', 'Ana'],
		['McDonald Ana', 'McDonald Ana'],
		['Ana de', 'Ana de'],
	])('shortens «%s» to «%s»', (name, expected) => {
		expect(shortName(name)).toBe(expected);
	});

	test.each([[''], [null], [undefined], ['   ']])(
		'is empty without a name (%j)',
		(name) => {
			expect(shortName(name)).toBe('');
		},
	);

	test('prefers the given name and the surname when they are known', () => {
		expect(
			shortName('ignored', { given: 'Ana María', surname: 'PÉREZ SOTO' }),
		).toBe('Ana Pérez');
		expect(shortName(null, { given: 'Ana' })).toBe('Ana');
		expect(shortName(null, { surname: 'de la Cruz Soto' })).toBe(
			'de la Cruz',
		);
	});
});

describe(initials, () => {
	test.each([
		['Ana Pérez Soto', 'AP'],
		['Juan de la Cruz', 'JC'],
		['ana', 'A'],
		['  élise   von   braun ', 'ÉB'],
	])('takes up to two initials of «%s»: %s', (name, expected) => {
		expect(initials(name)).toBe(expected);
	});

	test.each([[''], [null], [undefined], ['de la']])(
		'is a question mark without a name (%j)',
		(name) => {
			expect(initials(name)).toBe('?');
		},
	);
});
