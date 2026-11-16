import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef } from 'react';
import { afterEach, describe, expect, test, vi } from 'vitest';
import { Input } from './Input.tsx';

describe(Input, () => {
	// hooks
	afterEach(cleanup);

	// tests
	test('is a text input by default that works uncontrolled', async () => {
		const ref = createRef<HTMLInputElement>();

		render(
			<Input
				aria-label='Nombre'
				className='extra'
				defaultValue='Ana'
				name='name'
				ref={ref}
			/>,
		);

		const input = screen.getByRole('textbox', { name: 'Nombre' });

		await userEvent.type(input, ' Pérez');

		expect(input).toHaveAttribute('type', 'text');
		expect(input).toHaveValue('Ana Pérez');
		expect(input).toHaveClass('extra');
		expect(ref.current).toBe(input);
	});

	test('works controlled and keeps the type given', async () => {
		const onChange = vi.fn();

		render(
			<Input
				aria-label='Correo'
				onChange={onChange}
				type='email'
				value='a@example.com'
			/>,
		);

		const input = screen.getByRole('textbox', { name: 'Correo' });

		await userEvent.type(input, 'x');

		expect(input).toHaveAttribute('type', 'email');
		expect(input).toHaveValue('a@example.com');
		expect(onChange).toHaveBeenCalledOnce();
	});

	test.each(['sm', 'md', 'lg'] as const)(
		'renders the size %s, disabled when asked',
		(size) => {
			render(<Input aria-label='Dato' disabled size={size} />);

			expect(
				screen.getByRole('textbox', { name: 'Dato' }),
			).toBeDisabled();
		},
	);
});
