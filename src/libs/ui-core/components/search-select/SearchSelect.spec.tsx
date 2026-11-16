import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, test, vi } from 'vitest';
import { inChile } from '../../__mocks__/locale.mock.ts';
import { Dialog } from '../dialog/Dialog.tsx';
import { Field } from '../field/Field.tsx';
import { SearchSelect, type SearchSelectProps } from './SearchSelect.tsx';

inChile();

const COMMUNES: SearchSelectProps['options'] = [
	{
		label: 'Metropolitana',
		options: [
			{ label: 'Ñuñoa', value: 'nunoa' },
			{ label: 'Maipú', value: 'maipu' },
			{ disabled: true, label: 'San José de Maipo', value: 'sjm' },
		],
	},
	{
		label: 'Valparaíso',
		options: [{ label: 'Viña del Mar', value: 'vina' }],
	},
	{ label: 'Otra comuna', value: 'other' },
];

const VINA = 'Viña del Mar';
const EXPANDED = 'aria-expanded';
const ACTIVE = 'aria-activedescendant';

const renderSelect = (props: Partial<SearchSelectProps> = {}) => {
	const onValueChange = vi.fn();

	render(
		<SearchSelect
			aria-label='Comuna'
			onValueChange={onValueChange}
			options={COMMUNES}
			{...props}
		/>,
	);

	return onValueChange;
};

const field = () => screen.getByRole('combobox', { name: 'Comuna' });
const search = () => screen.getByRole('combobox', { name: 'Buscar' });
const options = () =>
	screen.queryAllByRole('option').map((option) => option.textContent);
const option = (name: string) => screen.getByRole('option', { name });
// the option the keys are on: the search box points at it
const active = () =>
	screen
		.getAllByRole('option')
		.find((item) => item.id === search().getAttribute(ACTIVE))?.textContent;

describe(SearchSelect, () => {
	// hooks
	afterEach(cleanup);

	// tests
	test('is a field that says nothing is picked, its list closed', () => {
		renderSelect({ className: 'extra', placeholder: 'Elija una comuna' });

		expect(field()).toHaveTextContent('Elija una comuna');
		expect(field()).toHaveAttribute(EXPANDED, 'false');
		expect(field()).toHaveAttribute('aria-haspopup', 'listbox');
		expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
	});

	test('opens its list with the focus on its search box', async () => {
		renderSelect();

		await userEvent.click(field());

		expect(field()).toHaveAttribute(EXPANDED, 'true');
		expect(search()).toHaveFocus();
		expect(screen.getByRole('listbox', { name: 'Opciones' }).id).toBe(
			field().getAttribute('aria-controls'),
		);
		expect(options()).toStrictEqual([
			'Ñuñoa',
			'Maipú',
			'San José de Maipo',
			VINA,
			'Otra comuna',
		]);
	});

	test('groups its options under headings that are not options', async () => {
		renderSelect();

		await userEvent.click(field());

		const group = screen.getByRole('group', { name: 'Metropolitana' });

		expect(within(group).getAllByRole('option')).toHaveLength(3);
		expect(screen.getAllByRole('group')).toHaveLength(2);
		expect(
			screen.queryByRole('option', { name: 'Metropolitana' }),
		).not.toBeInTheDocument();
	});

	test('picks the option pressed: the list closes and the field says it', async () => {
		const onValueChange = renderSelect();

		await userEvent.click(field());
		await userEvent.click(option(VINA));

		expect(onValueChange).toHaveBeenCalledExactlyOnceWith('vina');
		expect(field()).toHaveTextContent(VINA);
		expect(field()).toHaveAttribute(EXPANDED, 'false');
		expect(field()).toHaveFocus();
		expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
	});

	test('does not pick an option that is disabled', async () => {
		const onValueChange = renderSelect();

		await userEvent.click(field());
		await userEvent.click(option('San José de Maipo'));

		expect(option('San José de Maipo')).toHaveAttribute(
			'aria-disabled',
			'true',
		);
		expect(onValueChange).not.toHaveBeenCalled();
		expect(field()).toHaveAttribute(EXPANDED, 'true');
	});

	test('filters as it is typed in, accents and case aside, keeping the groups left', async () => {
		renderSelect();

		await userEvent.click(field());
		await userEvent.type(search(), 'VINA');

		expect(options()).toStrictEqual([VINA]);
		expect(screen.getAllByRole('group')).toHaveLength(1);
		expect(active()).toBe(VINA);

		await userEvent.clear(search());

		expect(options()).toHaveLength(5);
	});

	test('says so when the search leaves nothing', async () => {
		renderSelect({ labels: { empty: 'Ninguna comuna' } });

		await userEvent.click(field());
		await userEvent.type(search(), 'zzz');

		expect(screen.getByRole('status')).toHaveTextContent('Ninguna comuna');
		expect(options()).toStrictEqual([]);

		// nothing to pick: Enter does nothing
		await userEvent.keyboard('{Enter}');

		expect(field()).toHaveAttribute(EXPANDED, 'true');
	});

	test('opens with the arrows and moves through its options, the disabled ones skipped', async () => {
		renderSelect();

		field().focus();
		await userEvent.keyboard('{ArrowDown}');

		expect(active()).toBe('Ñuñoa');

		await userEvent.keyboard('{ArrowDown}{ArrowDown}');

		expect(active()).toBe(VINA);

		await userEvent.keyboard('{ArrowDown}{ArrowDown}{ArrowDown}');

		// the end of the list: it does not go around
		expect(active()).toBe('Otra comuna');

		await userEvent.keyboard(
			'{ArrowUp}{ArrowUp}{ArrowUp}{ArrowUp}{ArrowUp}',
		);

		expect(active()).toBe('Ñuñoa');
	});

	test('picks with Enter the option the keys are on', async () => {
		const onValueChange = renderSelect();

		field().focus();
		await userEvent.keyboard('{ArrowUp}mai{Enter}');

		expect(onValueChange).toHaveBeenCalledExactlyOnceWith('maipu');
		expect(field()).toHaveFocus();
	});

	test('opens with the keys on the option picked, marked as selected', async () => {
		renderSelect({ defaultValue: 'vina' });

		expect(field()).toHaveTextContent(VINA);

		await userEvent.click(field());

		expect(active()).toBe(VINA);
		expect(option(VINA)).toHaveAttribute('aria-selected', 'true');
		expect(option('Ñuñoa')).toHaveAttribute('aria-selected', 'false');
	});

	test('closes its list alone with Escape, not the dialog it is in', async () => {
		const onOpenChange = vi.fn();

		render(
			<Dialog onOpenChange={onOpenChange} open title='Nueva denuncia'>
				<SearchSelect aria-label='Comuna' options={COMMUNES} />
			</Dialog>,
		);

		await userEvent.click(field());
		await userEvent.keyboard('{Escape}');

		expect(field()).toHaveAttribute(EXPANDED, 'false');
		expect(field()).toHaveFocus();
		expect(onOpenChange).not.toHaveBeenCalled();

		await userEvent.keyboard('{Escape}');

		expect(onOpenChange).toHaveBeenCalledExactlyOnceWith(false);
	});

	test('closes its list from the field, and when the focus or a press goes elsewhere', async () => {
		render(
			<>
				<SearchSelect aria-label='Comuna' options={COMMUNES} />
				<button type='button'>Otro</button>
				<p>Texto</p>
			</>,
		);

		await userEvent.click(field());
		await userEvent.click(field());

		expect(field()).toHaveAttribute(EXPANDED, 'false');

		await userEvent.click(field());
		await userEvent.tab();

		expect(field()).toHaveAttribute(EXPANDED, 'false');

		await userEvent.click(field());
		await userEvent.click(screen.getByText('Texto'));

		expect(field()).toHaveAttribute(EXPANDED, 'false');
	});

	test('takes its selection away from its clear button, only when asked to have one', async () => {
		const onValueChange = renderSelect({
			clearable: true,
			defaultValue: 'nunoa',
		});

		await userEvent.click(
			screen.getByRole('button', { name: 'Quitar selección' }),
		);

		expect(onValueChange).toHaveBeenCalledExactlyOnceWith('');
		expect(field()).toHaveTextContent('Seleccione…');
		expect(field()).toHaveFocus();
		expect(
			screen.queryByRole('button', { name: 'Quitar selección' }),
		).not.toBeInTheDocument();
	});

	test('shows the value it is given when it is controlled', async () => {
		const onValueChange = renderSelect({ value: 'nunoa' });

		await userEvent.click(field());
		await userEvent.click(option('Maipú'));

		expect(onValueChange).toHaveBeenCalledExactlyOnceWith('maipu');
		expect(field()).toHaveTextContent('Ñuñoa');
	});

	test('sends its value with its form, and goes back to its first one on a reset', async () => {
		render(
			<form aria-label='Datos'>
				<SearchSelect
					aria-label='Comuna'
					defaultValue='nunoa'
					name='commune'
					options={COMMUNES}
				/>
				<button type='reset'>Restablecer</button>
			</form>,
		);

		const sent = () =>
			new FormData(screen.getByRole<HTMLFormElement>('form')).getAll(
				'commune',
			);

		await userEvent.click(field());
		await userEvent.click(option('Otra comuna'));

		expect(sent()).toStrictEqual(['other']);

		await userEvent.click(
			screen.getByRole('button', { name: 'Restablecer' }),
		);

		expect(sent()).toStrictEqual(['nunoa']);
		expect(field()).toHaveTextContent('Ñuñoa');
	});

	test('takes its label, hint, error and required from its Field', () => {
		render(
			<Field
				error='Elija una comuna'
				hint='Donde ocurrió el accidente'
				label='Comuna'
				required
			>
				<SearchSelect options={COMMUNES} size='sm' />
			</Field>,
		);

		expect(field()).toBeInvalid();
		expect(field()).toBeRequired();
		expect(field()).toHaveAccessibleDescription(
			'Donde ocurrió el accidente Elija una comuna',
		);
	});

	test('does not open while it is disabled', async () => {
		renderSelect({
			clearable: true,
			defaultValue: 'nunoa',
			disabled: true,
		});

		await userEvent.click(field());

		expect(field()).toBeDisabled();
		expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
		expect(
			screen.queryByRole('button', { name: 'Quitar selección' }),
		).not.toBeInTheDocument();
	});

	test('sends nothing with its form while it is disabled', () => {
		render(
			<form aria-label='Datos'>
				<SearchSelect
					aria-label='Comuna'
					defaultValue='nunoa'
					disabled
					name='commune'
					options={COMMUNES}
				/>
			</form>,
		);

		expect(
			new FormData(screen.getByRole<HTMLFormElement>('form')).has(
				'commune',
			),
		).toBe(false);
	});
});
