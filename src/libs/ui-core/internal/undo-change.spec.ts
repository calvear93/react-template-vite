import { describe, expect, test } from 'vitest';
import { undoChange } from './undo-change.ts';

/** An input as a key or a paste left it: its new text, the caret after what was put in. */
const changed = (after: string, caret: number) => {
	const input = document.createElement('input');

	input.value = after;
	input.setSelectionRange(caret, caret);

	return input;
};

describe(undoChange, () => {
	test.each([
		// a key in the middle, at the start and at the end
		{ after: '05-711-2026', before: '05-11-2026', caret: 4, was: 3 },
		{ after: '705-11-2026', before: '05-11-2026', caret: 1, was: 0 },
		{ after: '05-11-20267', before: '05-11-2026', caret: 11, was: 10 },
		// a paste
		{ after: '09:1530', before: '09:30', caret: 5, was: 3 },
		// over a selection: its start
		{ after: '1.99.000', before: '1.250.000', caret: 4, was: 2 },
	])(
		'puts «$before» back in place of «$after», the caret at $was',
		({ after, before, caret, was }) => {
			const input = changed(after, caret);

			undoChange(input, before);

			expect(input.value).toBe(before);
			expect(input.selectionStart).toBe(was);
			expect(input.selectionEnd).toBe(was);
		},
	);
});
