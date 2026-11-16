import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef } from 'react';
import { afterEach, describe, expect, test, vi } from 'vitest';
import { Field } from '../field/Field.tsx';
import { Select } from './Select.tsx';

const REGIONS = [
	{ label: 'Metropolitana', value: 'RM' },
	{ label: 'Valparaíso', value: 'V' },
	{ disabled: true, label: 'Biobío', value: 'VIII' },
];

describe(Select, () => {
	// hooks
	afterEach(cleanup);

	// tests
	test('is a native select with its options and an empty choice first', () => {
		const ref = createRef<HTMLSelectElement>();

		render(
			<Select
				aria-label='Región'
				className='extra'
				options={REGIONS}
				placeholder='Seleccione…'
				ref={ref}
			/>,
		);

		const select = screen.getByRole('combobox', { name: 'Región' });
		const options = within(select).getAllByRole('option');

		expect(options.map((option) => option.textContent)).toStrictEqual([
			'Seleccione…',
			'Metropolitana',
			'Valparaíso',
			'Biobío',
		]);
		expect(select).toHaveValue('');
		expect(options[3]).toBeDisabled();
		expect(ref.current).toBe(select);
	});

	test('groups its options under headings that are not options', async () => {
		const onChange = vi.fn();

		render(
			<Select
				aria-label='Comuna'
				onChange={onChange}
				options={[
					{
						label: 'Metropolitana',
						options: [
							{ label: 'Ñuñoa', value: 'nunoa' },
							{ label: 'Maipú', value: 'maipu' },
						],
					},
					{
						disabled: true,
						label: 'Valparaíso',
						options: [{ label: 'Viña del Mar', value: 'vina' }],
					},
					{ label: 'Otra', value: 'other' },
				]}
				placeholder='Seleccione…'
			/>,
		);

		const select = screen.getByRole('combobox', { name: 'Comuna' });
		const groups = within(select).getAllByRole('group');

		expect(
			groups.map((group) => group.getAttribute('label')),
		).toStrictEqual(['Metropolitana', 'Valparaíso']);
		expect(groups[1]).toBeDisabled();
		// the headings are not choices: the empty one, three in groups and one loose
		expect(within(select).getAllByRole('option')).toHaveLength(5);

		await userEvent.selectOptions(select, 'maipu');

		expect(select).toHaveValue('maipu');
		expect(onChange).toHaveBeenCalledOnce();
	});

	test('works uncontrolled and tells what was chosen', async () => {
		const onChange = vi.fn();

		render(
			<Select
				aria-label='Región'
				defaultValue='V'
				name='region'
				onChange={onChange}
				options={REGIONS}
			/>,
		);

		const select = screen.getByRole('combobox', { name: 'Región' });

		expect(select).toHaveValue('V');

		await userEvent.selectOptions(select, 'Metropolitana');

		expect(select).toHaveValue('RM');
		expect(onChange).toHaveBeenCalledOnce();
	});

	test.each(['sm', 'md', 'lg'] as const)(
		'takes options as children and its name from the field (%s)',
		(size) => {
			render(
				<Field error='Elija una región' label='Región' required>
					<Select size={size}>
						<option value='RM'>Metropolitana</option>
					</Select>
				</Field>,
			);

			const select = screen.getByRole('combobox', { name: 'Región' });

			expect(select).toBeRequired();
			expect(select).toBeInvalid();
			expect(within(select).getByRole('option')).toHaveValue('RM');
		},
	);
});
