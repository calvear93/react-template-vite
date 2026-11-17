import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, test, vi } from 'vitest';
import { inChile } from '../../__mocks__/locale.mock.ts';
import { DatePicker } from '../date-picker/DatePicker.tsx';
import { FilterBar, type FilterBarProps } from './FilterBar.tsx';

inChile();

const renderBar = (props: Partial<FilterBarProps> = {}) => {
	const applied: Record<string, FormDataEntryValue>[] = [];

	render(
		<FilterBar
			aria-label='Filtros'
			onSubmit={(data) => applied.push(Object.fromEntries(data))}
			{...props}
		>
			<input aria-label='Buscar' name='q' type='search' />
			<select aria-label='Estado' defaultValue='' name='state'>
				<option value=''>Todos</option>
				<option value='open'>Abiertas</option>
			</select>
			<label>
				<input name='late' type='checkbox' value='yes' />
				Fuera de plazo
			</label>
			<button type='submit'>Buscar</button>
			<button type='reset'>Limpiar</button>
		</FilterBar>,
	);

	return applied;
};

const search = () => screen.getByRole('searchbox', { name: 'Buscar' });

describe(FilterBar, () => {
	// hooks
	afterEach(() => {
		cleanup();
		vi.useRealTimers();
		vi.restoreAllMocks();
	});

	// tests
	test.each(['grid', 'row'] as const)(
		'is a search form that sends its values on submit only (%s)',
		async (layout) => {
			const applied = renderBar({ className: 'extra', layout });

			await userEvent.type(search(), 'ACH');
			await userEvent.selectOptions(
				screen.getByRole('combobox', { name: 'Estado' }),
				'open',
			);

			expect(applied).toHaveLength(0);

			await userEvent.click(
				screen.getByRole('button', { name: 'Buscar' }),
			);

			expect(applied).toStrictEqual([{ q: 'ACH', state: 'open' }]);
			expect(screen.getByRole('search', { name: 'Filtros' })).toHaveClass(
				'extra',
			);
		},
	);

	test('applies a select or a checkbox at once when it submits by itself', async () => {
		const applied = renderBar({ autoSubmit: true });

		await userEvent.selectOptions(
			screen.getByRole('combobox', { name: 'Estado' }),
			'open',
		);
		await userEvent.click(
			screen.getByRole('checkbox', { name: 'Fuera de plazo' }),
		);

		expect(applied).toStrictEqual([
			{ q: '', state: 'open' },
			{ late: 'yes', q: '', state: 'open' },
		]);
	});

	test('applies a text once the typing stops, keeping the focus', async () => {
		vi.useFakeTimers({ shouldAdvanceTime: true });

		const applied = renderBar({ autoSubmit: true, delay: 300 });

		await userEvent.type(search(), 'ACH');

		expect(applied).toHaveLength(0);

		await vi.advanceTimersByTimeAsync(300);

		expect(applied).toStrictEqual([{ q: 'ACH', state: '' }]);
		expect(search()).toHaveFocus();
	});

	test('applies at once with Enter, without applying again after the wait', async () => {
		vi.useFakeTimers({ shouldAdvanceTime: true });

		const applied = renderBar({ autoSubmit: true });

		await userEvent.type(search(), 'AC{Enter}');
		await vi.advanceTimersByTimeAsync(1000);

		expect(applied).toStrictEqual([{ q: 'AC', state: '' }]);
	});

	test('does not apply again what is already applied', async () => {
		vi.useFakeTimers({ shouldAdvanceTime: true });

		const applied = renderBar({ autoSubmit: true });

		// typed and deleted before the wait is over: the filters did not change
		await userEvent.type(search(), 'A{Backspace}');
		await vi.advanceTimersByTimeAsync(1000);

		expect(applied).toHaveLength(0);

		await userEvent.type(search(), 'AC');
		await vi.advanceTimersByTimeAsync(1000);
		await userEvent.type(search(), 'H{Backspace}');
		await vi.advanceTimersByTimeAsync(1000);

		expect(applied).toStrictEqual([{ q: 'AC', state: '' }]);

		// asked for by hand, they apply again
		await userEvent.click(screen.getByRole('button', { name: 'Buscar' }));

		expect(applied).toHaveLength(2);
	});

	test('applies the date of a picker at once, typed or picked, and only once', async () => {
		vi.useFakeTimers({
			shouldAdvanceTime: true,
			toFake: ['setTimeout', 'clearTimeout', 'Date'],
		});
		vi.setSystemTime(new Date('2026-11-05T15:00:00Z'));

		const applied: Record<string, FormDataEntryValue>[] = [];

		render(
			<FilterBar
				aria-label='Filtros'
				autoSubmit
				onSubmit={(data) => applied.push(Object.fromEntries(data))}
			>
				<DatePicker aria-label='Desde' name='from' />
			</FilterBar>,
		);

		await userEvent.type(
			screen.getByRole('textbox', { name: 'Desde' }),
			'04112026',
		);

		expect(applied).toStrictEqual([{ from: '2026-11-04' }]);

		await vi.advanceTimersByTimeAsync(1000);
		await userEvent.click(
			screen.getByRole('button', { name: 'Abrir calendario' }),
		);
		await userEvent.click(
			screen.getByRole('button', {
				name: 'jueves, 5 de noviembre de 2026',
			}),
		);
		await vi.advanceTimersByTimeAsync(1000);

		expect(applied).toStrictEqual([
			{ from: '2026-11-04' },
			{ from: '2026-11-05' },
		]);
	});

	test('clears and applies with its reset button', async () => {
		vi.useFakeTimers({ shouldAdvanceTime: true });

		const applied = renderBar({ autoSubmit: true });

		await userEvent.selectOptions(
			screen.getByRole('combobox', { name: 'Estado' }),
			'open',
		);
		await userEvent.click(screen.getByRole('button', { name: 'Limpiar' }));
		await vi.advanceTimersByTimeAsync(10);

		expect(applied.at(-1)).toStrictEqual({ q: '', state: '' });
	});

	test('only clears with its reset button when it does not submit by itself', async () => {
		vi.useFakeTimers({ shouldAdvanceTime: true });

		const applied = renderBar();

		await userEvent.type(search(), 'ACH');
		await userEvent.click(screen.getByRole('button', { name: 'Limpiar' }));
		await vi.advanceTimersByTimeAsync(10);

		expect(search()).toHaveValue('');
		expect(applied).toHaveLength(0);
	});

	test('listens to its composite fields once, not again with every render', () => {
		const changes = (calls: unknown[][]) =>
			calls.filter(([type]) => type === 'change').length;
		const add = vi.spyOn(HTMLFormElement.prototype, 'addEventListener');
		const remove = vi.spyOn(
			HTMLFormElement.prototype,
			'removeEventListener',
		);
		const bar = (autoSubmit: boolean, delay: number) => (
			<FilterBar
				aria-label='Filtros'
				autoSubmit={autoSubmit}
				delay={delay}
				onSubmit={vi.fn()}
			>
				<input aria-label='Buscar' name='q' type='search' />
			</FilterBar>
		);
		const { rerender } = render(bar(true, 300));

		rerender(bar(true, 400));
		rerender(bar(true, 500));

		expect(changes(add.mock.calls)).toBe(1);
		expect(changes(remove.mock.calls)).toBe(0);

		// it stops listening once its filters no longer apply by themselves
		rerender(bar(false, 500));

		expect(changes(add.mock.calls)).toBe(1);
		expect(changes(remove.mock.calls)).toBe(1);
	});
});
