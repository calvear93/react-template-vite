import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, test } from 'vitest';
import { inChile } from '../../__mocks__/locale.mock.ts';
import { Input } from '../input/Input.tsx';
import { Field } from './Field.tsx';

inChile();

describe(Field, () => {
	// hooks
	afterEach(cleanup);

	// tests
	test('names its control with the label', () => {
		render(
			<Field className='extra' label='Correo'>
				<Input name='email' />
			</Field>,
		);

		const control = screen.getByRole('textbox', { name: 'Correo' });

		expect(control).toBeValid();
		expect(control).not.toBeRequired();
		expect(control).not.toHaveAttribute('aria-describedby');
	});

	test('ties the hint and the error to the control and marks it invalid', () => {
		render(
			<Field
				error='Escriba un correo con @'
				hint='Le escribiremos solo por este trámite'
				label='Correo'
			>
				<Input />
			</Field>,
		);

		const control = screen.getByRole('textbox', { name: 'Correo' });

		expect(control).toBeInvalid();
		expect(control).toHaveAccessibleDescription(
			'Le escribiremos solo por este trámite Escriba un correo con @',
		);
	});

	test('makes its control required and marks the label', () => {
		render(
			<Field label='RUT' required>
				<Input />
			</Field>,
		);

		expect(screen.getByRole('textbox', { name: 'RUT' })).toBeRequired();
		expect(screen.getByText('*')).toHaveAttribute('aria-hidden', 'true');
	});

	test('says a control is optional in its label', () => {
		render(
			<Field label='Teléfono' optional>
				<Input />
			</Field>,
		);

		expect(
			screen.getByRole('textbox', { name: 'Teléfono (opcional)' }),
		).not.toBeRequired();
	});

	test('uses the id given for the control and its messages', () => {
		render(
			<Field hint='Ayuda' id='email' label='Correo'>
				<Input />
			</Field>,
		);

		const control = screen.getByRole('textbox', { name: 'Correo' });

		expect(control).toHaveAttribute('id', 'email');
		expect(control).toHaveAttribute('aria-describedby', 'email-hint');
	});

	test('lets what the control was given win over the field', () => {
		render(
			<Field error='Dato inválido' label='Correo' required>
				<Input
					aria-describedby='extra-help'
					aria-invalid={false}
					required={false}
				/>
			</Field>,
		);

		const control = screen.getByRole('textbox', { name: 'Correo' });

		expect(control).not.toBeRequired();
		expect(control).toHaveAttribute('aria-invalid', 'false');
		expect(control).toHaveAttribute(
			'aria-describedby',
			expect.stringMatching(/^extra-help .+-error$/u),
		);
	});

	test('gives its props to a control that is not of the kit', () => {
		render(
			<Field error='Elija un color' label='Color' required>
				{(props) => <input type='text' {...props} />}
			</Field>,
		);

		const control = screen.getByRole('textbox', { name: 'Color' });

		expect(control).toBeRequired();
		expect(control).toBeInvalid();
		expect(control).toHaveAccessibleDescription('Elija un color');
	});

	test('announces its error when it appears, and ties it to the control', () => {
		const field = (error?: string) => (
			<Field error={error} id='email' label='Correo'>
				{(props) => <input type='email' {...props} />}
			</Field>
		);
		const { rerender } = render(field());

		expect(screen.getByRole('textbox')).not.toHaveAccessibleDescription();

		rerender(field('Escriba el correo completo'));

		const error = screen.getByText('Escriba el correo completo');

		expect(error).toHaveAttribute('aria-live', 'polite');
		expect(error).toHaveAttribute('id', 'email-error');
		expect(screen.getByRole('textbox')).toHaveAccessibleDescription(
			'Escriba el correo completo',
		);
	});
});
