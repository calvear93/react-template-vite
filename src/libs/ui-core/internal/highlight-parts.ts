import { fold } from './fold.ts';

/** A stretch of a text: one that matched what was searched, or one that did not. */
export interface HighlightPart {
	isHit: boolean;
	/** Where the stretch starts in the text, in letters. */
	start: number;
	text: string;
}

/** The words of the last search: a list asks for the same one once per option. */
let last: { query: string; words: readonly string[] } = {
	query: '',
	words: [],
};

const wordsOf = (query: string) => {
	if (last.query !== query)
		last = {
			query,
			words: fold(query)
				.split(/\s+/u)
				.filter((word) => word.length > 1),
		};

	return last.words;
};

/**
 * A text cut where the words of a search appear in it, accents and case aside:
 * what a list of results marks in each name. Words of one letter are not looked
 * for (they would mark half the text). The stretches carry the text composed
 * (NFC): an accent written as a letter and its mark comes back as one letter.
 *
 * @example
 * ```ts
 * highlightParts('Pérez Soto, Ana', 'ana perez');
 * // [{ isHit: true, text: 'Pérez' }, { isHit: false, text: ' Soto, ' }, { isHit: true, text: 'Ana' }]
 * ```
 *
 * @param text - the text shown
 * @param query - what was searched
 *
 * @returns the text in stretches, in order
 */
export const highlightParts = (text: string, query: string) => {
	const words = wordsOf(query);
	// composed, as fold reads it: a letter and its mark are one letter, in the same place
	const composed = text.normalize('NFC');
	const parts: HighlightPart[] = [];

	if (composed === '') return parts;

	// nothing to look for: the text is one stretch, and nothing is folded
	if (words.length === 0) return [{ isHit: false, start: 0, text: composed }];

	const letters = [...composed];
	const plain = fold(composed);
	const hits = letters.map(() => false);

	for (const word of words)
		for (
			let at = plain.indexOf(word);
			at !== -1;
			at = plain.indexOf(word, at + 1)
		)
			hits.fill(true, at, at + word.length);

	let start = 0;

	for (let at = 1; at <= letters.length; at += 1) {
		if (at < letters.length && hits[at] === hits[start]) continue;

		parts.push({
			isHit: hits[start] ?? false,
			start,
			text: letters.slice(start, at).join(''),
		});
		start = at;
	}

	return parts;
};
