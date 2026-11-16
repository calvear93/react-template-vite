import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef, useState } from 'react';
import { afterEach, describe, expect, test, vi } from 'vitest';
import { inChile } from '../../__mocks__/locale.mock.ts';
import { Field } from '../field/Field.tsx';
import { Combobox, type ComboboxProps } from './Combobox.tsx';

inChile();

interface Commune {
	code: string;
	name: string;
}

const SANTIAGO: Commune = { code: '13101', name: 'Santiago' };
const SAN_BERNARDO: Commune = { code: '13401', name: 'San Bernardo' };
const SAN_JOSE: Commune = { code: '13203', name: 'San José de Maipo' };
const COMMUNES: Commune[] = [
	SANTIAGO,
	SAN_BERNARDO,
	SAN_JOSE,
	{ code: '13120', name: 'Ñuñoa' },
	{ code: '13123', name: 'Providencia' },
];

const INVALID = 'aria-invalid';
const find = (query: string) =>
	COMMUNES.filter((commune) =>
		commune.name.toLowerCase().includes(query.toLowerCase()),
	);

const renderBox = (props: Partial<ComboboxProps<Commune>> = {}) => {
	const search = vi.fn((query: string) => Promise.resolve(find(query)));

	render(
		<Combobox
			aria-label='Comuna'
			delay={0}
			getKey={(commune) => commune.code}
			getLabel={(commune) => commune.name}
			search={search}
			{...props}
		/>,
	);

	return search;
};

const box = () => screen.getByRole<HTMLInputElement>('combobox');
const list = () => screen.queryByRole('listbox', { name: 'Resultados' });
// by its text: happy-dom reads the <mark> of a result as a block, which would put
// a space in its accessible name
const option = (name: string) =>
	screen.findByRole('option', {
		name: (_, element) => element.textContent === name,
	});
const names = () =>
	screen.getAllByRole('option').map((result) => result.textContent);

const Controlled = () => {
	const [commune, setCommune] = useState<Commune | null>(SANTIAGO);

	return (
		<>
			<Combobox
				aria-label='Comuna'
				delay={0}
				getLabel={(item) => item.name}
				onValueChange={setCommune}
				search={find}
				value={commune}
			/>
			<output>{commune?.code}</output>
			<button onClick={() => setCommune(SAN_BERNARDO)} type='button'>
				otra
			</button>
			<button onClick={() => setCommune(null)} type='button'>
				ninguna
			</button>
		</>
	);
};

describe(Combobox, () => {
	// hooks
	afterEach(() => {
		cleanup();
		vi.useRealTimers();
	});

	// tests
	test('is a search box with its list closed', () => {
		const ref = createRef<HTMLInputElement>();
		render(
			<Combobox
				aria-label='Comuna'
				className='extra'
				getLabel={(commune: Commune) => commune.name}
				ref={ref}
				search={find}
			/>,
		);

		expect(ref.current).toBe(box());
		expect(box()).toHaveAttribute('aria-expanded', 'false');
		expect(box()).toHaveAttribute('aria-autocomplete', 'list');
		expect(list()).not.toBeInTheDocument();
	});

	test('shows what the search finds, its first result ready to pick', async () => {
		const search = renderBox();

		await userEvent.type(box(), 'san');

		const first = await option('Santiago');

		expect(names()).toStrictEqual([
			'Santiago',
			'San Bernardo',
			SAN_JOSE.name,
		]);
		expect(search).toHaveBeenLastCalledWith('san', expect.any(AbortSignal));
		expect(box()).toHaveAttribute('aria-expanded', 'true');
		expect(box()).toHaveAttribute('aria-controls', list()?.id);
		expect(box()).toHaveAttribute('aria-activedescendant', first.id);
	});

	test('marks what was typed in each result', async () => {
		renderBox();

		await userEvent.type(box(), 'ñuñ');

		expect(
			within(await option('Ñuñoa')).getByRole('mark'),
		).toHaveTextContent('Ñuñ');
	});

	test('waits for the typing to stop before it searches', async () => {
		vi.useFakeTimers({ shouldAdvanceTime: true });

		const search = renderBox({ delay: 300 });

		await userEvent.type(box(), 'san');

		expect(search).not.toHaveBeenCalled();
		expect(screen.getByText('Buscando…')).toBeVisible();

		await vi.advanceTimersByTimeAsync(300);
		await option('Santiago');

		expect(search).toHaveBeenCalledExactlyOnceWith(
			'san',
			expect.any(AbortSignal),
		);
		expect(screen.queryByText('Buscando…')).not.toBeInTheDocument();
	});

	test('does not search a text that is too short, and closes its list', async () => {
		const search = renderBox({ minLength: 3 });

		await userEvent.type(box(), 'sa');

		expect(search).not.toHaveBeenCalled();

		await userEvent.type(box(), 'n');
		await option('Santiago');
		await userEvent.type(box(), '{Backspace}');

		expect(list()).not.toBeInTheDocument();
		expect(search).toHaveBeenCalledOnce();
	});

	test('moves through its results with the arrows, without leaving them', async () => {
		renderBox();

		await userEvent.type(box(), 'san');
		await option('Santiago');
		await userEvent.keyboard('{ArrowUp}');

		await expect(option('Santiago')).resolves.toHaveAttribute(
			'aria-selected',
			'true',
		);

		await userEvent.keyboard(
			'{ArrowDown}{ArrowDown}{ArrowDown}{ArrowDown}',
		);

		const last = await option(SAN_JOSE.name);

		expect(last).toHaveAttribute('aria-selected', 'true');
		expect(box()).toHaveAttribute('aria-activedescendant', last.id);
		await expect(option('Santiago')).resolves.toHaveAttribute(
			'aria-selected',
			'false',
		);
	});

	test('picks with Enter: the box shows it, its form sends its key', async () => {
		const onValueChange = vi.fn();

		render(
			<form aria-label='Dirección'>
				<Combobox
					aria-label='Comuna'
					delay={0}
					getKey={(commune: Commune) => commune.code}
					getLabel={(commune) => commune.name}
					name='commune'
					onValueChange={onValueChange}
					search={find}
				/>
			</form>,
		);

		await userEvent.type(box(), 'san');
		await option('Santiago');
		await userEvent.keyboard('{ArrowDown}{Enter}');

		expect(box()).toHaveValue('San Bernardo');
		expect(onValueChange).toHaveBeenCalledExactlyOnceWith(SAN_BERNARDO);
		expect(list()).not.toBeInTheDocument();
		expect(
			new FormData(screen.getByRole<HTMLFormElement>('form')).get(
				'commune',
			),
		).toBe('13401');
	});

	test('picks the result clicked, the focus kept in the box', async () => {
		const onValueChange = vi.fn();

		renderBox({ onValueChange });

		await userEvent.type(box(), 'san');
		await userEvent.click(
			within(await option(SAN_JOSE.name)).getByRole('mark'),
		);

		expect(box()).toHaveValue(SAN_JOSE.name);
		expect(box()).toHaveFocus();
		expect(onValueChange).toHaveBeenCalledExactlyOnceWith(SAN_JOSE);
	});

	test('ignores a click between its results', async () => {
		const onValueChange = vi.fn();

		renderBox({ onValueChange });

		await userEvent.type(box(), 'san');
		await option('Santiago');
		await userEvent.click(screen.getByRole('listbox'));

		expect(list()).toBeVisible();
		expect(onValueChange).not.toHaveBeenCalled();
	});

	test('drops what was picked once its text is edited', async () => {
		const onValueChange = vi.fn();

		renderBox({ defaultValue: SANTIAGO, name: 'commune', onValueChange });

		expect(box()).toHaveValue('Santiago');

		await userEvent.type(box(), '{Backspace}');

		expect(onValueChange).toHaveBeenCalledExactlyOnceWith(null);
		expect(box()).toHaveValue('Santiag');
	});

	test('closes only its list with Escape, and stops the key there', async () => {
		const onKeyDown = vi.fn();

		renderBox();
		document.addEventListener('keydown', onKeyDown);

		await userEvent.type(box(), 'san');
		await option('Santiago');

		onKeyDown.mockClear();
		await userEvent.keyboard('{Escape}');

		expect(list()).not.toBeInTheDocument();
		expect(onKeyDown).not.toHaveBeenCalled();
		expect(box()).toHaveValue('san');

		// closed, Escape is no longer its business
		await userEvent.keyboard('{Escape}');

		expect(onKeyDown).toHaveBeenCalledOnce();

		document.removeEventListener('keydown', onKeyDown);
	});

	test('says when the search finds nothing', async () => {
		renderBox();

		await userEvent.type(box(), 'xyz');

		await expect(
			screen.findByText('Sin resultados'),
		).resolves.toBeVisible();
		expect(box()).toHaveAccessibleDescription('Sin resultados');
		expect(box()).not.toHaveAttribute(INVALID);
		expect(list()).not.toBeInTheDocument();
	});

	test('says when the search fails, and marks the box', async () => {
		renderBox({ search: () => Promise.reject(new Error('503')) });

		await userEvent.type(box(), 'san');

		await expect(
			screen.findByText('No se pudo buscar. Intente de nuevo.'),
		).resolves.toBeVisible();
		expect(box()).toHaveAttribute(INVALID, 'true');
		expect(list()).not.toBeInTheDocument();
	});

	test('never lets a late answer replace a newer one', async () => {
		const slow = Promise.withResolvers<Commune[]>();
		const signals: AbortSignal[] = [];
		const search = vi.fn((query: string, signal: AbortSignal) => {
			signals.push(signal);

			return query === 'sa' ? slow.promise : Promise.resolve(find(query));
		});

		renderBox({ search });

		await userEvent.type(box(), 'sa');
		await vi.waitFor(() => expect(search).toHaveBeenCalledOnce());
		await userEvent.type(box(), 'nt');
		await option('Santiago');

		slow.resolve([SAN_BERNARDO]);
		await slow.promise;

		expect(names()).toStrictEqual(['Santiago']);
		expect(signals[0].aborted).toBe(true);
		expect(signals.at(-1)?.aborted).toBe(false);
	});

	test('drops its pending search when the focus leaves', async () => {
		vi.useFakeTimers({ shouldAdvanceTime: true });

		const search = renderBox({ delay: 300 });

		await userEvent.type(box(), 'san');
		await userEvent.tab();
		await vi.advanceTimersByTimeAsync(1000);

		expect(search).not.toHaveBeenCalled();
		expect(screen.queryByText('Buscando…')).not.toBeInTheDocument();
	});

	test('says that a text left unpicked is not a value, until it is edited', async () => {
		renderBox();

		await userEvent.type(box(), 'san');
		await option('Santiago');
		await userEvent.tab();

		expect(screen.getByText('Elija una opción de la lista')).toBeVisible();
		expect(box()).toHaveAttribute(INVALID, 'true');
		expect(list()).not.toBeInTheDocument();

		await userEvent.type(box(), 't');

		expect(
			screen.queryByText('Elija una opción de la lista'),
		).not.toBeInTheDocument();
	});

	test('has nothing to say about an empty box or a picked value on blur', async () => {
		renderBox();

		await userEvent.click(box());
		await userEvent.tab();

		expect(box()).not.toHaveAttribute(INVALID);

		await userEvent.type(box(), 'san');
		await option('Santiago');
		await userEvent.keyboard('{Enter}');
		await userEvent.tab();

		expect(box()).not.toHaveAttribute(INVALID);
		expect(box()).toHaveValue('Santiago');
	});

	test('looks again with ↓ for what a closed box holds', async () => {
		const search = renderBox({ defaultValue: SANTIAGO });

		await userEvent.click(box());
		await userEvent.keyboard('{ArrowUp}');

		expect(search).not.toHaveBeenCalled();

		await userEvent.keyboard('{ArrowDown}');

		await expect(option('Santiago')).resolves.toBeVisible();
		expect(search).toHaveBeenCalledExactlyOnceWith(
			'Santiago',
			expect.any(AbortSignal),
		);
	});

	test('does not look for a text that is too short with ↓', async () => {
		const search = renderBox();

		await userEvent.type(box(), 's{ArrowDown}');

		expect(search).not.toHaveBeenCalled();
	});

	test('sends its form with Enter only when no search is open or on its way', async () => {
		vi.useFakeTimers({ shouldAdvanceTime: true });

		const onSubmit = vi.fn((event: Event) => event.preventDefault());

		render(
			<form aria-label='Dirección'>
				<Combobox
					aria-label='Comuna'
					delay={300}
					getLabel={(commune: Commune) => commune.name}
					search={find}
				/>
			</form>,
		);
		screen.getByRole('form').addEventListener('submit', onSubmit);

		await userEvent.type(box(), 'san{Enter}');
		await vi.advanceTimersByTimeAsync(300);
		await option('Santiago');
		await userEvent.keyboard('{Enter}');

		expect(onSubmit).not.toHaveBeenCalled();

		await userEvent.keyboard('{Enter}');

		expect(onSubmit).toHaveBeenCalledOnce();
	});

	test('keeps nothing with `clearOnPick`: it gives the item and empties', async () => {
		const onValueChange = vi.fn();

		renderBox({ clearOnPick: true, name: 'commune', onValueChange });

		await userEvent.type(box(), 'san');
		await option('Santiago');
		await userEvent.keyboard('{Enter}');

		expect(onValueChange).toHaveBeenCalledExactlyOnceWith(SANTIAGO);
		expect(box()).toHaveValue('');

		await userEvent.type(box(), 'pro');
		await option('Providencia');
		await userEvent.tab();

		expect(box()).not.toHaveAttribute(INVALID);
	});

	test('draws its results as it is told, and takes them at once', async () => {
		renderBox({
			search: find,
			renderOption: (commune, query) => `${commune.code} · ${query}`,
		});

		await userEvent.type(box(), 'ñu');

		await expect(option('13120 · ñu')).resolves.toBeVisible();
	});

	test('goes back to its first value when its form is reset', async () => {
		const onValueChange = vi.fn();

		render(
			<form>
				<Combobox
					aria-label='Comuna'
					defaultValue={SANTIAGO}
					delay={0}
					getLabel={(commune) => commune.name}
					onValueChange={onValueChange}
					search={find}
				/>
				<button type='reset'>Limpiar</button>
			</form>,
		);

		await userEvent.type(box(), 'x');
		await userEvent.click(screen.getByRole('button', { name: 'Limpiar' }));

		expect(box()).toHaveValue('Santiago');
		expect(onValueChange).toHaveBeenLastCalledWith(SANTIAGO);

		await userEvent.click(screen.getByRole('button', { name: 'Limpiar' }));

		expect(onValueChange).toHaveBeenCalledTimes(2);
	});

	test('takes its label, its hint and `required` from its Field', () => {
		render(
			<Field hint='Escriba al menos 2 letras' label='Comuna' required>
				<Combobox
					getLabel={(commune: Commune) => commune.name}
					search={find}
				/>
			</Field>,
		);

		const input = screen.getByRole('combobox', { name: /^Comuna/u });

		expect(input).toBeRequired();
		expect(input).toHaveAccessibleDescription('Escriba al menos 2 letras');
	});

	test('takes other texts, and passes on what happens in its box', async () => {
		const onChange = vi.fn();
		const onKeyDown = vi.fn();
		const onBlur = vi.fn();

		renderBox({
			labels: { empty: 'Nothing found' },
			onBlur,
			onChange,
			onKeyDown,
		});

		await userEvent.type(box(), 'xyz');

		await expect(screen.findByText('Nothing found')).resolves.toBeVisible();

		await userEvent.tab();

		expect(onChange).toHaveBeenCalledTimes(3);
		expect(onKeyDown).toHaveBeenCalledTimes(4);
		expect(onBlur).toHaveBeenCalledOnce();
	});

	test('cannot be typed in while disabled', () => {
		renderBox({ disabled: true });

		expect(box()).toBeDisabled();
	});

	describe('controlled', () => {
		test('shows the value given and reports what is picked', async () => {
			render(<Controlled />);

			expect(box()).toHaveValue('Santiago');

			await userEvent.clear(box());
			await userEvent.type(box(), 'pro');

			expect(screen.getByRole('status')).toBeEmptyDOMElement();
			expect(box()).toHaveValue('pro');

			await userEvent.click(await option('Providencia'));

			expect(screen.getByRole('status')).toHaveTextContent('13123');
		});

		test('takes a new value from outside, and none clears it', async () => {
			render(<Controlled />);

			await userEvent.click(screen.getByRole('button', { name: 'otra' }));

			expect(box()).toHaveValue('San Bernardo');

			await userEvent.click(
				screen.getByRole('button', { name: 'ninguna' }),
			);

			expect(box()).toHaveValue('');
		});
	});

	test('sends nothing with its form while it is disabled', () => {
		render(
			<form aria-label='Datos'>
				<Combobox
					aria-label='Comuna'
					defaultValue={SAN_BERNARDO}
					disabled
					getKey={(commune: Commune) => commune.code}
					getLabel={(commune) => commune.name}
					name='commune'
					search={find}
				/>
			</form>,
		);

		expect(
			new FormData(screen.getByRole<HTMLFormElement>('form')).has(
				'commune',
			),
		).toBe(false);
	});

	test('sends its value with the form it is given', () => {
		render(
			<>
				<form aria-label='Otro' id='other' />
				<Combobox
					aria-label='Comuna'
					defaultValue={SAN_BERNARDO}
					form='other'
					getKey={(commune: Commune) => commune.code}
					getLabel={(commune) => commune.name}
					name='commune'
					search={find}
				/>
			</>,
		);

		expect(
			new FormData(screen.getByRole<HTMLFormElement>('form')).getAll(
				'commune',
			),
		).toStrictEqual(['13401']);
	});
});
