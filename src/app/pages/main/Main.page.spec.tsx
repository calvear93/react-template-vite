import { createRouter } from '#libs/router';
import { cleanup, render, screen, within } from '@testing-library/react';
import { afterAll, beforeAll, describe, expect, test } from 'vitest';
import { MainPage } from './Main.page.tsx';

describe(MainPage, () => {
	// hooks
	beforeAll(() => {
		const Router = createRouter({
			routes: [{ Component: MainPage }],
			type: 'memory',
		});

		render(<Router />);
	});

	afterAll(cleanup);

	// tests
	test('welcomes with the name of the app and its environment', async () => {
		const heading = await screen.findByRole('heading', { level: 1 });

		expect(heading).toHaveTextContent(import.meta.env.APP_NAME);
		expect(screen.getByText(import.meta.env.APP_ENV)).toBeVisible();
	});

	test('leads to the detail page, with an id and without one', () => {
		expect(
			screen.getByRole('link', { name: 'Go To Detail' }),
		).toHaveAttribute('href', '/detail');
		expect(
			screen.getByRole('link', { name: 'Go To Detail 123' }),
		).toHaveAttribute('href', '/detail/123');
	});

	test('lists what the template brings, each with where to see it', () => {
		const list = within(
			screen.getByRole('list', { name: 'What is in the box' }),
		);

		expect(list.getAllByRole('listitem')).toHaveLength(5);
		expect(
			list.getByRole('link', { name: 'Open the UI catalog' }),
		).toHaveAttribute('href', '/ui');
	});

	test('says what the store answered once it was asked', async () => {
		const store = screen
			.getAllByRole('listitem')
			.find((item) => within(item).queryByText('Store'));

		expect(store).toBeDefined();
		await expect(screen.findByText('success')).resolves.toBeVisible();
	});
});
