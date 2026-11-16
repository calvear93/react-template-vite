import { createRouter } from '#libs/router';
import { setLocale, UiProvider } from '#libs/ui-core';
import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, test } from 'vitest';
import { UiCatalogPage } from './UiCatalog.page.tsx';

const FOUNDATIONS = 'Foundations';

/** The name of Spanish in the language switch: each language is named in itself. */
const SPANISH = 'Español';

const renderAt = (path: string) => {
	const Router = createRouter({
		options: { initialEntries: [path] },
		routes: [{ Component: UiCatalogPage, path: 'ui/:section?' }],
		type: 'memory',
	});

	// as in the app: the kit's provider around the router
	render(
		<UiProvider>
			<Router />
		</UiProvider>,
	);
};

describe(UiCatalogPage, () => {
	const root = document.documentElement;

	// hooks
	afterEach(async () => {
		// back to the defaults: the appearance and the language live on the page, beyond the component
		await userEvent.selectOptions(
			screen.getByRole('combobox', { name: 'Theme' }),
			'auto',
		);
		cleanup();
		setLocale(null);
		delete root.dataset.contrast;
		localStorage.clear();
	});

	// tests
	test('opens on its first section, marked as the current one', async () => {
		renderAt('/ui');

		expect(
			within(screen.getByRole('banner')).getByText('UI catalog'),
		).toBeInTheDocument();
		expect(
			screen.getByRole('heading', { level: 1, name: FOUNDATIONS }),
		).toBeInTheDocument();
		expect(screen.getByRole('link', { name: FOUNDATIONS })).toHaveAttribute(
			'aria-current',
			'page',
		);
		await expect(
			screen.findByRole('region', { name: 'Typography' }),
		).resolves.toBeInTheDocument();
	});

	test('opens the section of the route, and the first one for an unknown one', async () => {
		renderAt('/ui/nope');

		expect(
			screen.getByRole('heading', { level: 1, name: FOUNDATIONS }),
		).toBeInTheDocument();
		await expect(
			screen.findByRole('region', { name: 'Motion' }),
		).resolves.toBeInTheDocument();
	});

	test.each([
		{ id: 'foundations', example: 'Typography', title: FOUNDATIONS },
		{ id: 'actions', example: 'Badge', title: 'Actions and status' },
		{ id: 'fields', example: 'Switch', title: 'Fields' },
		{ id: 'pickers', example: 'Calendar', title: 'Pickers' },
		{ id: 'content', example: 'Timeline', title: 'Content and messages' },
		{ id: 'overlays', example: 'Drawer', title: 'Dialogs and toasts' },
		{ id: 'menus', example: 'Tooltip', title: 'Menus and tabs' },
		{
			id: 'navigation',
			example: 'Stepper',
			title: 'Navigation and tables',
		},
		{ id: 'shell', example: 'PageHeader', title: 'Page and shell' },
	])(
		'opens the section $id from its route',
		async ({ id, example, title }) => {
			renderAt(`/ui/${id}`);

			expect(screen.getByRole('link', { name: title })).toHaveAttribute(
				'aria-current',
				'page',
			);
			await expect(
				screen.findByRole('region', { name: example }),
			).resolves.toBeInTheDocument();
		},
	);

	test('opens the settings of the appearance from its header', async () => {
		renderAt('/ui');

		await userEvent.click(screen.getByRole('button', { name: 'Settings' }));

		expect(
			screen.getByRole('dialog', { name: 'Settings' }),
		).toBeInTheDocument();

		await userEvent.click(screen.getByRole('button', { name: 'Done' }));

		expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
	});

	test('links its logo to the home of the app', () => {
		renderAt('/ui/foundations');

		const logos = screen.getAllByRole('link', { name: 'Home' });

		expect(logos.length).toBeGreaterThan(0);
		expect(logos.every((logo) => logo.getAttribute('href') === '/')).toBe(
			true,
		);
	});

	test('names its switches as one group, in English whatever the language', async () => {
		renderAt('/ui');

		const toolbar = within(
			screen.getByRole('group', { name: 'Appearance and language' }),
		);
		const language = toolbar.getByRole('combobox', { name: 'Language' });

		expect(
			within(language)
				.getAllByRole('option')
				.map((option) => option.textContent),
		).toStrictEqual(['English', SPANISH]);
		expect(language).toHaveDisplayValue('English');

		await userEvent.selectOptions(language, SPANISH);

		expect(language).toHaveDisplayValue(SPANISH);
		expect(
			toolbar.getByRole('combobox', { name: 'Theme' }),
		).toHaveDisplayValue('Automatic');
		expect(
			toolbar.getByRole('checkbox', { name: 'Increase contrast' }),
		).not.toBeChecked();
	});

	test('changes the language of the page: the texts and the formats of the kit, and its lang', async () => {
		renderAt('/ui/navigation');

		const table = within(
			await screen.findByRole('region', {
				name: 'FilterBar, DataTable and Pager',
			}),
		);

		expect(root).toHaveAttribute('lang', 'en');
		expect(table.getByText('02/08/2026')).toBeInTheDocument();

		await userEvent.selectOptions(
			screen.getByRole('combobox', { name: 'Language' }),
			SPANISH,
		);

		expect(root).toHaveAttribute('lang', 'es-CL');
		expect(table.getByText('08-02-2026')).toBeInTheDocument();
		expect(
			screen.getByRole('navigation', { name: 'Menú principal' }),
		).toBeInTheDocument();
	});

	test('goes back to English from the language switch', async () => {
		renderAt('/ui/navigation');

		const language = screen.getByRole('combobox', { name: 'Language' });

		await userEvent.selectOptions(language, SPANISH);
		await userEvent.selectOptions(language, 'English');

		expect(root).toHaveAttribute('lang', 'en');
		expect(
			screen.getByRole('navigation', { name: 'Main menu' }),
		).toBeInTheDocument();
		await expect(
			screen.findByText('Showing 1–10 of 57 reports'),
		).resolves.toBeInTheDocument();
	});

	test('shows as its language one chosen elsewhere, whatever its region', () => {
		setLocale('es');
		renderAt('/ui');

		expect(
			screen.getByRole('combobox', { name: 'Language' }),
		).toHaveDisplayValue(SPANISH);
	});

	test('changes the theme and the contrast of the page', async () => {
		renderAt('/ui');

		await userEvent.selectOptions(
			screen.getByRole('combobox', { name: 'Theme' }),
			'Dark',
		);
		await userEvent.click(
			screen.getByRole('checkbox', { name: 'Increase contrast' }),
		);

		expect(root.dataset.theme).toBe('dark');
		expect(root.dataset.contrast).toBe('more');

		await userEvent.click(
			screen.getByRole('checkbox', { name: 'Increase contrast' }),
		);

		expect(root.dataset.contrast).toBeUndefined();
	});
});
