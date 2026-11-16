import { describe, expect, test } from 'vitest';
import { plural } from './plural.ts';

describe(plural, () => {
	test.each([
		[1, 'resultado'],
		[0, 'resultados'],
		[2, 'resultados'],
		[21, 'resultados'],
		[1.5, 'resultados'],
		// a million has a form of its own in Spanish: here it is one more of the many
		[1_000_000, 'resultados'],
	])('for %d it is «%s»', (count, word) => {
		expect(plural(count, 'resultado', 'resultados')).toBe(word);
	});
});
