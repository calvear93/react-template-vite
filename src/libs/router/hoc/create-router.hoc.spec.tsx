import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, test } from 'vitest';
import { createRouter } from './create-router.hoc.tsx';

describe('create-router', () => {
	const Layout = ({ children }: React.PropsWithChildren) => (
		<div>
			<h1>layout</h1>
			{children}
		</div>
	);

	const Children = () => <div>children</div>;

	// hooks
	afterEach(() => {
		cleanup();
	});

	// tests
	test('renders a route', () => {
		const Router = createRouter({
			routes: [{ element: <h1>Root Route</h1> }],
			type: 'memory',
		});

		render(<Router />);

		screen.getByRole('heading', { name: 'Root Route' });
	});

	test('renders a route with layout', () => {
		const RouterWithLayout = createRouter({
			routes: [{ children: [{ Component: Children }], Layout }],
			type: 'memory',
		});

		render(<RouterWithLayout />);

		screen.getByRole('heading');
	});

	test('renders a route with layout and suspense', () => {
		const RouterWithLayout = createRouter({
			type: 'memory',
			routes: [
				{
					children: [{ Component: Children }],
					Layout,
					loading: 'loading',
				},
			],
		});

		render(<RouterWithLayout />);

		screen.getByRole('heading');
	});
});
