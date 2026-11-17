import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, test, vi } from 'vitest';
import { TimeColumns, TimeSlots } from './TimePanels.tsx';

// a row reads the class of an option each time it is drawn, and at no other moment: how
// often it was read tells how many rows were drawn, whatever the React Compiler keeps of
// each of them
const drawn = vi.hoisted(() => ({ rows: 0 }));

vi.mock('./TimePicker.module.css', () => ({
	default: new Proxy<Record<string, string>>(
		{},
		{
			get: (_, name) => {
				if (name === 'option') drawn.rows += 1;

				return String(name);
			},
		},
	),
}));

const LABELS = { hours: 'Hours', minutes: 'Minutes', times: 'Times' };

const forget = () => {
	drawn.rows = 0;
};

const option = (name: string) => screen.getByRole('option', { name });

describe(TimeSlots, () => {
	// hooks
	afterEach(() => {
		cleanup();
		forget();
	});

	// tests
	test('draws again only the two rows a new time changes, of the 1,440 of a day by the minute', () => {
		const panel = (value: string) => (
			<TimeSlots
				interval={1}
				labels={LABELS}
				onPick={vi.fn()}
				value={value}
			/>
		);
		const { rerender } = render(panel('10:00'));

		expect(drawn.rows).toBe(1440);

		forget();
		rerender(panel('10:01'));

		expect(drawn.rows).toBe(2);
		expect(option('10:01')).toHaveAttribute('aria-selected', 'true');
		expect(option('10:01')).toHaveAttribute('tabindex', '0');
		expect(option('10:00')).toHaveAttribute('aria-selected', 'false');
	});

	test('picks the time of the row that is pressed, and none for a press between two rows', async () => {
		const handlePick = vi.fn();

		render(
			<TimeSlots
				interval={30}
				labels={LABELS}
				onPick={handlePick}
				value=''
			/>,
		);
		await userEvent.click(screen.getByRole('listbox', { name: 'Times' }));

		expect(handlePick).not.toHaveBeenCalled();

		await userEvent.click(option('09:30'));

		expect(handlePick).toHaveBeenCalledExactlyOnceWith('09:30', true);
	});

	test('picks no time that is out of its limits, however its row is pressed', () => {
		const handlePick = vi.fn();

		render(
			<TimeSlots
				interval={30}
				labels={LABELS}
				min='08:00'
				onPick={handlePick}
				value=''
			/>,
		);
		// a press made by a script reaches the list even from a row that is disabled
		fireEvent.click(option('07:30'));

		expect(option('07:30')).toBeDisabled();
		expect(handlePick).not.toHaveBeenCalled();
	});
});

describe(TimeColumns, () => {
	// hooks
	afterEach(() => {
		cleanup();
		forget();
	});

	// tests
	test('draws again only the two minutes a new time changes, and none of the hours', () => {
		const panel = (value: string) => (
			<TimeColumns
				labels={LABELS}
				minuteStep={1}
				onPick={vi.fn()}
				value={value}
			/>
		);
		const { rerender } = render(panel('10:00'));

		expect(drawn.rows).toBe(24 + 60);

		forget();
		rerender(panel('10:07'));

		expect(drawn.rows).toBe(2);
	});

	test('moves through a column with the arrows and picks with Enter, the list hearing its rows', async () => {
		const handlePick = vi.fn();

		render(
			<TimeColumns
				labels={LABELS}
				minuteStep={5}
				onPick={handlePick}
				value='10:00'
			/>,
		);

		expect(screen.getAllByRole('option', { name: '10' })[0]).toHaveFocus();

		await userEvent.keyboard('{ArrowDown}{Enter}');

		expect(handlePick).toHaveBeenCalledExactlyOnceWith('11:00', false);
	});
});
