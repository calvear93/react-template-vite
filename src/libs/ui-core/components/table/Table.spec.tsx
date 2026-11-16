import { cleanup, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, test } from 'vitest';
import { Table } from './Table.tsx';

describe(Table, () => {
	// hooks
	afterEach(cleanup);

	// tests
	test.each(['comfortable', 'compact'] as const)(
		'is a table named by its caption, with its headers and rows (%s)',
		(density) => {
			render(
				<Table
					caption='Cotizaciones del período'
					className='extra'
					data-testid='wrapper'
					density={density}
					headers={['Mes', 'Trabajadores']}
					rows={[
						['Octubre', 42],
						['Noviembre', <strong key='n'>44</strong>],
					]}
				/>,
			);

			const table = screen.getByRole('table', {
				name: 'Cotizaciones del período',
			});

			expect(
				within(table)
					.getAllByRole('columnheader')
					.map((header) => header.textContent),
			).toStrictEqual(['Mes', 'Trabajadores']);
			expect(
				within(table)
					.getAllByRole('row')
					.map((row) => row.textContent),
			).toStrictEqual(['MesTrabajadores', 'Octubre42', 'Noviembre44']);
			expect(screen.getByTestId('wrapper')).toHaveClass('extra');
		},
	);

	test('works without a caption', () => {
		render(<Table headers={['Dato']} rows={[['Valor']]} />);

		expect(screen.getByRole('cell', { name: 'Valor' })).toBeInTheDocument();
	});
});
