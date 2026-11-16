import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, test } from 'vitest';
import { inChile } from '../../__mocks__/locale.mock.ts';
import { Label } from './Label.tsx';

inChile();

describe(Label, () => {
	// hooks
	afterEach(cleanup);

	// tests
	test('names the control it points to', () => {
		render(
			<>
				<Label className='extra' htmlFor='email'>
					Correo
				</Label>
				<input id='email' />
			</>,
		);

		expect(
			screen.getByRole('textbox', { name: 'Correo' }),
		).toBeInTheDocument();
		expect(screen.getByText('Correo')).toHaveClass('extra');
	});

	test('marks a required control without changing its name', () => {
		render(
			<>
				<Label htmlFor='rut' optional required>
					RUT
				</Label>
				<input id='rut' required />
			</>,
		);

		expect(screen.getByText('*')).toHaveAttribute('aria-hidden', 'true');
		expect(screen.getByRole('textbox', { name: 'RUT' })).toBeRequired();
		expect(screen.queryByText('(opcional)')).not.toBeInTheDocument();
	});

	test.each([
		{ expected: 'Teléfono (opcional)', props: {} },
		{
			expected: 'Teléfono (si tiene)',
			props: { optionalLabel: '(si tiene)' },
		},
	])('says a control is optional: $expected', ({ expected, props }) => {
		render(
			<>
				<Label htmlFor='phone' optional {...props}>
					Teléfono
				</Label>
				<input id='phone' />
			</>,
		);

		expect(
			screen.getByRole('textbox', { name: expected }),
		).toBeInTheDocument();
	});
});
