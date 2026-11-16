import { FeatureProvider } from '#libs/feature';
import { createRouter } from '#libs/router';
import { UiProvider } from '#libs/ui-core';
import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterAll, beforeAll, describe, expect, test } from 'vitest';
import { featureHandler } from '../app/app.features.ts';
import { routes } from '../app/app.routes.tsx';
import { RouterLink } from '../app/components/atoms/router-link/RouterLink.tsx';

describe('App', () => {
	const env = import.meta.env.APP_ENV;

	// hooks
	beforeAll(async () => {
		const AppRouter = createRouter({
			routes: routes.app,
			type: 'memory',
		});

		render(
			<FeatureProvider handler={featureHandler}>
				<UiProvider link={RouterLink}>
					<AppRouter />
				</UiProvider>
			</FeatureProvider>,
		);

		// waits for lazy loading
		await screen.findByText('Go To Detail');
	});

	afterAll(() => {
		cleanup();
	});

	// tests
	test('has a header (banner role) with the name of the app', () => {
		const header = within(screen.getByRole('banner'));

		expect(header.getByText(import.meta.env.APP_NAME)).toBeVisible();
	});

	test('has the menu of the app, the home page marked as the current one', () => {
		const menu = within(
			screen.getByRole('navigation', { name: 'Main menu' }),
		);

		expect(menu.getByRole('link', { name: 'Home' })).toHaveAttribute(
			'aria-current',
			'page',
		);
		expect(menu.getByRole('link', { name: 'Detail' })).not.toHaveAttribute(
			'aria-current',
		);
	});

	test('navigates to detail page', async () => {
		const anchor = screen.getByRole('link', { name: 'Go To Detail' });
		await userEvent.click(anchor);

		const title = await screen.findByRole('heading', {
			level: 1,
			name: 'Detail',
		});

		expect(title).toBeVisible();
		// the environment, among the facts of the route
		expect(
			within(screen.getByRole('main')).getAllByText(env).length,
		).toBeGreaterThan(0);
		expect(
			screen.getByRole('link', { name: 'Go To Main' }),
		).toHaveAttribute('href', '/');
	});
});
