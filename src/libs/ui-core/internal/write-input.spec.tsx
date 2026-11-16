import { cleanup, render, screen } from '@testing-library/react';
import { type ChangeEvent, useState } from 'react';
import { afterEach, describe, expect, test, vi } from 'vitest';
import { writeInput } from './write-input.ts';

const WRITTEN = '05-11-2026';

/** An input whose text its component holds, as every masked field of the kit. */
const Held = ({
	onChange,
}: {
	onChange: (event: ChangeEvent<HTMLInputElement>) => void;
}) => {
	const [text, setText] = useState('15');

	return (
		<input
			aria-label='Fecha'
			onChange={(event) => {
				setText(event.target.value);
				onChange(event);
			}}
			value={text}
		/>
	);
};

const input = () => screen.getByRole<HTMLInputElement>('textbox');

describe(writeInput, () => {
	// hooks
	afterEach(cleanup);

	// tests
	test('puts the text in an input whose component holds it, which hears it as a change', () => {
		const seen: string[] = [];

		render(<Held onChange={(event) => seen.push(event.target.value)} />);

		writeInput(input(), WRITTEN);

		expect(seen).toStrictEqual([WRITTEN]);
		expect(input()).toHaveValue(WRITTEN);
	});

	test('says so with an `input` event that bubbles, as a key does', () => {
		const onInput = vi.fn();

		render(<Held onChange={vi.fn()} />);
		document.body.addEventListener('input', onInput, { once: true });

		writeInput(input(), WRITTEN);

		expect(onInput).toHaveBeenCalledOnce();
	});

	test('tells nothing when the text is the one the input had', () => {
		const onChange = vi.fn();

		render(<Held onChange={onChange} />);

		writeInput(input(), '15');

		expect(onChange).not.toHaveBeenCalled();
	});
});
