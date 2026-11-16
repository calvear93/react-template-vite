import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef, useState } from 'react';
import { afterEach, describe, expect, test, vi } from 'vitest';
import { Switch } from './Switch.tsx';

const Controlled = () => {
	const [isOn, setIsOn] = useState(true);

	return (
		<Switch
			checked={isOn}
			onChange={(event) => setIsOn(event.target.checked)}
			stateLabels={['Activadas', 'Desactivadas']}
		>
			Notificaciones
		</Switch>
	);
};

describe(Switch, () => {
	// hooks
	afterEach(cleanup);

	// tests
	test('is a switch named by its text and described by its description', () => {
		const ref = createRef<HTMLInputElement>();

		render(
			<Switch
				className='extra'
				description='Un correo por cada cambio de estado'
				name='notify'
				ref={ref}
			>
				Notificaciones por correo
			</Switch>,
		);

		const control = screen.getByRole('switch', {
			name: 'Notificaciones por correo',
		});

		expect(control).not.toBeChecked();
		expect(control).toHaveAccessibleDescription(
			'Un correo por cada cambio de estado',
		);
		expect(ref.current).toBe(control);
	});

	test.each(['md', 'sm'] as const)(
		'toggles uncontrolled and says its state in words (%s)',
		async (size) => {
			const onChange = vi.fn();

			render(
				<Switch
					defaultChecked
					onChange={onChange}
					size={size}
					stateLabels={['Activado', 'Desactivado']}
				>
					Modo mantenimiento
				</Switch>,
			);

			const control = screen.getByRole('switch');

			expect(control).toBeChecked();
			expect(screen.getByText('Activado')).toHaveAttribute(
				'aria-hidden',
				'true',
			);

			await userEvent.click(control);

			expect(control).not.toBeChecked();
			expect(screen.getByText('Desactivado')).toBeInTheDocument();
			expect(onChange).toHaveBeenCalledOnce();
		},
	);

	test('follows the value it is given when controlled', async () => {
		render(<Controlled />);

		await userEvent.click(screen.getByText('Notificaciones'));

		expect(screen.getByRole('switch')).not.toBeChecked();
		expect(screen.getByText('Desactivadas')).toBeInTheDocument();
	});

	test('cannot change when disabled', async () => {
		render(<Switch disabled>Bloqueado</Switch>);

		await userEvent.click(screen.getByText('Bloqueado'));

		expect(screen.getByRole('switch')).not.toBeChecked();
		expect(screen.getByRole('switch')).toBeDisabled();
	});
});
