import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRef, useState } from 'react';
import { afterEach, describe, expect, test } from 'vitest';
import { useMaskedCaret } from './use-masked-caret.hook.ts';

const isDigit = (character: string) => /\d/u.test(character);

// digits in pairs (12-34-56); a text with letters is left as it is
const mask = (text: string) =>
	/[a-z]/u.test(text)
		? text
		: (text.replaceAll(/\D/gu, '').match(/\d{1,2}/gu) ?? []).join('-');

const Masked = ({ initial = '' }: { initial?: string }) => {
	const input = useRef<HTMLInputElement>(null);
	const [text, setText] = useState(initial);
	const keepCaret = useMaskedCaret(input, text, isDigit);

	return (
		<input
			aria-label='Código'
			onChange={(event) => {
				keepCaret(event.target.value, event.target.selectionStart);
				setText(mask(event.target.value));
			}}
			ref={input}
			value={text}
		/>
	);
};

const field = () => screen.getByRole<HTMLInputElement>('textbox');

describe(useMaskedCaret, () => {
	// hooks
	afterEach(cleanup);

	// tests
	test('leaves the caret at the end while typing at the end', async () => {
		render(<Masked />);

		await userEvent.type(field(), '12345');

		expect(field()).toHaveValue('12-34-5');
		expect(field().selectionStart).toBe(7);
	});

	test('keeps the caret after what was typed in the middle', async () => {
		render(<Masked initial='12-34' />);

		// between the 1 and the 2
		await userEvent.type(field(), '9', {
			initialSelectionEnd: 1,
			initialSelectionStart: 1,
		});

		expect(field()).toHaveValue('19-23-4');
		expect(field().selectionStart).toBe(2);
	});

	test('counts only what was typed, not the characters of the mask', async () => {
		render(<Masked initial='12-34' />);

		// right after the dash: two digits before the caret
		await userEvent.type(field(), '9', {
			initialSelectionEnd: 3,
			initialSelectionStart: 3,
		});

		expect(field()).toHaveValue('12-93-4');
		expect(field().selectionStart).toBe(4);
	});

	test('leaves the caret alone when the mask changed nothing', async () => {
		render(<Masked initial='abc' />);

		await userEvent.type(field(), 'x', {
			initialSelectionEnd: 1,
			initialSelectionStart: 1,
		});

		expect(field()).toHaveValue('axbc');
		expect(field().selectionStart).toBe(2);
	});
});
