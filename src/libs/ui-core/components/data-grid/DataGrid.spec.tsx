import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, test } from 'vitest';
import { inChile } from '../../__mocks__/locale.mock.ts';
import { DataGrid } from './DataGrid.tsx';

inChile();

describe(DataGrid, () => {
	// hooks
	afterEach(cleanup);

	// tests
	test('pairs each label with its value, skipping falsy entries', () => {
		render(
			<DataGrid
				className='extra'
				data-testid='grid'
				entries={[
					{ label: 'RUT', value: '12.345.678-5' },
					false,
					{
						label: 'Correo',
						value: <a href='mailto:a@example.com'>a@example.com</a>,
					},
					null,
					{
						label: 'Observaciones',
						value: 'Sin novedades',
						wide: true,
					},
				]}
			/>,
		);

		expect(
			screen.getAllByRole('term').map((term) => term.textContent),
		).toStrictEqual(['RUT', 'Correo', 'Observaciones']);
		expect(
			screen
				.getAllByRole('definition')
				.map((definition) => definition.textContent),
		).toStrictEqual(['12.345.678-5', 'a@example.com', 'Sin novedades']);
		expect(screen.getByTestId('grid')).toHaveClass('extra');
	});

	test.each([
		{ shown: '—', value: null },
		{ shown: '—', value: undefined },
		{ shown: '—', value: '' },
		{ shown: 'Sí', value: true },
		{ shown: 'No', value: false },
		{ shown: '0', value: 0 },
	])('shows $value as «$shown»', ({ shown, value }) => {
		render(<DataGrid entries={[{ label: 'Dato', value }]} />);

		expect(screen.getByRole('definition')).toHaveTextContent(shown);
	});

	test('marks an empty value, and never a boolean, as empty', () => {
		render(
			<DataGrid
				entries={[
					{ label: 'Vacío', value: null },
					{ label: 'Falso', value: false },
				]}
			/>,
		);

		const [empty, falsy] = screen.getAllByRole('definition');

		expect(empty).toHaveAttribute('data-empty');
		expect(falsy).not.toHaveAttribute('data-empty');
	});

	test('reads empty and boolean values with the labels given', () => {
		render(
			<DataGrid
				booleanLabels={['Vigente', 'No vigente']}
				emptyLabel='Sin dato'
				entries={[
					{ label: 'Correo', value: null },
					{ label: 'Estado', value: true },
				]}
			/>,
		);

		expect(
			screen
				.getAllByRole('definition')
				.map((definition) => definition.textContent),
		).toStrictEqual(['Sin dato', 'Vigente']);
	});
});
