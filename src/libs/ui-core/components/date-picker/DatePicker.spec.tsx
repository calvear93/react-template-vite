import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { type ClipboardEvent, createRef, useState } from 'react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { inChile } from '../../__mocks__/locale.mock.ts';
import { mockPopover } from '../../__mocks__/popover.mock.ts';
import { Field } from '../field/Field.tsx';
import { DatePicker } from './DatePicker.tsx';

inChile();

const TODAY = 'jueves, 5 de noviembre de 2026';

const INVALID = 'aria-invalid';
const TYPED = '05-11-2026';
const DAY = '2026-11-05';
const field = () => screen.getByRole<HTMLInputElement>('textbox');
const opener = () => screen.getByRole('button', { name: 'Abrir calendario' });
const dialog = () => screen.queryByRole('dialog', { name: 'Elegir fecha' });
const button = (name: string) => screen.getByRole('button', { name });

const Controlled = ({ initial = '' }: { initial?: string }) => {
	const [date, setDate] = useState(initial);

	return (
		<>
			<DatePicker
				aria-label='Fecha'
				onValueChange={setDate}
				value={date}
			/>
			<output>{date}</output>
			<button onClick={() => setDate('2027-01-15')} type='button'>
				otra
			</button>
			<button onClick={() => setDate('')} type='button'>
				ninguna
			</button>
		</>
	);
};

describe(DatePicker, () => {
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
	test('is a text field that says its format, with its calendar closed', () => {
		const ref = createRef<HTMLInputElement>();
		render(<DatePicker aria-label='Fecha' className='extra' ref={ref} />);

		expect(ref.current).toBe(field());
		expect(field()).toHaveAccessibleDescription(
			'Formato: dd-mm-aaaa, por ejemplo 25-11-2026',
		);
		expect(opener()).toHaveAttribute('aria-expanded', 'false');
		expect(dialog()).not.toBeInTheDocument();
	});

	test('puts the dashes while the date is typed and tells its ISO value', async () => {
		const onValueChange = vi.fn();

		render(<DatePicker aria-label='Fecha' onValueChange={onValueChange} />);

		await userEvent.type(field(), '05112026');

		expect(field()).toHaveValue(TYPED);
		expect(onValueChange).toHaveBeenCalledExactlyOnceWith(DAY);

		await userEvent.type(field(), '{Backspace}');

		expect(onValueChange).toHaveBeenLastCalledWith('');
	});

	test.each([
		'5/11/2026',
		'5-11-2026',
		'5.11.2026',
		'05/11/2026',
		'2026-11-05',
		' 5/11/2026 ',
	])('takes «%s» pasted for the date it is', async (pasted) => {
		const onValueChange = vi.fn();

		render(<DatePicker aria-label='Fecha' onValueChange={onValueChange} />);

		await userEvent.click(field());
		await userEvent.paste(pasted);

		expect(field()).toHaveValue(TYPED);
		expect(onValueChange).toHaveBeenCalledExactlyOnceWith(DAY);
	});

	test('puts a date pasted whole in the place of the one it had, wherever the caret is', async () => {
		const onValueChange = vi.fn();

		render(
			<DatePicker
				aria-label='Fecha'
				defaultValue='2026-11-15'
				onValueChange={onValueChange}
			/>,
		);

		// «15-11-2026», all of it selected, and a date that starts with the same digit
		field().focus();
		field().select();
		await userEvent.paste('1/12/2026');

		expect(field()).toHaveValue('01-12-2026');
		expect(onValueChange).toHaveBeenLastCalledWith('2026-12-01');

		// with the caret in the middle, and nothing selected
		field().setSelectionRange(3, 3);
		await userEvent.paste('5/11/2026');

		expect(field()).toHaveValue(TYPED);
		expect(onValueChange).toHaveBeenLastCalledWith(DAY);
	});

	test('takes what is pasted and is no date written whole as it is typed', async () => {
		render(<DatePicker aria-label='Fecha' />);

		await userEvent.click(field());
		await userEvent.paste('0511');

		expect(field()).toHaveValue('05-11');

		await userEvent.paste('2026');

		expect(field()).toHaveValue(TYPED);
	});

	test('says so when the date pasted whole is not a real one', async () => {
		render(<DatePicker aria-label='Fecha' />);

		await userEvent.click(field());
		await userEvent.paste('31/2/2026');

		expect(field()).toHaveValue('31-02-2026');

		// the picker is left, not just its text field
		await userEvent.click(document.body);

		expect(field()).toBeInvalid();
	});

	test('tells of a date pasted whole as of one that is typed: a change of its field', async () => {
		const seen: string[] = [];

		render(
			<DatePicker
				aria-label='Fecha'
				defaultValue='2026-11-15'
				onChange={(event) => seen.push(event.target.value)}
			/>,
		);

		field().focus();
		field().setSelectionRange(3, 3);
		await userEvent.paste('5/11/2026');

		expect(seen).toStrictEqual([TYPED]);
		expect(field()).toHaveValue(TYPED);
	});

	test('leaves a pasted date to whoever handles the paste, and takes none while it is read-only', async () => {
		const onChange = vi.fn();
		const onValueChange = vi.fn();
		const onPaste = vi.fn((event: ClipboardEvent<HTMLInputElement>) => {
			event.preventDefault();
		});
		const { rerender } = render(
			<DatePicker
				aria-label='Fecha'
				onChange={onChange}
				onPaste={onPaste}
				onValueChange={onValueChange}
			/>,
		);

		await userEvent.click(field());
		await userEvent.paste('5/11/2026');

		expect(onPaste).toHaveBeenCalledOnce();
		expect(onChange).not.toHaveBeenCalled();
		expect(field()).toHaveValue('');

		rerender(
			<DatePicker
				aria-label='Fecha'
				onValueChange={onValueChange}
				readOnly
			/>,
		);
		await userEvent.paste('5/11/2026');

		expect(field()).toHaveValue('');
		expect(onValueChange).not.toHaveBeenCalled();
	});

	test('keeps the caret where the day is being fixed', async () => {
		render(<DatePicker aria-label='Fecha' defaultValue={DAY} />);

		await userEvent.type(field(), '{Backspace}9', {
			initialSelectionEnd: 2,
			initialSelectionStart: 2,
		});

		expect(field()).toHaveValue('09-11-2026');
		expect(field().selectionStart).toBe(2);
	});

	test('waits for the blur to say what is wrong, and ties it to the field', async () => {
		render(<DatePicker aria-label='Fecha' />);

		await userEvent.type(field(), '31022026');

		expect(field()).not.toHaveAttribute(INVALID);

		await userEvent.tab();
		await userEvent.tab();

		expect(field()).toHaveAttribute(INVALID, 'true');
		expect(field()).toHaveAccessibleDescription(
			/Fecha no válida: use dd-mm-a{4}, por ejemplo 25-11-2026$/u,
		);
	});

	test('takes its message away as soon as the date is right', async () => {
		render(<DatePicker aria-label='Fecha' />);

		await userEvent.type(field(), '3102');
		await userEvent.click(document.body);

		expect(screen.getByText(/^Fecha no válida/u)).toBeVisible();

		await userEvent.clear(field());
		await userEvent.type(field(), '28022026');

		expect(screen.queryByText(/^Fecha no válida/u)).not.toBeInTheDocument();
		expect(field()).not.toHaveAttribute(INVALID);
	});

	test.each([
		['01112026', 'La fecha no puede ser anterior al 03-11-2026'],
		['11122026', 'La fecha no puede ser posterior al 10-12-2026'],
	])('refuses %s, out of its limits: «%s»', async (typed, message) => {
		const onValueChange = vi.fn();

		render(
			<DatePicker
				aria-label='Fecha'
				max='2026-12-10'
				min='2026-11-03'
				onValueChange={onValueChange}
			/>,
		);

		await userEvent.type(field(), typed);
		await userEvent.click(document.body);

		expect(screen.getByText(message)).toBeVisible();
		expect(onValueChange).not.toHaveBeenCalled();
	});

	test('asks for a required date only after it was edited', async () => {
		render(<DatePicker aria-label='Fecha' required />);

		await userEvent.click(field());
		await userEvent.click(document.body);

		expect(field()).not.toHaveAttribute(INVALID);

		await userEvent.type(field(), '0{Backspace}');
		await userEvent.click(document.body);

		expect(
			screen.getByText(
				'Escriba la fecha (dd-mm-aaaa) o elíjala en el calendario',
			),
		).toBeVisible();
		expect(field()).toBeRequired();
	});

	test('does not complain about an optional field left empty', async () => {
		render(<DatePicker aria-label='Fecha' />);

		await userEvent.type(field(), '0{Backspace}');
		await userEvent.click(document.body);

		expect(field()).not.toHaveAttribute(INVALID);
	});

	test('says the messages given', async () => {
		render(
			<DatePicker
				aria-label='Fecha'
				messages={{ min: 'Desde el {date} en adelante' }}
				min='2026-11-03'
			/>,
		);

		await userEvent.type(field(), '01112026');
		await userEvent.click(document.body);

		expect(
			screen.getByText('Desde el 03-11-2026 en adelante'),
		).toBeVisible();
	});

	test('sends the ISO date with its form, and nothing while it is not valid', async () => {
		render(
			<form aria-label='Cita'>
				<DatePicker aria-label='Fecha' name='date' />
			</form>,
		);

		const data = () =>
			new FormData(screen.getByRole<HTMLFormElement>('form')).get('date');

		expect(data()).toBe('');

		await userEvent.type(field(), '0511202');

		expect(data()).toBe('');

		await userEvent.type(field(), '6');

		expect(data()).toBe(DAY);
	});

	test('opens its calendar from its button, the focus on today', async () => {
		render(<DatePicker aria-label='Fecha' />);

		await userEvent.click(opener());

		expect(dialog()).toBeVisible();
		expect(dialog()).toHaveAttribute('aria-modal', 'false');
		expect(opener()).toHaveAttribute('aria-expanded', 'true');
		expect(opener()).toHaveAttribute('aria-controls', dialog()?.id);
		expect(button(TODAY)).toHaveFocus();
	});

	test('opens with Alt + ↓ on the day already chosen, within its limits', async () => {
		render(
			<DatePicker
				aria-label='Fecha'
				defaultValue='2026-12-01'
				max='2026-12-10'
				min='2026-11-03'
			/>,
		);

		await userEvent.type(field(), '{Alt>}{ArrowDown}{/Alt}');

		expect(button('martes, 1 de diciembre de 2026')).toHaveFocus();
		expect(button('martes, 1 de diciembre de 2026')).toHaveAttribute(
			'aria-pressed',
			'true',
		);
		expect(button('viernes, 11 de diciembre de 2026')).toBeDisabled();
		expect(button('Hoy')).toBeEnabled();
	});

	test('closes from its button too', async () => {
		render(<DatePicker aria-label='Fecha' />);

		await userEvent.click(opener());
		await userEvent.click(opener());

		expect(dialog()).not.toBeInTheDocument();
		expect(opener()).toHaveAttribute('aria-expanded', 'false');
		expect(opener()).not.toHaveAttribute('aria-controls');
	});

	test('takes the day picked, closes and gives the focus back to the field', async () => {
		const onValueChange = vi.fn();

		render(<DatePicker aria-label='Fecha' onValueChange={onValueChange} />);

		await userEvent.click(opener());
		await userEvent.keyboard('{ArrowDown}{Enter}');

		expect(field()).toHaveValue('12-11-2026');
		expect(onValueChange).toHaveBeenCalledExactlyOnceWith('2026-11-12');
		expect(dialog()).not.toBeInTheDocument();
		expect(field()).toHaveFocus();
	});

	test('replaces a wrong date, and its message, with the day picked', async () => {
		render(<DatePicker aria-label='Fecha' />);

		await userEvent.type(field(), '3102');
		await userEvent.click(document.body);
		await userEvent.click(opener());
		await userEvent.click(button(TODAY));

		expect(field()).toHaveValue(TYPED);
		expect(field()).not.toHaveAttribute(INVALID);
	});

	test('closes with Escape, the focus back on the field, and stops the key there', async () => {
		const onKeyDown = vi.fn();

		render(<DatePicker aria-label='Fecha' />);
		document.addEventListener('keydown', onKeyDown);

		await userEvent.click(opener());
		await userEvent.keyboard('{Escape}');

		expect(dialog()).not.toBeInTheDocument();
		expect(field()).toHaveFocus();
		expect(onKeyDown).not.toHaveBeenCalled();

		// closed, Escape is no longer its business
		await userEvent.keyboard('{Escape}');

		expect(onKeyDown).toHaveBeenCalledOnce();

		document.removeEventListener('keydown', onKeyDown);
	});

	test('closes with Escape from the field as well', async () => {
		render(<DatePicker aria-label='Fecha' />);

		await userEvent.click(opener());
		await userEvent.click(field());

		expect(dialog()).toBeVisible();

		await userEvent.keyboard('{Escape}');

		expect(dialog()).not.toBeInTheDocument();
	});

	test('picks today and clears from the foot of its calendar', async () => {
		const onValueChange = vi.fn();

		render(
			<DatePicker
				aria-label='Fecha'
				defaultValue='2027-02-14'
				onValueChange={onValueChange}
			/>,
		);

		await userEvent.click(opener());
		await userEvent.click(button('Hoy'));

		expect(field()).toHaveValue(TYPED);
		expect(onValueChange).toHaveBeenLastCalledWith(DAY);

		await userEvent.click(opener());
		await userEvent.click(button('Limpiar'));

		expect(field()).toHaveValue('');
		expect(onValueChange).toHaveBeenLastCalledWith('');
		expect(field()).toHaveFocus();
	});

	test.each([{ min: '2026-11-06' }, { max: '2026-11-04' }])(
		'does not offer today when it is out of %j',
		async (limits) => {
			render(<DatePicker aria-label='Fecha' {...limits} />);

			await userEvent.click(opener());

			expect(button('Hoy')).toBeDisabled();
		},
	);

	test('stays open while the focus moves inside it, and closes when it leaves', async () => {
		render(
			<>
				<DatePicker aria-label='Fecha' />
				<button type='button'>Fuera</button>
			</>,
		);

		await userEvent.click(opener());
		await userEvent.click(button('Mes siguiente'));

		expect(dialog()).toBeVisible();

		await userEvent.click(button('Fuera'));

		expect(dialog()).not.toBeInTheDocument();
		expect(button('Fuera')).toHaveFocus();
	});

	test('closes on a press outside that moves no focus', async () => {
		render(
			<>
				<DatePicker aria-label='Fecha' />
				<p>Fuera</p>
			</>,
		);

		await userEvent.click(opener());
		await userEvent.pointer({
			keys: '[MouseLeft>]',
			target: screen.getByText('Fuera'),
		});

		expect(dialog()).not.toBeInTheDocument();
	});

	test('tells its form when a day is picked', async () => {
		const onChange = vi.fn();

		render(
			<form aria-label='Cita'>
				<DatePicker aria-label='Fecha' name='date' />
			</form>,
		);
		screen.getByRole('form').addEventListener('change', onChange);

		await userEvent.click(opener());
		await userEvent.click(button(TODAY));

		expect(onChange).toHaveBeenCalledOnce();
	});

	test('takes its label, its hint and `required` from its Field', () => {
		render(
			<Field hint='Días hábiles' label='Fecha de la cita' required>
				<DatePicker />
			</Field>,
		);

		const input = screen.getByRole('textbox', {
			name: /^Fecha de la cita/u,
		});

		expect(input).toBeRequired();
		expect(input).toHaveAccessibleDescription(
			'Formato: dd-mm-aaaa, por ejemplo 25-11-2026 Días hábiles',
		);
	});

	test('cannot be typed in nor opened while disabled', () => {
		render(<DatePicker aria-label='Fecha' disabled />);

		expect(field()).toBeDisabled();
		expect(opener()).toBeDisabled();
	});

	test('takes other texts', async () => {
		render(
			<DatePicker
				aria-label='Date'
				labels={{ dialog: 'Pick a date', open: 'Open calendar' }}
			/>,
		);

		await userEvent.click(button('Open calendar'));

		expect(
			screen.getByRole('dialog', { name: 'Pick a date' }),
		).toBeVisible();
	});

	test('passes on what happens in its field', async () => {
		const onChange = vi.fn();
		const onKeyDown = vi.fn();

		render(
			<DatePicker
				aria-label='Fecha'
				onChange={onChange}
				onKeyDown={onKeyDown}
			/>,
		);

		await userEvent.type(field(), '05');

		expect(onChange).toHaveBeenCalledTimes(2);
		expect(onKeyDown).toHaveBeenCalledTimes(2);
	});

	test('shows its calendar in the top layer where the browser has one', async () => {
		const popover = mockPopover();

		render(<DatePicker aria-label='Fecha' />);

		await userEvent.click(opener());

		expect(popover.showPopover).toHaveBeenCalledOnce();
	});

	test('goes back to its first date when its form is reset', async () => {
		const onValueChange = vi.fn();

		render(
			<form>
				<DatePicker
					aria-label='Fecha'
					defaultValue={DAY}
					name='date'
					onValueChange={onValueChange}
				/>
				<button type='reset'>Limpiar</button>
			</form>,
		);

		await userEvent.type(field(), '{Backspace}');
		await userEvent.click(button('Limpiar'));

		expect(field()).toHaveValue(TYPED);
		expect(onValueChange).toHaveBeenLastCalledWith(DAY);
		expect(field()).not.toHaveAttribute(INVALID);
	});

	describe('controlled', () => {
		test('shows the value given and reports what is typed', async () => {
			render(<Controlled initial={DAY} />);

			expect(field()).toHaveValue(TYPED);

			await userEvent.type(field(), '{Backspace}');

			expect(field()).toHaveValue('05-11-202');
			expect(screen.getByRole('status')).toBeEmptyDOMElement();

			await userEvent.type(field(), '7');

			expect(screen.getByRole('status')).toHaveTextContent('2027-11-05');
		});

		test('takes a new value from outside, and an empty one clears it', async () => {
			render(<Controlled />);

			await userEvent.click(button('otra'));

			expect(field()).toHaveValue('15-01-2027');

			await userEvent.click(button('ninguna'));

			expect(field()).toHaveValue('');
		});
	});

	test('sends nothing with its form while it is disabled', () => {
		render(
			<form aria-label='Datos'>
				<DatePicker
					aria-label='Fecha'
					defaultValue='2026-11-05'
					disabled
					name='date'
				/>
			</form>,
		);

		expect(
			new FormData(screen.getByRole<HTMLFormElement>('form')).has('date'),
		).toBe(false);
	});

	test('sends its value with the form it is given', () => {
		render(
			<>
				<form aria-label='Otro' id='other' />
				<DatePicker
					aria-label='Fecha'
					defaultValue='2026-11-05'
					form='other'
					name='date'
				/>
			</>,
		);

		expect(
			new FormData(screen.getByRole<HTMLFormElement>('form')).getAll(
				'date',
			),
		).toStrictEqual(['2026-11-05']);
	});

	// a date has eight digits: a full field takes no more, wherever it is typed, and
	// loses none of the ones it has
	describe('once it is full', () => {
		const renderFull = () => {
			const onChange = vi.fn();
			const onValueChange = vi.fn();

			render(
				<DatePicker
					aria-label='Fecha'
					defaultValue={DAY}
					onChange={onChange}
					onValueChange={onValueChange}
				/>,
			);

			return { onChange, onValueChange };
		};

		test.each(
			Array.from({ length: TYPED.length + 1 }, (_, caret) => caret),
		)(
			'takes no digit typed at %i, and keeps its date and its caret',
			async (caret) => {
				const { onChange, onValueChange } = renderFull();

				await userEvent.type(field(), '7', {
					initialSelectionEnd: caret,
					initialSelectionStart: caret,
				});

				expect(field()).toHaveValue(TYPED);
				expect(field().selectionStart).toBe(caret);
				expect(onChange).not.toHaveBeenCalled();
				expect(onValueChange).not.toHaveBeenCalled();
			},
		);

		test('still lets a digit be typed over another, or taken away', async () => {
			const { onValueChange } = renderFull();

			// «05-[1]1-2026»
			await userEvent.type(field(), '0', {
				initialSelectionEnd: 4,
				initialSelectionStart: 3,
			});

			expect(field()).toHaveValue('05-01-2026');
			expect(onValueChange).toHaveBeenLastCalledWith('2026-01-05');

			await userEvent.type(field(), '{Backspace}');

			expect(field()).toHaveValue('05-01-202');
		});

		test('takes nothing of what is pasted in it and does not fit', async () => {
			const { onValueChange } = renderFull();

			field().focus();
			field().setSelectionRange(3, 3);
			await userEvent.paste('99');

			expect(field()).toHaveValue(TYPED);
			expect(field().selectionStart).toBe(3);
			expect(onValueChange).not.toHaveBeenCalled();
		});
	});

	test('takes nothing of digits pasted that are more than a date has, and are no date', async () => {
		render(<DatePicker aria-label='Fecha' />);

		await userEvent.click(field());
		await userEvent.paste('051120269');

		expect(field()).toHaveValue('');
	});

	test('takes a digit anywhere while its date is not whole, the rest moved along', async () => {
		render(<DatePicker aria-label='Fecha' />);

		await userEvent.type(field(), '0511');
		// «0|5-11»
		await userEvent.type(field(), '2', {
			initialSelectionEnd: 1,
			initialSelectionStart: 1,
		});

		expect(field()).toHaveValue('02-51-1');
	});

	test('says its own message for one given as undefined, and its own label', async () => {
		render(
			<DatePicker
				aria-label='Fecha'
				labels={{ open: undefined }}
				messages={{ min: undefined }}
				min='2026-11-03'
			/>,
		);

		await userEvent.type(field(), '01112026');
		await userEvent.click(document.body);

		expect(
			screen.getByText('La fecha no puede ser anterior al 03-11-2026'),
		).toBeVisible();
		expect(opener()).toBeVisible();
	});
});
