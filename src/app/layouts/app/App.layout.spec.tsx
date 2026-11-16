import { createRouter } from '#libs/router';
import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterAll, beforeAll, describe, expect, test } from 'vitest';
import { AppLayout } from './App.layout.tsx';

describe(AppLayout, () => {
	// hooks
	beforeAll(() => {
		const Router = createRouter({
			type: 'memory',
			routes: [
				{
					children: [{ Component: () => <h1>Sample page</h1> }],
					Layout: AppLayout,
				},
			],
		});

		render(<Router />);
	});

	afterAll(() => {
		cleanup();
	});

	// tests
	test('frames the page with the name of the app and its environment', async () => {
		await screen.findByRole('heading', { name: 'Sample page' });

		const header = within(screen.getByRole('banner'));

		expect(header.getByText(import.meta.env.APP_NAME)).toBeVisible();
		expect(header.getByText(import.meta.env.APP_ENV)).toBeVisible();
	});

	test('leads to every page from its menu', () => {
		const menu = within(
			screen.getByRole('navigation', { name: 'Main menu' }),
		);

		expect(menu.getByRole('link', { name: 'Home' })).toHaveAttribute(
			'href',
			'/',
		);
		expect(menu.getByRole('link', { name: 'Detail' })).toHaveAttribute(
			'href',
			'/detail',
		);
		expect(menu.getByRole('link', { name: 'UI catalog' })).toHaveAttribute(
			'href',
			'/ui',
		);
	});

	test('opens the settings of the person from its header', async () => {
		await userEvent.click(screen.getByRole('button', { name: 'Settings' }));

		expect(
			screen.getByRole('dialog', { hidden: true, name: 'Settings' }),
		).toBeInTheDocument();
	});
});
