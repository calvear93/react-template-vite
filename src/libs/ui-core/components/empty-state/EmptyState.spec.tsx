import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, test } from 'vitest';
import { EmptyState } from './EmptyState.tsx';

describe(EmptyState, () => {
	// hooks
	afterEach(cleanup);

	// tests
	test('says why it is empty in a heading, what to do and how', () => {
		render(
			<EmptyState
				action={<a href='/reports/new'>Registrar denuncia</a>}
				className='extra'
				data-testid='empty'
				title='Aún no hay denuncias'
			>
				Cuando registre una, aparecerá aquí.
			</EmptyState>,
		);

		expect(
			screen.getByRole('heading', {
				level: 3,
				name: 'Aún no hay denuncias',
			}),
		).toBeInTheDocument();
		expect(
			screen.getByText('Cuando registre una, aparecerá aquí.'),
		).toBeInTheDocument();
		expect(
			screen.getByRole('link', { name: 'Registrar denuncia' }),
		).toBeInTheDocument();
		expect(screen.getByTestId('empty')).toHaveClass('extra');
	});

	test.each([2, 4, 6] as const)(
		'takes the heading level %i, compact and with another icon',
		(level) => {
			render(
				<EmptyState
					compact
					headingLevel={level}
					icon='search'
					title='Sin resultados'
				/>,
			);

			expect(
				screen.getByRole('heading', { level, name: 'Sin resultados' }),
			).toBeInTheDocument();
		},
	);
});
