import { cleanup, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, test } from 'vitest';
import { PageHeader } from './PageHeader.tsx';

describe(PageHeader, () => {
	// hooks
	afterEach(cleanup);

	// tests
	test('is the heading of the page, with only its title', () => {
		render(
			<PageHeader
				aria-label='Encabezado'
				className='extra'
				role='group'
				title='Órdenes'
			/>,
		);

		const header = screen.getByRole('group', { name: 'Encabezado' });

		expect(
			within(header).getByRole('heading', { level: 1, name: 'Órdenes' }),
		).toBeVisible();
		expect(header).toHaveClass('extra');
		expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
		expect(screen.queryByRole('button')).not.toBeInTheDocument();
		expect(screen.queryByRole('banner')).not.toBeInTheDocument();
	});

	test('adds a line under the title and the actions of the page', () => {
		render(
			<PageHeader
				actions={<button type='button'>Nueva orden</button>}
				meta='57 órdenes abiertas'
				title='Órdenes'
			/>,
		);

		expect(screen.getByText('57 órdenes abiertas')).toBeVisible();
		expect(
			screen.getByRole('button', { name: 'Nueva orden' }),
		).toBeVisible();
	});

	test('draws the trail it is given as data, its last item the current page', () => {
		render(
			<PageHeader
				breadcrumb={[
					{ href: '/orders', label: 'Órdenes' },
					{ label: 'ACH-2026-001482' },
				]}
				title='Orden ACH-2026-001482'
			/>,
		);

		const trail = within(screen.getByRole('navigation'));

		expect(trail.getByRole('link', { name: 'Órdenes' })).toHaveAttribute(
			'href',
			'/orders',
		);
		expect(trail.getByText('ACH-2026-001482')).toHaveAttribute(
			'aria-current',
			'page',
		);
	});

	test('takes any other node as its trail', () => {
		render(
			<PageHeader
				breadcrumb={<a href='/orders'>Volver a Órdenes</a>}
				title='Orden'
			/>,
		);

		expect(
			screen.getByRole('link', { name: 'Volver a Órdenes' }),
		).toBeVisible();
	});
});
