import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, test, vi } from 'vitest';
import { inChile } from '../../__mocks__/locale.mock.ts';
import { Drawer } from './Drawer.tsx';

inChile();

describe(Drawer, () => {
	// hooks
	afterEach(cleanup);

	// tests
	test('renders nothing while it is closed', () => {
		render(<Drawer onOpenChange={vi.fn()} open={false} title='Filtros' />);

		expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
	});

	test.each([
		{ side: 'right', size: 'sm' },
		{ side: 'left', size: 'md' },
		{ side: 'right', size: 'lg' },
		{ side: 'left', size: 'xl' },
	] as const)(
		'is a modal dialog named by its title, with its body and footer ($side, $size)',
		(props) => {
			render(
				<Drawer
					className='extra'
					footer={<button type='button'>Aplicar filtros</button>}
					onOpenChange={vi.fn()}
					open
					title='Filtros'
					{...props}
				>
					<input aria-label='Buscar' />
				</Drawer>,
			);

			const drawer = screen.getByRole('dialog', { name: 'Filtros' });

			expect(drawer).toHaveAttribute('open');
			expect(
				within(drawer).getByRole('heading', { level: 2 }),
			).toHaveTextContent('Filtros');
			expect(
				within(drawer).getByRole('button', { name: 'Aplicar filtros' }),
			).toBeInTheDocument();
			expect(
				screen.getByRole('textbox', { name: 'Buscar' }),
			).toHaveFocus();
		},
	);

	test.each([
		{
			how: 'its close button',
			act: () =>
				userEvent.click(screen.getByRole('button', { name: 'Cerrar' })),
		},
		{ how: 'Escape', act: () => userEvent.keyboard('{Escape}') },
		{
			how: 'its veil',
			act: () => userEvent.click(screen.getByRole('dialog')),
		},
	])('asks to close with $how', async ({ act }) => {
		const onOpenChange = vi.fn();

		render(
			<Drawer
				closeLabel='Cerrar'
				onOpenChange={onOpenChange}
				open
				title='Filtros'
			>
				Contenido
			</Drawer>,
		);

		await act();

		expect(onOpenChange).toHaveBeenCalledExactlyOnceWith(false);
	});

	test('does not close from a click inside its panel', async () => {
		const onOpenChange = vi.fn();

		render(
			<Drawer onOpenChange={onOpenChange} open title='Filtros'>
				Contenido
			</Drawer>,
		);

		await userEvent.click(screen.getByText('Contenido'));

		expect(onOpenChange).not.toHaveBeenCalled();
		expect(
			screen.getByRole('button', { name: 'Cerrar panel' }),
		).toBeInTheDocument();
	});
});
