import { type RefObject, useLayoutEffect, useRef } from 'react';

/**
 * Keeps the caret of a masked input where the person was typing. A mask rewrites
 * the whole text (dots, dashes), which sends the caret to the end; this puts it
 * back after the same number of meaningful characters it had before.
 *
 * @example
 * ```ts
 * const keepCaret = useMaskedCaret(input, text, isDigit);
 *
 * const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
 *   keepCaret(event.target.value, event.target.selectionStart);
 *   setText(mask(event.target.value));
 * };
 * ```
 *
 * @param input - the masked input
 * @param text - its text, once masked
 * @param counts - whether a character is one the person typed (not one of the mask)
 *
 * @returns the function to call with what was typed, before the text is masked
 */
export const useMaskedCaret = (
	input: RefObject<HTMLInputElement | null>,
	text: string,
	counts: (character: string) => boolean,
) => {
	const pending = useRef<{ count: number; typed: string }>(null);

	useLayoutEffect(() => {
		const kept = pending.current;

		pending.current = null;

		// a text the mask left as it was typed already has its caret right
		if (!kept || kept.typed === text || !input.current) return;

		let position = 0;

		for (
			let seen = 0;
			position < text.length && seen < kept.count;
			position++
		)
			if (counts(text.charAt(position))) seen++;

		input.current.setSelectionRange(position, position);
	}, [counts, input, text]);

	return (typed: string, selectionStart: number | null) => {
		pending.current = {
			typed,
			count: [...typed.slice(0, selectionStart ?? typed.length)].filter(
				(character) => counts(character),
			).length,
		};
	};
};
