import { describe, expect, test } from 'vitest';
import { highlightParts } from './highlight-parts.ts';

const marked = (text: string, query: string) =>
	highlightParts(text, query)
		.map((part) => (part.isHit ? `[${part.text}]` : part.text))
		.join('');

describe(highlightParts, () => {
	test.each([
		['Ana Pérez Soto', 'ana', '[Ana] Pérez Soto'],
		['Pérez Soto, Ana', 'ana perez', '[Pérez] Soto, [Ana]'],
		['Ana Pérez Soto', 'PEREZ', 'Ana [Pérez] Soto'],
		['Ñuñoa', 'nun', '[Ñuñ]oa'],
		['Ana Banana', 'ana', '[Ana] B[anana]'],
		['Ana Pérez', 'a', 'Ana Pérez'],
		['Ana Pérez', '', 'Ana Pérez'],
		['Ana Pérez', 'soto', 'Ana Pérez'],
		['', 'ana', ''],
	])('marks in %j what %j finds: %s', (text, query, expected) => {
		expect(marked(text, query)).toBe(expected);
	});

	// «é» written as an e and a combining accent, as some sources store it
	test.each([
		['Pe\u0301rez Soto', 'perez', '[Pérez] Soto'],
		['Ana Pe\u0301rez', 'PÉREZ', 'Ana [Pérez]'],
		['N\u0303un\u0303oa', 'nunoa', '[Ñuñoa]'],
	])(
		'marks a text with decomposed accents whole: %j',
		(text, query, expected) => {
			expect(marked(text, query)).toBe(expected);
		},
	);

	test('gives the text as one stretch, composed, when there is nothing to look for', () => {
		expect(highlightParts('Ana Pérez', '')).toStrictEqual([
			{ isHit: false, start: 0, text: 'Ana Pérez' },
		]);
		expect(highlightParts('Ana Pérez', 'a  b')).toStrictEqual([
			{ isHit: false, start: 0, text: 'Ana Pérez' },
		]);
		expect(highlightParts('', '')).toStrictEqual([]);
	});

	test('cuts the same stretches a letter-by-letter cut does', () => {
		// what highlightParts did before it cut by stretches
		const letterByLetter = (text: string, query: string) => {
			const letters = [...text.normalize('NFC')];
			const plain = letters
				.map((letter) =>
					letter.normalize('NFD').charAt(0).toLowerCase(),
				)
				.join('');
			const hits = letters.map(() => false);
			const words = [...query.normalize('NFC')]
				.map((letter) =>
					letter.normalize('NFD').charAt(0).toLowerCase(),
				)
				.join('')
				.split(/\s+/u)
				.filter((word) => word.length > 1);

			for (const word of words)
				for (
					let at = plain.indexOf(word);
					at !== -1;
					at = plain.indexOf(word, at + 1)
				)
					hits.fill(true, at, at + word.length);

			const parts: { isHit: boolean; start: number; text: string }[] = [];

			for (const [start, letter] of letters.entries()) {
				const lastPart = parts.at(-1);

				if (lastPart?.isHit === hits[start]) lastPart.text += letter;
				else
					parts.push({
						isHit: hits[start] ?? false,
						start,
						text: letter,
					});
			}

			return parts;
		};

		const texts = [
			'San José de Maipo',
			'Peñalolén sector 12',
			'Ana Banana ana',
			'😀 Ana 👩‍⚕️ Pérez',
			'a',
			'',
		];
		const queries = [
			'',
			'an',
			'ana jose',
			'PEÑA 12',
			'x',
			'na na',
			'😀 ana',
		];

		for (const text of texts)
			for (const query of queries)
				expect(highlightParts(text, query)).toStrictEqual(
					letterByLetter(text, query),
				);
	});

	test('tells where each stretch starts', () => {
		expect(highlightParts('Ana Pérez', 'perez')).toStrictEqual([
			{ isHit: false, start: 0, text: 'Ana ' },
			{ isHit: true, start: 4, text: 'Pérez' },
		]);
	});
});
