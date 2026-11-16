import { UiProvider } from '#libs/ui-core';
import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, test } from 'vitest';
import { OverlaysSection } from './overlays.section.tsx';

const ADD_WORKER = 'Add employee';

const DIALOGS = 'useDialogs: notice, choices and text';

const click = (name: string) =>
	userEvent.click(screen.getByRole('button', { name }));

describe(OverlaysSection, () => {
	// hooks
	beforeEach(() => {
		render(
			<UiProvider>
				<OverlaysSection />
			</UiProvider>,
		);
	});

	afterEach(cleanup);

	// tests
	test.each([
		'Dialog',
		'FormDialog',
		'AlertDialog and useConfirm',
		DIALOGS,
		'Drawer',
		'toast',
	])('has the example “%s”', (title) => {
		expect(screen.getByRole('region', { name: title })).toBeInTheDocument();
	});

	test('opens the dialog and closes it from its footer', async () => {
		await click('View the details of the report');

		expect(
			screen.getByRole('dialog', { name: 'Report INC-2026-001482' }),
		).toBeInTheDocument();

		await click('Got it');

		expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
	});

	test('keeps the form dialog open with the error of a save that fails', async () => {
		await click(ADD_WORKER);

		const dialog = within(screen.getByRole('dialog', { name: ADD_WORKER }));

		await userEvent.type(
			dialog.getByRole('textbox', { name: 'Name' }),
			'error',
		);
		await userEvent.click(dialog.getByRole('button', { name: ADD_WORKER }));

		await expect(
			dialog.findByRole('alert', {}, { timeout: 3000 }),
		).resolves.toHaveTextContent('The employee was not added');
	});

	test('saves the form, closes the dialog and confirms with a toast', async () => {
		await click(ADD_WORKER);

		const dialog = within(screen.getByRole('dialog', { name: ADD_WORKER }));

		await userEvent.type(
			dialog.getByRole('textbox', { name: 'Name' }),
			'Anna Schmidt',
		);
		await userEvent.click(dialog.getByRole('button', { name: ADD_WORKER }));

		await expect(
			screen.findByText('Employee added', {}, { timeout: 3000 }),
		).resolves.toBeInTheDocument();
		expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
	});

	test('confirms the alert dialog with a toast', async () => {
		await click('Remove access');
		await userEvent.click(
			within(screen.getByRole('alertdialog')).getByRole('button', {
				name: 'Remove access',
			}),
		);

		expect(screen.getByText('Access removed')).toBeInTheDocument();
		expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
	});

	test.each([
		{ button: 'Keep editing', says: 'Kept editing' },
		{ button: 'Leave without saving', says: 'Left without saving' },
	])('tells the answer of useConfirm: $says', async ({ button, says }) => {
		await click('Ask with useConfirm');
		await click(button);

		await expect(screen.findByText(says)).resolves.toBeInTheDocument();
	});

	test.each([
		{ closes: 'Apply filters', name: 'Filters', opens: 'Filters' },
		{ closes: 'Clear', name: 'Filters', opens: 'Filters' },
		{ closes: 'Close the panel', name: 'Menu', opens: 'Panel on the left' },
	])(
		'opens the drawer “$name” and closes it with “$closes”',
		async (drawer) => {
			await click(drawer.opens);

			const panel = screen.getByRole('dialog', { name: drawer.name });

			await userEvent.click(
				within(panel).getByRole('button', { name: drawer.closes }),
			);

			expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
		},
	);

	test.each([
		{ button: 'Success', role: 'status', says: 'Changes saved' },
		{ button: 'Information', role: 'status', says: 'The link was copied' },
		{
			button: 'Warning (it stays)',
			role: 'status',
			says: 'Your session expires in 5 minutes',
		},
		{ button: 'Error', role: 'alert', says: 'It could not be sent' },
	])('shows the toast of “$button”', async ({ button, role, says }) => {
		await click(button);

		expect(
			screen
				.getAllByRole(role)
				.some((toast) => toast.textContent.includes(says)),
		).toBe(true);
	});

	test.each([
		{ asks: 'Show a notice', press: 'Got it', says: 'Notice read' },
		{
			asks: 'Choose an option',
			press: 'Save and leave',
			says: 'Saved and left',
		},
		{
			asks: 'Choose an option',
			press: 'Cancel',
			says: 'Kept editing',
		},
		{
			asks: 'Choose from a list',
			press: 'PDF Ready to print',
			says: 'Exported to PDF',
		},
		{ asks: 'Choose from a list', press: 'Cancel', says: 'Did not export' },
		{ asks: 'Ask for a text', press: 'Cancel', says: 'Did not reject' },
		{ asks: 'Delete the company', press: 'Cancel', says: 'Did not delete' },
	])('“$asks” answered with “$press” says “$says”', async (step) => {
		const example = within(
			screen.getByRole('region', {
				name: DIALOGS,
			}),
		);

		await userEvent.click(example.getByRole('button', { name: step.asks }));
		await click(step.press);

		expect(example.getByRole('status')).toHaveTextContent(step.says);
	});

	test('asks for a reason and for a text typed before what is irreversible', async () => {
		const example = within(
			screen.getByRole('region', {
				name: DIALOGS,
			}),
		);

		await userEvent.click(
			example.getByRole('button', { name: 'Ask for a text' }),
		);
		await userEvent.keyboard('Past the deadline');
		await click('Reject');

		expect(example.getByRole('status')).toHaveTextContent(
			'Reason: Past the deadline',
		);

		await userEvent.click(
			example.getByRole('button', { name: 'Delete the company' }),
		);
		await userEvent.keyboard('acme-0042');
		await click('Delete');

		expect(example.getByRole('status')).toHaveTextContent(
			'Company deleted',
		);
	});
});
