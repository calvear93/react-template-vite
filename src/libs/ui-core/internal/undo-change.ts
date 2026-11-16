import { insertedRange } from './inserted-range.ts';

/**
 * Puts a field back as it was before a change it does not take (a key or a paste
 * that does not fit in a full field): its text, and its caret where the change
 * began, as a field with a `maxLength` leaves it. Left to React, a controlled
 * input gets its text back with the caret at its end.
 *
 * @example
 * ```ts
 * const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
 *   if (digitsOf(event.target.value) > DIGITS) return undoChange(event.target, text);
 *   …
 * };
 * ```
 *
 * @param input - the input, with the text the change left in it
 * @param before - the text it had
 */
export const undoChange = (input: HTMLInputElement, before: string) => {
	const { start } = insertedRange(before, input.value, input.selectionEnd);

	input.value = before;
	input.setSelectionRange(start, start);
};
