import { Toaster } from '#libs/ui-core';
import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, test } from 'vitest';
import { ShellSection } from './shell.section.tsx';

describe(ShellSection, () => {
	// hooks
	beforeEach(() => {
		render(
			<>
				<ShellSection />
				<Toaster />
			</>,
		);
	});

	afterEach(cleanup);

	// tests
	test.each(['AppShell', 'PageHeader', 'UserMenu', 'SettingsDialog'])(
		'has the example “%s”',
		(title) => {
			expect(
				screen.getByRole('region', { name: title }),
			).toBeInTheDocument();
		},
	);

	test('shows the header of a page: its trail, its title and its actions', () => {
		const header = within(
			screen.getByRole('region', { name: 'PageHeader' }),
		);

		expect(
			header.getByRole('heading', {
				level: 1,
				name: 'Report INC-2026-001482',
			}),
		).toBeInTheDocument();
		expect(header.getByRole('link', { name: 'Reports' })).toHaveAttribute(
			'href',
			'/ui/navigation',
		);
		expect(
			header.getByRole('button', { name: 'Edit' }),
		).toBeInTheDocument();
	});

	test('opens the settings from the menu of the user, and closes them', async () => {
		await userEvent.click(
			screen.getByRole('button', { name: 'Menu of Anna Schmidt' }),
		);
		await userEvent.click(
			screen.getByRole('menuitem', { name: 'Settings' }),
		);

		expect(
			screen.getByRole('dialog', { name: 'Settings' }),
		).toBeInTheDocument();

		await userEvent.click(screen.getByRole('button', { name: 'Done' }));

		expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
	});

	test('opens the settings from their button too', async () => {
		await userEvent.click(
			screen.getByRole('button', { name: 'Open the settings' }),
		);

		expect(
			screen.getByRole('dialog', { name: 'Settings' }),
		).toBeInTheDocument();

		await userEvent.click(screen.getByRole('button', { name: 'Done' }));
	});

	test('says the session would end', async () => {
		await userEvent.click(
			screen.getByRole('button', { name: 'Menu of Anna Schmidt' }),
		);
		await userEvent.click(
			screen.getByRole('menuitem', { name: 'Sign out' }),
		);

		expect(screen.getByText('Signed out (example)')).toBeInTheDocument();
	});
});
