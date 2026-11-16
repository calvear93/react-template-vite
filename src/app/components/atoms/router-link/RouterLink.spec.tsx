import { createRouter, useLocation } from '#libs/router';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterAll, beforeAll, describe, expect, test } from 'vitest';
import { RouterLink } from './RouterLink.tsx';

const CURRENT = 'aria-current';

describe(RouterLink, () => {
	// hooks
	beforeAll(() => {
		const Router = createRouter({
			options: { initialEntries: ['/'] },
			type: 'memory',
			routes: [
				{
					Component: () => (
						<RouterLink className='extra' href='/orders'>
							Pedidos
						</RouterLink>
					),
				},
				{
					path: 'orders',
					Component: () => (
						<>
							<h1>Pedidos</h1>
							<RouterLink href='/orders'>Aquí</RouterLink>
							<RouterLink aria-current='page' href='/users'>
								Marcado
							</RouterLink>
							<RouterLink href='/users'>Otro</RouterLink>
						</>
					),
				},
			],
		});

		render(<Router />);
	});

	afterAll(cleanup);

	// tests
	test('is an anchor to the route, with the props given', () => {
		const link = screen.getByRole('link', { name: 'Pedidos' });

		expect(link).toHaveAttribute('href', '/orders');
		expect(link).toHaveClass('extra');
	});

	test('navigates without leaving the app and marks the current route', async () => {
		await userEvent.click(screen.getByRole('link', { name: 'Pedidos' }));

		await expect(
			screen.findByRole('heading', { name: 'Pedidos' }),
		).resolves.toBeInTheDocument();
		expect(screen.getByRole('link', { name: 'Aquí' })).toHaveAttribute(
			CURRENT,
			'page',
		);
	});

	test('marks the page it is told to, whatever the route', () => {
		expect(screen.getByRole('link', { name: 'Marcado' })).toHaveAttribute(
			CURRENT,
			'page',
		);
		expect(screen.getByRole('link', { name: 'Otro' })).not.toHaveAttribute(
			CURRENT,
		);
	});
});

describe('RouterLink that becomes the current page', () => {
	// hooks
	afterAll(cleanup);

	// tests
	test('is still the same element, with the focus it had when it was followed', async () => {
		const Menu = () => {
			const { pathname } = useLocation();

			return (
				<nav>
					<RouterLink
						aria-current={
							pathname === '/users' ? 'page' : undefined
						}
						href='/users'
					>
						Usuarios
					</RouterLink>
					<RouterLink href='/orders/'>Pedidos</RouterLink>
					<RouterLink href='/'>Inicio</RouterLink>
					<p>{pathname}</p>
				</nav>
			);
		};
		const Router = createRouter({
			options: { initialEntries: ['/Orders/12'] },
			routes: [{ Component: Menu, path: '*' }],
			type: 'memory',
		});

		render(<Router />);

		const link = screen.getByRole('link', { name: 'Usuarios' });

		// a route that holds the one shown is current, whatever its case; the home is not
		expect(screen.getByRole('link', { name: 'Pedidos' })).toHaveAttribute(
			CURRENT,
			'page',
		);
		expect(
			screen.getByRole('link', { name: 'Inicio' }),
		).not.toHaveAttribute(CURRENT);
		await userEvent.click(link);
		await screen.findByText('/users');

		expect(screen.getByRole('link', { name: 'Usuarios' })).toBe(link);
		expect(link).toHaveAttribute(CURRENT, 'page');
		expect(link).toHaveFocus();
	});
});
