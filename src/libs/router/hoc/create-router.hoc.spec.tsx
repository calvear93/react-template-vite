import { describe, expect, test } from 'vitest';
import { type PropsWithChildren } from 'react';
import { cleanup, render, screen } from '@testing-library/react';
import { createRouter } from './create-router.hoc';

describe('create-router', () => {
	const Layout = ({ children }: PropsWithChildren) => (
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

		const header = screen.getByRole('heading', { name: 'Root Route' });

		expect(header).toBeInTheDocument();
	});

	test('renders a route with layout', () => {
		const RouterWithLayout = createRouter({
			routes: [{ Layout, children: [{ Component: Children }] }],
			type: 'memory',
		});

		render(<RouterWithLayout />);

		const header = screen.getByRole('heading');

		expect(header).toBeInTheDocument();
	});

	test('renders a route with layout and suspense', () => {
		const RouterWithLayout = createRouter({
			routes: [
				{
					Layout,
					loading: 'loading',
					children: [{ Component: Children }],
				},
			],
			type: 'memory',
		});

		render(<RouterWithLayout />);

		const header = screen.getByRole('heading');

		expect(header).toBeInTheDocument();
	});
});
