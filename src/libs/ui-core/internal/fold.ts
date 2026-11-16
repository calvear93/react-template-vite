/** The last code of ASCII: up to it no letter has an accent, and lower case is all the folding. */
const LAST_PLAIN = 127;

const isPlain = (text: string) => {
	for (let index = 0; index < text.length; index += 1)
		if ((text.codePointAt(index) ?? 0) > LAST_PLAIN) return false;

	return true;
};

/** What each letter met so far folds to: the alphabet of an app is short. */
const FOLDED = new Map<string, string>();

const foldLetter = (letter: string) => {
	let folded = FOLDED.get(letter);

	if (folded === undefined) {
		folded = letter.normalize('NFD').charAt(0).toLowerCase();
		FOLDED.set(letter, folded);
	}

	return folded;
};

/**
 * A text without its accents and in lower case: what a search compares, so «perez»
 * finds «Pérez». The text is composed first (NFC), so an accent written as a
 * letter and its combining mark reads as one letter too; then each letter gives
 * one, so a place in the result is the same place in the composed text.
 *
 * @example
 * ```ts
 * fold('Ñuñoa'); // 'nunoa'
 * ```
 *
 * @param text - the text to compare
 *
 * @returns the text, folded
 */
export const fold = (text: string) => {
	if (isPlain(text)) return text.toLowerCase();

	let folded = '';

	for (const letter of text.normalize('NFC')) folded += foldLetter(letter);

	return folded;
};
