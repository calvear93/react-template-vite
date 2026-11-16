import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { inChile } from '../../__mocks__/locale.mock.ts';
import { Calendar } from './Calendar.tsx';

inChile();

const day = (name: string) => screen.getByRole('button', { name });
const grid = (name: string) => screen.getByRole('grid', { name });

describe(Calendar, () => {
	// hooks
	beforeEach(() => {
		// a Thursday in Chile
		vi.useFakeTimers({ toFake: ['Date'] });
		vi.setSystemTime(new Date('2026-11-05T15:00:00Z'));
	});

	afterEach(() => {
		cleanup();
		vi.useRealTimers();
	});

	// tests
	test('shows the month of today, six weeks from Monday', () => {
		render(<Calendar className='extra' />);

		expect(grid('noviembre de 2026')).toBeVisible();
		expect(screen.getAllByRole('row')).toHaveLength(6);
		expect(screen.getAllByRole('gridcell')).toHaveLength(42);
		expect(
			within(screen.getAllByRole('row')[0]).getAllByRole('button')[0],
		).toHaveAccessibleName('lunes, 26 de octubre de 2026');
	});

	test('heads its days with the short names of the week, from Monday', () => {
		render(<Calendar />);

		for (const name of ['lun', 'mar', 'mié', 'jue', 'vie', 'sáb', 'dom'])
			expect(screen.getByText(name)).toBeInTheDocument();

		// the months of its select: their names, each with its capital
		expect(
			within(screen.getByRole('combobox', { name: 'Mes' }))
				.getAllByRole('option')
				.map((option) => option.textContent),
		).toStrictEqual([
			'Enero',
			'Febrero',
			'Marzo',
			'Abril',
			'Mayo',
			'Junio',
			'Julio',
			'Agosto',
			'Septiembre',
			'Octubre',
			'Noviembre',
			'Diciembre',
		]);
	});

	test('marks today, and has one Tab stop: today while nothing is chosen', () => {
		render(<Calendar />);

		const today = day('jueves, 5 de noviembre de 2026');

		expect(today).toHaveAttribute('aria-current', 'date');
		expect(today).not.toBePressed();
		expect(today).toHaveAttribute('tabindex', '0');
		expect(
			within(grid('noviembre de 2026'))
				.getAllByRole('button')
				.filter((button) => button.tabIndex === 0),
		).toHaveLength(1);
	});

	test('opens on the month of its value, that day pressed', () => {
		render(<Calendar defaultValue='2027-02-14' />);

		const chosen = day('domingo, 14 de febrero de 2027');

		expect(grid('febrero de 2027')).toBeVisible();
		expect(chosen).toBePressed();
		expect(chosen).toHaveAttribute('tabindex', '0');
		expect(chosen).not.toHaveAttribute('aria-current');
	});

	test('falls back to today when its value is not a date', () => {
		render(<Calendar defaultValue='mañana' />);

		expect(grid('noviembre de 2026')).toBeVisible();
	});

	test('picks the day clicked', async () => {
		const onValueChange = vi.fn();

		render(<Calendar onValueChange={onValueChange} />);

		await userEvent.click(day('jueves, 19 de noviembre de 2026'));

		expect(onValueChange).toHaveBeenCalledExactlyOnceWith('2026-11-19');
		expect(day('jueves, 19 de noviembre de 2026')).toBePressed();
		expect(day('jueves, 19 de noviembre de 2026')).toHaveAttribute(
			'tabindex',
			'0',
		);
	});

	test('picks a day of the next month and goes there', async () => {
		render(<Calendar />);

		await userEvent.click(day('martes, 1 de diciembre de 2026'));

		expect(grid('diciembre de 2026')).toBeVisible();
		expect(day('martes, 1 de diciembre de 2026')).toBePressed();
	});

	test('follows a controlled value, and only it', async () => {
		const onValueChange = vi.fn();
		const { rerender } = render(
			<Calendar onValueChange={onValueChange} value='2026-11-10' />,
		);

		await userEvent.click(day('jueves, 19 de noviembre de 2026'));

		expect(onValueChange).toHaveBeenCalledExactlyOnceWith('2026-11-19');
		expect(day('martes, 10 de noviembre de 2026')).toBePressed();

		rerender(<Calendar onValueChange={onValueChange} value='2027-03-01' />);

		expect(grid('marzo de 2027')).toBeVisible();
		expect(day('lunes, 1 de marzo de 2027')).toBePressed();
	});

	test.each([
		['{ArrowRight}', 'viernes, 6 de noviembre de 2026'],
		['{ArrowLeft}', 'miércoles, 4 de noviembre de 2026'],
		['{ArrowDown}', 'jueves, 12 de noviembre de 2026'],
		['{ArrowUp}', 'jueves, 29 de octubre de 2026'],
		['{Home}', 'lunes, 2 de noviembre de 2026'],
		['{End}', 'domingo, 8 de noviembre de 2026'],
		['{PageDown}', 'sábado, 5 de diciembre de 2026'],
		['{PageUp}', 'lunes, 5 de octubre de 2026'],
		['{Shift>}{PageDown}{/Shift}', 'viernes, 5 de noviembre de 2027'],
		['{Shift>}{PageUp}{/Shift}', 'miércoles, 5 de noviembre de 2025'],
	])('moves the focus with %s to «%s»', async (keys, expected) => {
		render(<Calendar focusOnMount />);

		expect(day('jueves, 5 de noviembre de 2026')).toHaveFocus();

		await userEvent.keyboard(keys);

		expect(day(expected)).toHaveFocus();
		expect(day(expected)).toHaveAttribute('tabindex', '0');
	});

	test('picks the focused day with Enter, and leaves other keys alone', async () => {
		const onValueChange = vi.fn();

		render(<Calendar focusOnMount onValueChange={onValueChange} />);

		await userEvent.keyboard('a{ArrowRight}{Enter}');

		expect(onValueChange).toHaveBeenCalledExactlyOnceWith('2026-11-06');
	});

	test('does not take the focus by itself', () => {
		render(<Calendar />);

		expect(document.body).toHaveFocus();
	});

	test('steps a month back and forth with its arrows, the focus kept on them', async () => {
		render(<Calendar />);

		await userEvent.click(
			screen.getByRole('button', { name: 'Mes siguiente' }),
		);

		expect(grid('diciembre de 2026')).toBeVisible();
		expect(
			screen.getByRole('button', { name: 'Mes siguiente' }),
		).toHaveFocus();

		await userEvent.click(
			screen.getByRole('button', { name: 'Mes anterior' }),
		);
		await userEvent.click(
			screen.getByRole('button', { name: 'Mes anterior' }),
		);

		expect(grid('octubre de 2026')).toBeVisible();
	});

	test('jumps to a month and to a year with its selects', async () => {
		render(<Calendar defaultValue='2024-01-31' />);

		expect(screen.getByRole('combobox', { name: 'Mes' })).toHaveValue('1');
		expect(screen.getByRole('combobox', { name: 'Año' })).toHaveValue(
			'2024',
		);

		await userEvent.selectOptions(
			screen.getByRole('combobox', { name: 'Mes' }),
			'Febrero',
		);

		// the 31st kept within February
		expect(day('jueves, 29 de febrero de 2024')).toHaveAttribute(
			'tabindex',
			'0',
		);

		await userEvent.selectOptions(
			screen.getByRole('combobox', { name: 'Año' }),
			'2025',
		);

		expect(grid('febrero de 2025')).toBeVisible();
	});

	test('offers a century back and ten years ahead when it has no limits', () => {
		render(<Calendar />);

		const years = within(
			screen.getByRole('combobox', { name: 'Año' }),
		).getAllByRole('option');

		expect(years).toHaveLength(111);
		expect(years[0]).toHaveTextContent('2036');
		expect(years.at(-1)).toHaveTextContent('1926');
	});

	test('keeps what can be picked between its limits', () => {
		render(<Calendar max='2026-12-10' min='2026-11-03' />);

		expect(day('lunes, 2 de noviembre de 2026')).toBeDisabled();
		expect(day('martes, 3 de noviembre de 2026')).toBeEnabled();
		expect(
			screen.getByRole('button', { name: 'Mes anterior' }),
		).toBeDisabled();
		expect(
			screen.getByRole('button', { name: 'Mes siguiente' }),
		).toBeEnabled();
		expect(
			within(screen.getByRole('combobox', { name: 'Año' })).getAllByRole(
				'option',
			),
		).toHaveLength(1);
	});

	test('offers only the months that have a day to pick', () => {
		render(<Calendar max='2026-12-10' min='2026-11-03' />);

		const month = screen.getByRole('combobox', { name: 'Mes' });

		expect(
			within(month).getByRole('option', { name: 'Octubre' }),
		).toBeDisabled();
		expect(
			within(month).getByRole('option', { name: 'Noviembre' }),
		).toBeEnabled();
		expect(
			within(month).getByRole('option', { name: 'Diciembre' }),
		).toBeEnabled();
	});

	test('stops the keyboard and the arrows at its limits', async () => {
		render(<Calendar focusOnMount max='2026-12-10' min='2026-11-03' />);

		await userEvent.keyboard('{PageUp}');

		expect(day('martes, 3 de noviembre de 2026')).toHaveFocus();

		await userEvent.keyboard('{Shift>}{PageDown}{/Shift}');

		expect(day('jueves, 10 de diciembre de 2026')).toHaveFocus();
		expect(
			screen.getByRole('button', { name: 'Mes siguiente' }),
		).toBeDisabled();
	});

	test('starts at its limit when today is outside', () => {
		render(<Calendar min='2027-01-15' />);

		expect(grid('enero de 2027')).toBeVisible();
		expect(day('viernes, 15 de enero de 2027')).toHaveAttribute(
			'tabindex',
			'0',
		);
	});

	test('takes other texts', () => {
		render(
			<Calendar
				labels={{ next: 'Next month', previous: 'Previous month' }}
			/>,
		);

		expect(
			screen.getByRole('button', { name: 'Previous month' }),
		).toBeVisible();
		expect(
			screen.getByRole('button', { name: 'Next month' }),
		).toBeVisible();
		expect(screen.getByRole('combobox', { name: 'Mes' })).toBeVisible();
	});
});
