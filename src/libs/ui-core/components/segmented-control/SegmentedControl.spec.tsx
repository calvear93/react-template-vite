import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, test, vi } from 'vitest';
import {
	SegmentedControl,
	type SegmentedControlProps,
} from './SegmentedControl.tsx';

const VIEWS: SegmentedControlProps['options'] = [
	{ icon: 'list', label: 'Tabla', value: 'table' },
	{ label: 'Tarjetas', value: 'cards' },
	{ disabled: true, label: 'Mapa', value: 'map' },
];

const renderControl = (props: Partial<SegmentedControlProps> = {}) => {
	const onValueChange = vi.fn();

	render(
		<SegmentedControl
			legend='Vista'
			onValueChange={onValueChange}
			options={VIEWS}
			{...props}
		/>,
	);

	return onValueChange;
};

const group = () => screen.getByRole('group', { name: 'Vista' });
const option = (name: string) => screen.getByRole('radio', { name });

describe(SegmentedControl, () => {
	// hooks
	afterEach(cleanup);

	// tests
	test('is a group of radios named by its legend, the first one chosen', () => {
		renderControl({ className: 'extra', size: 'sm' });

		expect(group()).toHaveClass('extra');
		expect(within(group()).getAllByRole('radio')).toHaveLength(3);
		expect(option('Tabla')).toBeChecked();
		expect(option('Tarjetas')).not.toBeChecked();
		expect(option('Mapa')).toBeDisabled();
	});

	test('chooses the option pressed and tells it', async () => {
		const onValueChange = renderControl();

		await userEvent.click(option('Tarjetas'));

		expect(option('Tarjetas')).toBeChecked();
		expect(option('Tabla')).not.toBeChecked();
		expect(onValueChange).toHaveBeenCalledExactlyOnceWith('cards');
	});

	test('moves through its options with the arrows, as radios do', async () => {
		const onValueChange = renderControl();

		await userEvent.tab();

		expect(option('Tabla')).toHaveFocus();

		await userEvent.keyboard('{ArrowRight}');

		expect(option('Tarjetas')).toBeChecked();
		expect(onValueChange).toHaveBeenCalledExactlyOnceWith('cards');
	});

	test('starts with the option it is told', () => {
		renderControl({ defaultValue: 'cards' });

		expect(option('Tarjetas')).toBeChecked();
	});

	test('shows the value it is given when it is controlled', async () => {
		const onValueChange = renderControl({ value: 'table' });

		await userEvent.click(option('Tarjetas'));

		expect(onValueChange).toHaveBeenCalledExactlyOnceWith('cards');
		expect(option('Tabla')).toBeChecked();
	});

	test('sends its value with its form, and goes back to its first one on a reset', async () => {
		render(
			<form aria-label='Filtros'>
				<SegmentedControl legend='Vista' name='view' options={VIEWS} />
				<button type='reset'>Restablecer</button>
			</form>,
		);

		const sent = () =>
			new FormData(screen.getByRole<HTMLFormElement>('form')).get('view');

		expect(sent()).toBe('table');

		await userEvent.click(option('Tarjetas'));

		expect(sent()).toBe('cards');

		await userEvent.click(
			screen.getByRole('button', { name: 'Restablecer' }),
		);

		expect(option('Tabla')).toBeChecked();
		expect(sent()).toBe('table');
	});

	test('keeps two controls without a name apart', async () => {
		render(
			<>
				<SegmentedControl legend='Vista' options={VIEWS} />
				<SegmentedControl
					legend='Período'
					options={[
						{ label: 'Mes', value: 'month' },
						{ label: 'Año', value: 'year' },
					]}
				/>
			</>,
		);

		await userEvent.click(option('Año'));

		expect(option('Año')).toBeChecked();
		expect(option('Tabla')).toBeChecked();
	});

	test('chooses nothing while its group is disabled', async () => {
		const onValueChange = renderControl({ disabled: true });

		await userEvent.click(option('Tarjetas'));

		expect(group()).toBeDisabled();
		expect(onValueChange).not.toHaveBeenCalled();
	});
});
