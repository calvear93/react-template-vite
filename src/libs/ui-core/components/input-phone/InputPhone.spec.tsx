import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef } from 'react';
import { afterEach, describe, expect, test } from 'vitest';
import { Field } from '../field/Field.tsx';
import { InputPhone } from './InputPhone.tsx';

describe(InputPhone, () => {
	// hooks
	afterEach(cleanup);

	// tests
	test('is a phone input whose prefix is read with it, not typed', async () => {
		const ref = createRef<HTMLInputElement>();

		render(
			<InputPhone
				aria-label='Mobile'
				className='extra'
				maxLength={8}
				name='mobile'
				prefix='+569'
				ref={ref}
			/>,
		);

		const input = screen.getByRole('textbox', { name: 'Mobile' });

		await userEvent.type(input, '12345678');

		expect(input).toHaveAttribute('type', 'tel');
		expect(input).toHaveAccessibleDescription('+569');
		// as many digits as it is told to take, and the prefix is none of them
		expect(input).toHaveAttribute('maxlength', '8');
		expect(input).toHaveValue('12345678');
		expect(ref.current).toBe(input);
	});

	test.each(['sm', 'md', 'lg'] as const)(
		'takes a whole number when it has no prefix (%s)',
		async (size) => {
			render(<InputPhone aria-label='Phone' size={size} />);

			const input = screen.getByRole('textbox', { name: 'Phone' });

			await userEvent.type(input, '+1 202 555 0143');

			expect(input).toHaveValue('+1 202 555 0143');
			expect(input).toHaveAttribute('autocomplete', 'tel');
			expect(input).not.toHaveAccessibleDescription();
		},
	);

	test('adds the hint and the error of its field after the prefix', () => {
		render(
			<Field
				error='Digits missing'
				hint='10 digits'
				label='Mobile'
				required
			>
				<InputPhone prefix='+1' />
			</Field>,
		);

		const input = screen.getByRole('textbox', { name: 'Mobile' });

		expect(input).toBeRequired();
		expect(input).toBeInvalid();
		// the prefix is the code of the country: the browser offers the number without it
		expect(input).toHaveAttribute('autocomplete', 'tel-national');
		expect(input).toHaveAccessibleDescription(
			'+1 10 digits Digits missing',
		);
	});
});
