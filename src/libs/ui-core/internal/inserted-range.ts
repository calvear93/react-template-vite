/**
 * Where what was just typed or pasted in a field is, in its new text: from where
 * that text stops being the one the field had, to its caret (a key or a paste
 * leaves the caret at the end of what it put in; a text dropped on the field is
 * left selected, and the end of that selection is its end).
 *
 * What follows the caret is the end of the text the field had, so what comes
 * before it there is all an insertion could have left alone: the start is never
 * looked for past that. When what was put in replaced a selection and starts as
 * that selection did, the characters they share count as kept (they are in the
 * text either way). A character taken away gives an empty range.
 *
 * @example
 * ```ts
 * insertedRange('980', '9,80', 2); // { start: 1, end: 2 }: a comma typed after the 9
 * insertedRange('', '1250000.50', 10); // { start: 0, end: 10 }: a paste
 * insertedRange('1.250.000', '1.250.00', 8); // { start: 8, end: 8 }: a backspace
 * ```
 *
 * @param before - the text the field had
 * @param after - the text it has now
 * @param caret - where its caret is now (the end of its selection); the end of the
 *   text when it is not known
 *
 * @returns the start and the end of what was put in, in `after`
 */
export const insertedRange = (
	before: string,
	after: string,
	caret: number | null,
) => {
	const end = caret ?? after.length;
	// as much of the text there was as comes before the part that follows the caret
	const kept = Math.max(0, before.length - (after.length - end));
	const limit = Math.min(kept, end);
	let start = 0;

	while (start < limit && before.charAt(start) === after.charAt(start))
		start++;

	return { end, start };
};
