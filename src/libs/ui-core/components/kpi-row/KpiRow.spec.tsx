import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, test, vi } from 'vitest';
import { inChile } from '../../__mocks__/locale.mock.ts';
import { KpiRow } from './KpiRow.tsx';

inChile();

describe(KpiRow, () => {
	// hooks
	afterEach(cleanup);

	// tests
	test('shows each figure with its label, value, second line and badge', () => {
		render(
			<KpiRow
				className='extra'
				data-testid='row'
				items={[
					{
						label: 'Denuncias abiertas',
						sub: '3 por vencer',
						value: 12,
					},
					undefined,
					{
						badge: 'Récord',
						badgeTone: 'success',
						label: 'Días sin accidentes',
						value: 148,
					},
					{ badge: 'Nuevo', label: 'Centros', value: 4 },
					false,
				]}
			/>,
		);

		const row = screen.getByTestId('row');

		expect(row).toHaveTextContent(
			'Denuncias abiertas123 por vencerDías sin accidentesRécord148CentrosNuevo4',
		);
		expect(row).toHaveClass('extra');
		expect(screen.queryByRole('link')).not.toBeInTheDocument();
		expect(screen.queryByRole('button')).not.toBeInTheDocument();
	});

	test('makes a figure with an href a link that says it leads somewhere', () => {
		render(
			<KpiRow
				items={[
					{ href: '/reports', label: 'Denuncias', value: 12 },
					{
						href: '/branches',
						label: 'Centros',
						linkLabel: 'Ver centros',
						value: 4,
					},
				]}
				linkLabel='Abrir'
			/>,
		);

		expect(
			// the visible text of the link is part of its name
			screen.getByRole('link', { name: /Denuncias\s*12\s*Abrir/u }),
		).toHaveAttribute('href', '/reports');
		expect(screen.getByText('Ver centros')).toBeInTheDocument();
	});

	test('makes a figure with an action a button', async () => {
		const onClick = vi.fn();

		render(<KpiRow items={[{ label: 'Pendientes', onClick, value: 7 }]} />);

		await userEvent.click(
			screen.getByRole('button', { name: /Pendientes/u }),
		);

		expect(onClick).toHaveBeenCalledOnce();
		expect(screen.getByText('Ver detalle')).toBeInTheDocument();
	});
});
