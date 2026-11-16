import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, test, vi } from 'vitest';
import { inChile } from '../../__mocks__/locale.mock.ts';
import { FilterChips } from './FilterChips.tsx';

inChile();

const OPTIONS = [
	{ count: 12, label: 'Abiertas', value: 'open' },
	{ count: 0, label: 'Cerradas', value: 'closed' },
	{ disabled: true, label: 'Archivadas', value: 'archived' },
];

const pressed = () =>
	screen
		.getAllByRole('button')
		.filter((chip) => chip.getAttribute('aria-pressed') === 'true')
		.map((chip) => chip.textContent);

describe(FilterChips, () => {
	// hooks
	afterEach(cleanup);

	// tests
	test('is a group named by its label, with «Todos» chosen at first', () => {
		render(
			<FilterChips className='extra' label='Estado' options={OPTIONS} />,
		);

		const group = screen.getByRole('group', { name: 'Estado' });

		expect(
			within(group)
				.getAllByRole('button')
				.map((chip) => chip.textContent),
		).toStrictEqual(['Todos', 'Abiertas12', 'Cerradas0', 'Archivadas']);
		expect(pressed()).toStrictEqual(['Todos']);
		expect(group).toHaveClass('extra');
	});

	test('chooses one chip at a time, uncontrolled, and clears with the first', async () => {
		const onValueChange = vi.fn();

		render(
			<FilterChips
				allLabel='Todas'
				defaultValue='closed'
				label='Estado'
				onValueChange={onValueChange}
				options={OPTIONS}
			/>,
		);

		expect(pressed()).toStrictEqual(['Cerradas0']);

		await userEvent.click(
			screen.getByRole('button', { name: /Abiertas/u }),
		);

		expect(pressed()).toStrictEqual(['Abiertas12']);
		expect(onValueChange).toHaveBeenLastCalledWith('open');

		await userEvent.click(screen.getByRole('button', { name: 'Todas' }));

		expect(pressed()).toStrictEqual(['Todas']);
		expect(onValueChange).toHaveBeenLastCalledWith('');
	});

	test('shows the value of its parent when controlled', async () => {
		const onValueChange = vi.fn();

		render(
			<FilterChips
				label='Estado'
				onValueChange={onValueChange}
				options={OPTIONS}
				value='open'
			/>,
		);

		await userEvent.click(
			screen.getByRole('button', { name: /Cerradas/u }),
		);

		expect(onValueChange).toHaveBeenCalledExactlyOnceWith('closed');
		expect(pressed()).toStrictEqual(['Abiertas12']);
	});

	test('cannot choose a disabled chip', async () => {
		render(<FilterChips label='Estado' options={OPTIONS} />);

		await userEvent.click(
			screen.getByRole('button', { name: 'Archivadas' }),
		);

		expect(pressed()).toStrictEqual(['Todos']);
	});
});
