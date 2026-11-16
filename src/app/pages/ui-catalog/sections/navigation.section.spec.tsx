import { Toaster } from '#libs/ui-core';
import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, test } from 'vitest';
import { NavigationSection } from './navigation.section.tsx';

const LIST = 'FilterBar, DataTable and Pager';

const list = () => within(screen.getByRole('region', { name: LIST }));

const folios = () =>
	list()
		.getAllByRole('row')
		.slice(1)
		.map((row) => within(row).getAllByRole('cell')[0].textContent);

describe(NavigationSection, () => {
	// hooks
	beforeEach(() => {
		render(
			<>
				<NavigationSection />
				<Toaster />
			</>,
		);
	});

	afterEach(cleanup);

	// tests
	test.each(['Breadcrumb', 'Stepper', 'Pagination', LIST, 'Table'])(
		'has the example “%s”',
		(title) => {
			expect(
				screen.getByRole('region', { name: title }),
			).toBeInTheDocument();
		},
	);

	test('moves its three paginations together', async () => {
		const pagination = within(
			screen.getByRole('region', { name: 'Pagination' }),
		);

		await userEvent.click(
			pagination.getAllByRole('button', { name: 'Next page' })[0],
		);

		expect(pagination.getByText('Page 6 of 9')).toBeInTheDocument();
	});

	test('lists the first page of the demo data, newest folio first', () => {
		expect(list().getByRole('status')).toHaveTextContent(
			'Showing 1–10 of 57 reports',
		);
		expect(folios()[0]).toBe('ReferenceINC-2026-001482');
		expect(folios()).toHaveLength(10);
	});

	test('writes the dates, the months and the amounts as the language of the page does', () => {
		const table = within(
			screen.getByRole('table', { name: 'Payments of the period' }),
		);

		expect(
			within(list().getAllByRole('row')[2]).getByText('02/08/2026'),
		).toBeInTheDocument();
		expect(
			table.getByRole('row', { name: 'November 44 $13,100.50' }),
		).toBeInTheDocument();
	});

	test('sorts by a column from its header, and turns the order over', async () => {
		const header = () =>
			list().getByRole('columnheader', { name: 'Reference' });

		await userEvent.click(within(header()).getByRole('button'));

		expect(header()).toHaveAttribute('aria-sort', 'ascending');
		expect(folios()[0]).toBe('ReferenceINC-2026-001426');

		await userEvent.click(within(header()).getByRole('button'));

		expect(header()).toHaveAttribute('aria-sort', 'descending');
	});

	test('changes the page and the rows per page from the pager', async () => {
		await userEvent.click(
			list().getByRole('button', { name: 'Next page' }),
		);

		expect(list().getByRole('status')).toHaveTextContent(
			'Showing 11–20 of 57 reports',
		);

		await userEvent.selectOptions(
			list().getByRole('combobox', { name: 'Rows per page' }),
			'50',
		);

		expect(list().getByRole('status')).toHaveTextContent(
			'Showing 1–50 of 57 reports',
		);
	});

	test('filters by state at once and shows the empty state when nothing is left', async () => {
		await userEvent.selectOptions(
			list().getByRole('combobox', { name: 'Status' }),
			'Closed',
		);

		expect(list().getByRole('status')).toHaveTextContent(
			'Showing 1–10 of 19 reports',
		);

		await userEvent.type(
			list().getByRole('searchbox', { name: 'Search' }),
			'zzz{Enter}',
		);

		expect(
			list().getByRole('heading', {
				name: 'No reports for these filters',
			}),
		).toBeInTheDocument();
		expect(list().getByRole('status')).toHaveTextContent('0 reports');
	});

	test('clears the filters with the reset button', async () => {
		await userEvent.selectOptions(
			list().getByRole('combobox', { name: 'Status' }),
			'Closed',
		);

		expect(list().getByRole('status')).toHaveTextContent(
			'Showing 1–10 of 19 reports',
		);

		await userEvent.click(list().getByRole('button', { name: 'Clear' }));

		await expect(
			list().findByText('Showing 1–10 of 57 reports'),
		).resolves.toBeInTheDocument();
	});

	test('opens a row and runs the action of another, each with its toast', async () => {
		await userEvent.click(
			list().getByRole('button', { name: /INC-2026-001482$/u }),
		);
		await userEvent.click(
			list().getAllByRole('button', { name: 'Download' })[1],
		);

		expect(screen.getByText('Open INC-2026-001482')).toBeInTheDocument();
		expect(
			screen.getByText('Downloading INC-2026-001481'),
		).toBeInTheDocument();
	});
});
