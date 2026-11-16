import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, test, vi } from 'vitest';
import { inChile } from '../../__mocks__/locale.mock.ts';
import { Alert, ErrorAlert } from './Alert.tsx';

inChile();

describe(Alert, () => {
	// hooks
	afterEach(cleanup);

	// tests
	test.each(['info', 'success', 'warning', 'neutral'] as const)(
		'is a status with its title and text in the tone %s',
		(tone) => {
			render(
				<Alert
					className='extra'
					title='Faltan 2 documentos'
					tone={tone}
				>
					Puede enviarlos hasta el 30 de noviembre.
				</Alert>,
			);

			const alert = screen.getByRole('status');

			expect(alert).toHaveTextContent(
				'Faltan 2 documentosPuede enviarlos hasta el 30 de noviembre.',
			);
			expect(alert).toHaveClass('extra');
		},
	);

	test('is announced at once when it is a danger', () => {
		render(<Alert tone='danger'>No se guardó el registro</Alert>);

		expect(screen.getByRole('alert')).toHaveTextContent(
			'No se guardó el registro',
		);
	});

	test('shows its actions and takes another icon', () => {
		render(
			<Alert
				actions={<button type='button'>Cargar documentos</button>}
				icon='clock'
				title='Pendiente'
			/>,
		);

		expect(
			screen.getByRole('button', { name: 'Cargar documentos' }),
		).toBeInTheDocument();
	});

	test('has a close button only when it can be closed', async () => {
		const onClose = vi.fn();
		const { rerender } = render(<Alert title='Aviso' />);

		expect(screen.queryByRole('button')).not.toBeInTheDocument();

		rerender(
			<Alert closeLabel='Cerrar aviso' onClose={onClose} title='Aviso' />,
		);

		await userEvent.click(
			screen.getByRole('button', { name: 'Cerrar aviso' }),
		);

		expect(onClose).toHaveBeenCalledOnce();
	});
});

describe(ErrorAlert, () => {
	// hooks
	afterEach(cleanup);

	// tests
	test('shows the title, the message and the support code of the error', () => {
		render(
			<ErrorAlert
				error={{
					correlationId: 'a1b2-c3d4',
					message: 'El RUT ya está registrado',
					title: 'No se creó el usuario',
				}}
			/>,
		);

		const alert = screen.getByRole('alert');

		expect(alert).toHaveTextContent('No se creó el usuario');
		expect(alert).toHaveTextContent('El RUT ya está registrado');
		expect(alert).toHaveTextContent('Código de soporte: a1b2-c3d4');
	});

	test('takes a plain Error, with its own title', () => {
		render(
			<ErrorAlert
				error={new Error('Sin conexión')}
				title='No se pudo guardar'
			/>,
		);

		const alert = screen.getByRole('alert');

		expect(alert).toHaveTextContent('No se pudo guardarSin conexión');
		expect(alert).not.toHaveTextContent('Código de soporte');
	});

	test.each([[null], [undefined], ['falló'], [{ message: 42 }]])(
		'says only that the action failed for %j',
		(error) => {
			render(<ErrorAlert error={error} supportLabel='Código' />);

			expect(screen.getByRole('alert')).toHaveTextContent(
				/^No se pudo completar la acción$/u,
			);
		},
	);
});
