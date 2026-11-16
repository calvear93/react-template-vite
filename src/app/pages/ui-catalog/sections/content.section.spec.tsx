import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, test } from 'vitest';
import { ContentSection } from './content.section.tsx';

describe(ContentSection, () => {
	// hooks
	beforeEach(() => {
		render(<ContentSection />);
	});

	afterEach(cleanup);

	// tests
	test.each([
		'Alert',
		'InfoNote and EmptyState',
		'KpiRow',
		'Card and DataGrid',
		'Timeline',
		'GroupHeader, FilterChips and Collapsible',
		'Accordion',
	])('has the example “%s”', (title) => {
		expect(screen.getByRole('region', { name: title })).toBeInTheDocument();
	});

	test('closes the warning and brings it back', async () => {
		await userEvent.click(
			screen.getByRole('button', { name: 'Close message' }),
		);

		expect(
			screen.queryByText('2 documents are missing'),
		).not.toBeInTheDocument();

		await userEvent.click(
			screen.getByRole('button', {
				name: 'Show the warning again',
			}),
		);

		expect(screen.getByText('2 documents are missing')).toBeInTheDocument();
	});

	test('announces the error at once, with its support code', () => {
		expect(screen.getByRole('alert')).toHaveTextContent(
			'Support code: 7f3a-91c2-4e0b',
		);
	});

	test('filters the list with the chips and counts what is left', async () => {
		const list = screen.getByRole('list', { name: 'Filtered reports' });

		expect(within(list).getAllByRole('listitem')).toHaveLength(3);

		await userEvent.click(screen.getByRole('button', { name: /Closed/u }));

		expect(within(list).getAllByRole('listitem')).toHaveLength(1);
		expect(screen.getByText('1 of 3')).toBeInTheDocument();

		await userEvent.click(screen.getByRole('button', { name: 'All' }));

		expect(within(list).getAllByRole('listitem')).toHaveLength(3);
	});

	test('names a card by its title and shows its record', () => {
		const card = screen.getByRole('region', { name: 'Anna Schmidt' });

		expect(within(card).getByText('E-10482')).toBeInTheDocument();
		expect(within(card).getByText('Yes')).toBeInTheDocument();
	});

	test('writes its dates and its figures as the language of the page does', () => {
		expect(screen.getByText('11/02/2026 09:14')).toBeInTheDocument();
		expect(screen.getByText('Since 11/03/2026')).toBeInTheDocument();
		expect(screen.getByText('1,204')).toBeInTheDocument();
	});

	test('opens one question of the accordion at a time', async () => {
		const example = within(
			screen.getByRole('region', { name: 'Accordion' }),
		);
		const open = () =>
			example
				.getAllByRole<HTMLDetailsElement>('group')
				.map((item) => item.open);

		expect(open()).toStrictEqual([true, false, false]);

		await userEvent.click(example.getByText('When is the benefit paid?'));

		expect(open()).toStrictEqual([false, false, true]);
	});
});
