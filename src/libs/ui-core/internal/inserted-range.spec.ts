import { describe, expect, test } from 'vitest';
import { insertedRange } from './inserted-range.ts';

describe(insertedRange, () => {
	test.each([
		// a key: the one character before the caret
		{ after: '9,80', before: '980', caret: 2, inserted: ',' },
		{ after: '1.2950', before: '1.250', caret: 4, inserted: '9' },
		{ after: '1.2505', before: '1.250', caret: 6, inserted: '5' },
		// the same character as the one after it
		{ after: '1.2250', before: '1.250', caret: 3, inserted: '2' },
		// a paste: the whole of it, in an empty field or in the middle of a text
		{ after: '1250000.50', before: '', caret: 10, inserted: '1250000.50' },
		{ after: '95,580', before: '980', caret: 4, inserted: '5,5' },
		{ after: '91.580', before: '980', caret: 4, inserted: '1.5' },
		// a paste that starts with the dot the field has right after it
		{ after: '1.50.250', before: '1.250', caret: 4, inserted: '.50' },
		// over a selection, part of the text or all of it
		{ after: '1.3,7.000', before: '1.250.000', caret: 5, inserted: '3,7' },
		{ after: '45.50', before: '1.250.000', caret: 5, inserted: '45.50' },
		// over a selection that started as what replaced it: what they share counts as
		// kept, which reads the same
		{ after: '12.50', before: '1.250.000', caret: 5, inserted: '2.50' },
		// nothing: a character taken away, before the caret or after it
		{ after: '1.250.00', before: '1.250.000', caret: 8, inserted: '' },
		{ after: '1.20.000', before: '1.250.000', caret: 3, inserted: '' },
		{ after: '', before: '980', caret: 0, inserted: '' },
	])(
		'«$before» made «$after» with the caret at $caret took «$inserted»',
		({ after, before, caret, inserted }) => {
			const { end, start } = insertedRange(before, after, caret);

			expect(after.slice(start, end)).toBe(inserted);
			expect(end).toBe(caret);
		},
	);

	test('takes the end of the text for a caret it is not told', () => {
		expect(insertedRange('', '1250000.50', null)).toStrictEqual({
			end: 10,
			start: 0,
		});
	});
});
