import { Toaster } from '#libs/ui-core';
import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, test } from 'vitest';
import { MenusSection } from './menus.section.tsx';

describe(MenusSection, () => {
	// hooks
	beforeEach(() => {
		render(
			<>
				<MenusSection />
				<Toaster />
			</>,
		);
	});

	afterEach(cleanup);

	// tests
	test.each(['DropdownMenu', 'Popover', 'Tooltip', 'Tabs', 'Tabs: variants'])(
		'has the example “%s”',
		(title) => {
			expect(
				screen.getByRole('region', { name: title }),
			).toBeInTheDocument();
		},
	);

	test.each([
		{ item: 'Edit', says: 'Edit record' },
		{ item: 'Duplicate', says: 'Duplicated' },
		{ item: 'Remove access', says: 'Access removed' },
	])('runs “$item” from the menu and confirms it', async ({ item, says }) => {
		await userEvent.click(screen.getByRole('button', { name: 'Actions' }));
		await userEvent.click(screen.getByRole('menuitem', { name: item }));

		expect(screen.getByText(says)).toBeInTheDocument();
		expect(screen.queryByRole('menu')).not.toBeInTheDocument();
	});

	test('opens the account menu from its own trigger, with its header', async () => {
		await userEvent.click(
			screen.getByRole('button', { name: 'Anna Schmidt' }),
		);

		const menu = screen.getByRole('menu', {
			name: 'Account of Anna Schmidt',
		});

		expect(
			screen.getByText(/anna\.schmidt@example\.com/u),
		).toBeInTheDocument();
		expect(menu).not.toHaveTextContent('anna.schmidt@example.com');
		expect(
			within(menu).getByRole('group', { name: 'Preferences' }),
		).toBeInTheDocument();

		await userEvent.keyboard('{Escape}');

		expect(screen.queryByRole('menu')).not.toBeInTheDocument();
	});

	test('lists links in the icon menu', async () => {
		await userEvent.click(
			screen.getByRole('button', { name: 'More actions of the record' }),
		);

		expect(
			screen.getByRole('menuitem', { name: 'Example site' }),
		).toHaveAttribute('target', '_blank');
	});

	test('describes a control with its tooltip', () => {
		expect(
			screen.getByRole('button', { name: 'Download certificate' }),
		).toHaveAccessibleDescription('It downloads as a PDF');
	});

	test('changes the view of the controlled tabs', async () => {
		const tabs = within(screen.getByRole('region', { name: 'Tabs' }));

		await userEvent.click(tabs.getByRole('tab', { name: /Documents/u }));

		expect(tabs.getByRole('tabpanel')).toHaveTextContent(
			'No documents yet',
		);

		await userEvent.click(tabs.getByRole('tab', { name: /Reports/u }));

		expect(tabs.getByRole('tabpanel')).toHaveTextContent('1 due soon');
	});

	test('opens the filters in a popover, the focus on its field', async () => {
		const example = within(screen.getByRole('region', { name: 'Popover' }));

		await userEvent.click(example.getByRole('button', { name: 'Filters' }));

		expect(example.getByRole('dialog', { name: 'Filters' })).toBeVisible();
		expect(
			example.getByRole('textbox', { name: 'Reference' }),
		).toHaveFocus();

		await userEvent.keyboard('{Escape}');

		expect(example.queryByRole('dialog')).not.toBeInTheDocument();
	});
});
