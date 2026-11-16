import {
	cleanup,
	fireEvent,
	render,
	screen,
	within,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, test, vi } from 'vitest';
import { inChile } from '../../__mocks__/locale.mock.ts';
import { FilterBar } from '../filter-bar/FilterBar.tsx';
import { MultiSelect, type MultiSelectProps } from './MultiSelect.tsx';

inChile();

const STATES: MultiSelectProps['options'] = [
	{
		label: 'En curso',
		options: [
			{ label: 'Abierta', value: 'open' },
			{ label: 'En revisión', value: 'review' },
		],
	},
	{
		label: 'Terminadas',
		options: [
			{ label: 'Cerrada', value: 'closed' },
			{ disabled: true, label: 'Anulada', value: 'void' },
		],
	},
];

const EXPANDED = 'aria-expanded';
const SELECTED = 'aria-selected';
const ACTIVE = 'aria-activedescendant';

const renderSelect = (props: Partial<MultiSelectProps> = {}) => {
	const onValueChange = vi.fn();

	render(
		<MultiSelect
			aria-label='Estados'
			onValueChange={onValueChange}
			options={STATES}
			{...props}
		/>,
	);

	return onValueChange;
};

const field = () => screen.getByRole('combobox', { name: 'Estados' });
const option = (name: string) => screen.getByRole('option', { name });
const picked = () =>
	screen
		.getAllByRole('option')
		.filter((item) => item.getAttribute(SELECTED) === 'true')
		.map((item) => item.textContent);
// the option the keys are on: the field points at it
const active = () =>
	screen
		.getAllByRole('option')
		.find((item) => item.id === field().getAttribute(ACTIVE))?.textContent;

describe(MultiSelect, () => {
	// hooks
	afterEach(cleanup);

	// tests
	test('is a field that says nothing is picked, its list closed', () => {
		renderSelect({ className: 'extra' });

		expect(field()).toHaveTextContent('Seleccione…');
		expect(field()).toHaveAttribute(EXPANDED, 'false');
		expect(field()).not.toHaveAttribute('title');
		expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
	});

	test('opens a list where several can be picked, the focus still on the field', async () => {
		renderSelect();

		await userEvent.click(field());

		expect(screen.getByRole('listbox')).toHaveAttribute(
			'aria-multiselectable',
			'true',
		);
		expect(field()).toHaveFocus();
		expect(screen.getAllByRole('option')).toHaveLength(4);
		expect(
			screen.queryByRole('combobox', { name: 'Buscar' }),
		).not.toBeInTheDocument();
	});

	test('picks and unpicks options without closing, in the order of the list', async () => {
		const onValueChange = renderSelect();

		await userEvent.click(field());
		await userEvent.click(option('Cerrada'));
		await userEvent.click(option('Abierta'));

		expect(onValueChange.mock.calls).toStrictEqual([
			[['closed']],
			[['open', 'closed']],
		]);
		expect(picked()).toStrictEqual(['Abierta', 'Cerrada']);
		expect(field()).toHaveAttribute(EXPANDED, 'true');

		await userEvent.click(option('Cerrada'));

		expect(picked()).toStrictEqual(['Abierta']);
	});

	test('says what is picked in one line, with how many', () => {
		renderSelect({ defaultValue: ['review', 'open'] });

		// the names, in the order of the list, and the counter
		expect(field()).toHaveTextContent('Abierta, En revisión2');
		expect(field()).toHaveAttribute('title', 'Abierta, En revisión');
	});

	test('counts what is picked in its foot, and clears it from there', async () => {
		const onValueChange = renderSelect({ defaultValue: ['open'] });

		await userEvent.click(field());

		const list = screen.getByRole('listbox');
		const clear = screen.getByRole('button', { name: 'Limpiar' });

		expect(screen.getByText('1 seleccionada')).toBeInTheDocument();

		await userEvent.click(option('Cerrada'));

		expect(screen.getByText('2 seleccionadas')).toBeInTheDocument();

		await userEvent.click(clear);

		expect(onValueChange).toHaveBeenLastCalledWith([]);
		expect(screen.getByText('0 seleccionadas')).toBeInTheDocument();
		// clearing is not leaving: the list is still there
		expect(list).toBeInTheDocument();
	});

	test('does not let a group select its options', async () => {
		const onValueChange = renderSelect();

		await userEvent.click(field());
		await userEvent.click(screen.getByText('En curso'));

		expect(
			within(
				screen.getByRole('group', { name: 'En curso' }),
			).getAllByRole('option'),
		).toHaveLength(2);
		expect(onValueChange).not.toHaveBeenCalled();
		expect(picked()).toStrictEqual([]);
	});

	test('is used from the field with the keyboard: arrows, the ends, Space and Enter', async () => {
		const onValueChange = renderSelect();

		field().focus();
		await userEvent.keyboard('{ArrowDown}');

		expect(active()).toBe('Abierta');

		await userEvent.keyboard('{End}');

		// the last one that can be picked: «Anulada» is disabled
		expect(active()).toBe('Cerrada');

		await userEvent.keyboard(' {Home}{Enter}');

		expect(onValueChange).toHaveBeenLastCalledWith(['open', 'closed']);
		expect(field()).toHaveAttribute(EXPANDED, 'true');
	});

	test('keeps the keys on no option, and inside its list, when none can be picked', async () => {
		const onValueChange = renderSelect({
			options: [
				{ disabled: true, label: 'Anulada', value: 'void' },
				{ disabled: true, label: 'Vencida', value: 'expired' },
			],
		});

		await userEvent.click(field());

		expect(field()).not.toHaveAttribute(ACTIVE);

		// up from nowhere and to the end: there is no option to be on
		await userEvent.keyboard('{ArrowUp}');

		expect(field()).not.toHaveAttribute(ACTIVE);

		await userEvent.keyboard('{End}');

		expect(field()).not.toHaveAttribute(ACTIVE);

		await userEvent.keyboard('{ArrowDown}{Home}{Enter}');

		expect(field()).not.toHaveAttribute(ACTIVE);
		expect(onValueChange).not.toHaveBeenCalled();
	});

	test('goes to the option that starts with what is typed, accents aside', async () => {
		renderSelect();

		field().focus();
		await userEvent.keyboard('{ArrowDown}ce');

		expect(active()).toBe('Cerrada');

		await userEvent.keyboard('{Home}');
		// nothing starts with it: the keys stay where they are
		await userEvent.keyboard('z');

		expect(active()).toBe('Abierta');
	});

	test('does not take the Space that picked an option as a press of the field', async () => {
		renderSelect();

		field().focus();
		await userEvent.keyboard('{ArrowDown}');
		fireEvent.keyDown(field(), { key: ' ' });

		// not prevented, the browser would turn it into a click that closes the list
		expect(fireEvent.keyUp(field(), { key: ' ' })).toBe(false);
		expect(fireEvent.keyUp(field(), { key: ' ' })).toBe(true);
		expect(picked()).toStrictEqual(['Abierta']);
	});

	test('searches its options when it is asked to', async () => {
		renderSelect({
			labels: { search: 'Buscar estado' },
			searchable: true,
		});

		await userEvent.click(field());

		const search = screen.getByRole('combobox', { name: 'Buscar estado' });

		expect(search).toHaveFocus();

		await userEvent.type(search, 'revision{Enter}');

		expect(
			screen.getAllByRole('option').map((item) => item.textContent),
		).toStrictEqual(['En revisión']);
		expect(picked()).toStrictEqual(['En revisión']);
	});

	test('reaches its foot with Tab, and closes when the focus leaves it', async () => {
		renderSelect({ defaultValue: ['open'] });

		await userEvent.click(field());
		await userEvent.tab();

		expect(screen.getByRole('button', { name: 'Limpiar' })).toHaveFocus();
		expect(field()).toHaveAttribute(EXPANDED, 'true');

		await userEvent.tab();

		expect(field()).toHaveAttribute(EXPANDED, 'false');
	});

	test('closes with Escape from its foot too', async () => {
		renderSelect({ defaultValue: ['open'] });

		await userEvent.click(field());
		await userEvent.tab();
		await userEvent.keyboard('{Escape}');

		expect(field()).toHaveAttribute(EXPANDED, 'false');
		expect(field()).toHaveFocus();
	});

	test('sends one value per option picked, and tells its form of each change', async () => {
		const onChange = vi.fn();

		render(
			<form aria-label='Filtros'>
				<MultiSelect
					aria-label='Estados'
					defaultValue={['open']}
					name='state'
					options={STATES}
				/>
				<button type='reset'>Restablecer</button>
			</form>,
		);

		const form = screen.getByRole<HTMLFormElement>('form');
		const sent = () => new FormData(form).getAll('state');

		form.addEventListener('change', onChange);
		await userEvent.click(field());
		await userEvent.click(option('Cerrada'));

		expect(sent()).toStrictEqual(['open', 'closed']);

		await userEvent.click(screen.getByRole('button', { name: 'Limpiar' }));

		// told of the last value going too: nothing is sent any more
		expect(sent()).toStrictEqual([]);
		expect(onChange).toHaveBeenCalledTimes(2);

		await userEvent.click(
			screen.getByRole('button', { name: 'Restablecer' }),
		);

		expect(sent()).toStrictEqual(['open']);
	});

	test('shows the values it is given when it is controlled', async () => {
		const onValueChange = renderSelect({ value: ['closed'] });

		await userEvent.click(field());
		await userEvent.click(option('Abierta'));

		expect(onValueChange).toHaveBeenCalledExactlyOnceWith([
			'open',
			'closed',
		]);
		expect(picked()).toStrictEqual(['Cerrada']);
	});

	test('takes other texts', async () => {
		renderSelect({
			placeholder: 'Todos los estados',
			labels: {
				clear: 'Quitar todo',
				selected: (count) => `${count} elegidos`,
			},
		});

		expect(field()).toHaveTextContent('Todos los estados');

		await userEvent.click(field());

		expect(screen.getByText('0 elegidos')).toBeInTheDocument();
		expect(
			screen.getByRole('button', { name: 'Quitar todo' }),
		).toBeDisabled();
	});

	test('applies the filters of a FilterBar as its options are picked and cleared', async () => {
		const onSubmit = vi.fn<(states: FormDataEntryValue[]) => void>();

		render(
			<FilterBar
				aria-label='Filtros'
				autoSubmit
				onSubmit={(data) => onSubmit(data.getAll('state'))}
			>
				<MultiSelect
					aria-label='Estados'
					name='state'
					options={STATES}
				/>
			</FilterBar>,
		);

		await userEvent.click(field());
		await userEvent.click(option('Abierta'));
		await userEvent.click(option('Cerrada'));
		await userEvent.click(screen.getByRole('button', { name: 'Limpiar' }));

		expect(onSubmit.mock.calls).toStrictEqual([
			[['open']],
			[['open', 'closed']],
			[[]],
		]);
	});

	test('sends nothing with its form while it is disabled', () => {
		render(
			<form aria-label='Datos'>
				<MultiSelect
					aria-label='Estados'
					defaultValue={['open']}
					disabled
					name='state'
					options={STATES}
				/>
			</form>,
		);

		expect(
			new FormData(screen.getByRole<HTMLFormElement>('form')).has(
				'state',
			),
		).toBe(false);
	});

	test('counts what is picked with its own words when those are given as undefined', async () => {
		renderSelect({
			defaultValue: ['open'],
			labels: { clear: undefined, selected: undefined },
		});

		await userEvent.click(field());

		expect(screen.getByText('1 seleccionada')).toBeInTheDocument();
		expect(screen.getByRole('button', { name: 'Limpiar' })).toBeVisible();
	});
});
