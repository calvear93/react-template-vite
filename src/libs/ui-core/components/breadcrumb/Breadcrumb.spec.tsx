import { cleanup, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, test } from 'vitest';
import { inChile } from '../../__mocks__/locale.mock.ts';
import { Breadcrumb } from './Breadcrumb.tsx';

inChile();

describe(Breadcrumb, () => {
	// hooks
	afterEach(cleanup);

	// tests
	test('is a named navigation with its levels in order', () => {
		render(
			<Breadcrumb
				className='extra'
				items={[
					{ href: '/', label: 'Inicio' },
					{ href: '/reports', label: 'Denuncias' },
					{ href: '/reports/42', label: 'ACH-2026-001482' },
				]}
			/>,
		);

		const nav = screen.getByRole('navigation', { name: 'Ruta' });

		expect(
			within(nav)
				.getAllByRole('listitem')
				.map((item) => item.textContent),
		).toStrictEqual(['Inicio/', 'Denuncias/', 'ACH-2026-001482']);
		expect(nav).toHaveClass('extra');
	});

	test('links every level but the last, which is the current page', () => {
		render(
			<Breadcrumb
				items={[
					{ href: '/', label: 'Inicio' },
					{ href: '/reports', label: 'Denuncias' },
					{ href: '/reports/42', label: 'ACH-2026-001482' },
				]}
				label='Usted está en'
			/>,
		);

		expect(
			screen
				.getAllByRole('link')
				.map((link) => link.getAttribute('href')),
		).toStrictEqual(['/', '/reports']);
		expect(screen.getByText('ACH-2026-001482')).toHaveAttribute(
			'aria-current',
			'page',
		);
		expect(
			screen.getByRole('navigation', { name: 'Usted está en' }),
		).toBeInTheDocument();
	});

	test('shows a level without an href as text', () => {
		render(
			<Breadcrumb
				items={[{ label: 'Archivo' }, { label: 'Año 2024' }]}
			/>,
		);

		expect(screen.queryByRole('link')).not.toBeInTheDocument();
		expect(screen.getByText('Archivo')).not.toHaveAttribute('aria-current');
	});
});
