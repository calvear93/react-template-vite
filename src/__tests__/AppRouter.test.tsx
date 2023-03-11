import { beforeAll, describe, expect, test } from 'vitest';
import { AppRouter } from 'app/App.router';
import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from '@router';

describe('App', () => {
	const env = import.meta.env.VITE_APP_ENV;

	// hooks
	beforeAll(async () => {
		render(
			<MemoryRouter>
				<AppRouter />
			</MemoryRouter>
		);

		// waits for lazy loading
		await screen.findByText('Go To Detail');
	});

	// tests
	test('has header (banner role) with content "App"', () => {
		const header = screen.getByRole('banner');

		expect(header).toHaveTextContent('App');
	});

	test('has footer (contentinfo role) with content "Footer"', () => {
		const footer = screen.getByRole('contentinfo');

		expect(footer).toHaveTextContent('Footer');
	});

	test('navigates to detail page', async () => {
		const anchor = screen.getByRole('link', { name: 'Go To Detail' });

		await userEvent.click(anchor);

		const asyncMessage = await screen.findByText(env);

		expect(asyncMessage.tagName).toBe('H2');
	});
});
