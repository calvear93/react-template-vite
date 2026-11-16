import { cleanup, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, test } from 'vitest';
import { Card } from './Card.tsx';

describe(Card, () => {
	// hooks
	afterEach(cleanup);

	// tests
	test('is a region named by its title, a heading of level 2', () => {
		render(
			<Card
				actions={<button type='button'>Editar</button>}
				className='extra'
				description='Como figuran en el contrato'
				footer={<a href='/history'>Ver historial</a>}
				label='Trabajador'
				title='Datos del trabajador'
			>
				Contenido
			</Card>,
		);

		const card = screen.getByRole('region', {
			name: 'Datos del trabajador',
		});

		expect(
			within(card).getByRole('heading', {
				level: 2,
				name: 'Datos del trabajador',
			}),
		).toBeInTheDocument();
		expect(card).toHaveTextContent(
			'TrabajadorDatos del trabajadorComo figuran en el contratoEditarContenidoVer historial',
		);
		expect(card).toHaveClass('extra');
	});

	test.each(['none', 'sm', 'md', 'lg'] as const)(
		'takes the heading level given, at elevation %s',
		(elevation) => {
			render(
				<Card elevation={elevation} headingLevel={3} title='Resumen'>
					Contenido
				</Card>,
			);

			expect(
				screen.getByRole('heading', { level: 3, name: 'Resumen' }),
			).toBeInTheDocument();
		},
	);

	test('is an unnamed surface without a title, with only its content', () => {
		render(<Card data-testid='card'>Solo contenido</Card>);

		expect(screen.getByTestId('card')).toHaveTextContent(
			/^Solo contenido$/u,
		);
		expect(screen.queryByRole('region')).not.toBeInTheDocument();
		expect(screen.queryByRole('heading')).not.toBeInTheDocument();
	});

	test('keeps its header for actions without a title', () => {
		render(<Card actions={<button type='button'>Exportar</button>} />);

		expect(
			screen.getByRole('button', { name: 'Exportar' }),
		).toBeInTheDocument();
	});
});
