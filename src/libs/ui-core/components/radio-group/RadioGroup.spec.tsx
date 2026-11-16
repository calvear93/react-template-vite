import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, test, vi } from 'vitest';
import { RadioGroup } from './RadioGroup.tsx';

const KINDS = [
	{ description: 'Atención inmediata', label: 'Urgencia', value: 'urgent' },
	{ label: 'Agendada', value: 'scheduled' },
	{ disabled: true, label: 'Domicilio', value: 'home' },
] as const;

describe(RadioGroup, () => {
	// hooks
	afterEach(cleanup);

	// tests
	test('is a group named by its legend, each radio by its label', () => {
		render(
			<RadioGroup
				className='extra'
				legend='Tipo de atención'
				name='kind'
				options={KINDS}
			/>,
		);

		const group = screen.getByRole('group', { name: 'Tipo de atención' });
		const radios = within(group).getAllByRole('radio');

		expect(
			radios.map((radio) => radio.getAttribute('value')),
		).toStrictEqual(['urgent', 'scheduled', 'home']);
		expect(
			within(group).getByRole('radio', { name: 'Urgencia' }),
		).toHaveAccessibleDescription('Atención inmediata');
		expect(radios[2]).toBeDisabled();
		expect(
			radios.every((radio) => radio.getAttribute('name') === 'kind'),
		).toBe(true);
		expect(group).toHaveClass('extra');
	});

	test('works uncontrolled from a default, with the arrow keys', async () => {
		const onValueChange = vi.fn();

		render(
			<RadioGroup
				defaultValue='urgent'
				legend='Tipo'
				onValueChange={onValueChange}
				options={KINDS}
				orientation='horizontal'
			/>,
		);

		expect(screen.getByRole('radio', { name: 'Urgencia' })).toBeChecked();

		await userEvent.tab();
		await userEvent.keyboard('{ArrowDown}');

		expect(screen.getByRole('radio', { name: 'Agendada' })).toBeChecked();
		expect(onValueChange).toHaveBeenCalledExactlyOnceWith('scheduled');
	});

	test('shows the value it is given when controlled', async () => {
		const onValueChange = vi.fn();

		render(
			<RadioGroup
				legend='Tipo'
				onValueChange={onValueChange}
				options={KINDS}
				value='scheduled'
				variant='cards'
			/>,
		);

		await userEvent.click(screen.getByText('Urgencia'));

		expect(onValueChange).toHaveBeenCalledExactlyOnceWith('urgent');
		expect(screen.getByRole('radio', { name: 'Agendada' })).toBeChecked();
	});

	test('ties its hint and its error to the group and marks it required', () => {
		render(
			<RadioGroup
				error='Elija un tipo de atención'
				hint='Puede cambiarlo después'
				legend='Tipo'
				options={KINDS}
				required
			/>,
		);

		const group = screen.getByRole('group', { name: 'Tipo' });

		expect(group).toHaveAccessibleDescription(
			'Puede cambiarlo después Elija un tipo de atención',
		);
		expect(screen.getByRole('radio', { name: 'Urgencia' })).toBeRequired();
		expect(group).toHaveAttribute('data-invalid');
	});

	test('disables every option with the group', () => {
		render(<RadioGroup disabled legend='Tipo' options={KINDS} />);

		for (const radio of screen.getAllByRole('radio'))
			expect(radio).toBeDisabled();
	});
});
