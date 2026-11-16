import { describe, expect, test } from 'vitest';
import { fold } from './fold.ts';

describe(fold, () => {
	test.each([
		['Pérez', 'perez'],
		['Ñuñoa, Región', 'nunoa, region'],
		['ÁÉÍÓÚ Ü', 'aeiou u'],
		['', ''],
	])('reads «%s» as «%s»', (text, folded) => {
		expect(fold(text)).toBe(folded);
	});

	test('reads an accent the same, written as one letter or as a letter and its mark', () => {
		expect(fold('Pe\u0301rez')).toBe('perez');
		expect(fold('Pe\u0301rez')).toBe(fold('Pérez'));
		expect(fold('N\u0303un\u0303oa')).toBe('nunoa');
	});

	test('keeps the length of the text', () => {
		const text = 'Peñalolén · José María';

		expect(fold(text)).toHaveLength([...text].length);
	});

	test('folds every text as folding it letter by letter does', () => {
		// what fold did before it kept what each letter folds to
		const letterByLetter = (text: string) =>
			[...text.normalize('NFC')]
				.map((letter) =>
					letter.normalize('NFD').charAt(0).toLowerCase(),
				)
				.join('');

		const texts = [
			'San José de Maipo 123',
			'PLAIN ASCII, with (signs) ~ and 0-9!',
			'Peñalolén · Ñuñoa · Aysén · Curicó',
			'Pe\u0301rez N\u0303un\u0303oa',
			'ÀÈÌÒÙ àèìòù ÄËÏÖÜ äëïöü Çç Åå Øø ß İ ı',
			'Tabs\tand\nlines',
			'Emoji 😀 and 👩‍⚕️ in a name',
			'日本語 한국어 Ελληνικά Кириллица',
			'',
		];

		for (const text of texts) expect(fold(text)).toBe(letterByLetter(text));
	});

	test('folds a letter the same the second time it meets it', () => {
		expect(fold('Ñandú')).toBe('nandu');
		expect(fold('Ñandú')).toBe('nandu');
	});
});
