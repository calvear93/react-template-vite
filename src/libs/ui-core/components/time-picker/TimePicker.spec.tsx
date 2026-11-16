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
import { mockRect } from '../../__mocks__/rect.mock.ts';
import { Dialog } from '../dialog/Dialog.tsx';
import { Field } from '../field/Field.tsx';
import { FilterBar } from '../filter-bar/FilterBar.tsx';
import { TimePicker, type TimePickerProps } from './TimePicker.tsx';

inChile();

const HOURS = 'Horas';
const MINUTES = 'Minutos';
const SELECTED = 'aria-selected';
const INVALID = 'Hora no válida: use hh:mm en 24 horas, por ejemplo 09:30';

/** The text of a time field once the character at `index` is gone: its digits, as they come. */
const gone = (text: string, index: number) => {
	const left =
		index < 0 ? text : `${text.slice(0, index)}${text.slice(index + 1)}`;
	const digits = left.replaceAll(/\D/gu, '');

	return [digits.slice(0, 2), digits.slice(2)].filter(Boolean).join(':');
};

const renderPicker = (props: Partial<TimePickerProps> = {}) => {
	const onValueChange = vi.fn();

	render(
		<>
			<TimePicker
				aria-label='Hora'
				onValueChange={onValueChange}
				{...props}
			/>
			<button type='button'>Otro</button>
		</>,
	);

	return onValueChange;
};

const field = () =>
	screen.getByRole<HTMLInputElement>('textbox', { name: 'Hora' });
const opener = () =>
	screen.getByRole('button', { name: 'Abrir selector de hora' });
const panel = () => screen.queryByRole('dialog', { name: 'Elegir hora' });
const list = (name: string) => screen.getByRole('listbox', { name });
const option = (listName: string, name: string) =>
	within(list(listName)).getByRole('option', { name });
/** Out of the field and of its own button: where what is wrong is said. */
const leave = async () => {
	await userEvent.tab();
	await userEvent.tab();
};
const names = (listName: string) =>
	within(list(listName))
		.getAllByRole('option')
		.map((item) => item.textContent);

describe(TimePicker, () => {
	// hooks
	afterEach(() => {
		cleanup();
		vi.restoreAllMocks();
	});

	// tests
	describe('its field', () => {
		test('is a text field that says its format, its panel closed', () => {
			renderPicker({ className: 'extra', size: 'sm' });

			expect(field()).toHaveValue('');
			expect(field()).toHaveAttribute('placeholder', 'hh:mm');
			expect(field()).toHaveAccessibleDescription(
				'Formato: hora y minutos en 24 horas, por ejemplo 09:30',
			);
			expect(opener()).toHaveAttribute('aria-expanded', 'false');
			expect(panel()).not.toBeInTheDocument();
		});

		test('puts the colon in while it is typed, and tells the time once it is one', async () => {
			const onValueChange = renderPicker();

			await userEvent.type(field(), '143');

			expect(field()).toHaveValue('14:3');
			expect(onValueChange).not.toHaveBeenCalled();

			await userEvent.type(field(), '5');

			expect(field()).toHaveValue('14:35');
			expect(onValueChange).toHaveBeenCalledExactlyOnceWith('14:35');
		});

		test('gives its zero to an hour typed with one digit and a colon', async () => {
			const onValueChange = renderPicker();

			await userEvent.type(field(), '9:30');

			expect(field()).toHaveValue('09:30');
			expect(field().selectionStart).toBe(5);
			expect(onValueChange).toHaveBeenLastCalledWith('09:30');
		});

		test('says a time is not one once the field is left, and until it is right', async () => {
			renderPicker();

			await userEvent.type(field(), '25:00');

			// not while it is still being typed
			expect(field()).toBeValid();

			await leave();

			expect(field()).toBeInvalid();
			expect(field()).toHaveAccessibleDescription(
				expect.stringContaining(INVALID),
			);

			await userEvent.clear(field());
			await userEvent.type(field(), '2300');

			expect(field()).toBeValid();
			expect(screen.queryByText(INVALID)).not.toBeInTheDocument();
		});

		test.each([
			{
				says: 'La hora no puede ser anterior a las 08:00',
				typed: '0759',
			},
			{
				says: 'La hora no puede ser posterior a las 18:00',
				typed: '1801',
			},
		])('says «$says» for $typed', async ({ says, typed }) => {
			const onValueChange = renderPicker({ max: '18:00', min: '08:00' });

			await userEvent.type(field(), typed);
			await leave();

			expect(screen.getByText(says)).toBeVisible();
			// a time out of its limits is not a value
			expect(onValueChange).not.toHaveBeenCalled();
		});

		test('asks for a time when its Field requires one, with its own texts', async () => {
			render(
				<Field hint='En 24 horas' label='Hora' required>
					<TimePicker messages={{ required: 'Falta la hora' }} />
				</Field>,
			);

			await userEvent.type(field(), '1');
			await userEvent.clear(field());
			await leave();

			expect(field()).toBeRequired();
			expect(screen.getByText('Falta la hora')).toBeVisible();
			expect(field()).toHaveAccessibleDescription(
				expect.stringContaining('En 24 horas'),
			);
		});

		test('shows the time it is given, and follows it when it changes', () => {
			const { rerender } = render(
				<TimePicker aria-label='Hora' value='09:30' />,
			);

			expect(field()).toHaveValue('09:30');

			rerender(<TimePicker aria-label='Hora' value='16:45' />);

			expect(field()).toHaveValue('16:45');

			rerender(<TimePicker aria-label='Hora' value='' />);

			expect(field()).toHaveValue('');
		});

		test('sends its time with its form, and goes back to its first one on a reset', async () => {
			const onValueChange = vi.fn();

			render(
				<form aria-label='Datos'>
					<TimePicker
						aria-label='Hora'
						defaultValue='09:30'
						name='time'
						onValueChange={onValueChange}
					/>
					<button type='reset'>Restablecer</button>
				</form>,
			);

			const sent = () =>
				new FormData(screen.getByRole<HTMLFormElement>('form')).get(
					'time',
				);

			expect(sent()).toBe('09:30');

			await userEvent.clear(field());
			await userEvent.type(field(), '1215');

			expect(sent()).toBe('12:15');

			await userEvent.click(
				screen.getByRole('button', { name: 'Restablecer' }),
			);

			expect(field()).toHaveValue('09:30');
			expect(onValueChange).toHaveBeenLastCalledWith('09:30');
		});

		test('runs the handlers of the input it is given', async () => {
			const onChange = vi.fn();
			const onKeyDown = vi.fn();

			renderPicker({ onChange, onKeyDown });

			await userEvent.type(field(), '1');

			expect(onChange).toHaveBeenCalledOnce();
			expect(onKeyDown).toHaveBeenCalledOnce();
		});

		test('does not open while it is disabled', async () => {
			renderPicker({ disabled: true });

			await userEvent.click(opener());

			expect(field()).toBeDisabled();
			expect(panel()).not.toBeInTheDocument();
		});
	});

	describe('its panel', () => {
		test('opens from its button and with Alt + ArrowDown, a dialog that is not modal', async () => {
			renderPicker();

			await userEvent.click(opener());

			expect(panel()).toHaveAttribute('aria-modal', 'false');
			expect(opener()).toHaveAttribute('aria-controls', panel()?.id);

			await userEvent.click(opener());

			expect(panel()).not.toBeInTheDocument();

			field().focus();
			await userEvent.keyboard('{Alt>}{ArrowDown}{/Alt}');

			expect(panel()).toBeInTheDocument();
		});

		test('closes alone with Escape, the focus back in the field', async () => {
			const onOpenChange = vi.fn();

			render(
				<Dialog onOpenChange={onOpenChange} open title='Denuncia'>
					<TimePicker aria-label='Hora' />
				</Dialog>,
			);

			await userEvent.click(opener());
			await userEvent.keyboard('{Escape}');

			expect(panel()).not.toBeInTheDocument();
			expect(field()).toHaveFocus();
			expect(onOpenChange).not.toHaveBeenCalled();
		});

		test('closes when the focus or a press goes elsewhere', async () => {
			renderPicker();

			await userEvent.click(opener());
			await userEvent.click(screen.getByRole('button', { name: 'Otro' }));

			expect(panel()).not.toBeInTheDocument();
		});

		test('sets the time of now, and clears it', async () => {
			// 17:35 UTC is 14:35 in Santiago
			vi.spyOn(Date, 'now').mockReturnValue(
				Date.UTC(2026, 10, 15, 17, 35),
			);

			const onValueChange = renderPicker();

			await userEvent.click(opener());
			await userEvent.click(
				screen.getByRole('button', { name: 'Ahora' }),
			);

			expect(field()).toHaveValue('14:35');
			expect(field()).toHaveFocus();
			expect(panel()).not.toBeInTheDocument();

			await userEvent.click(opener());
			await userEvent.click(
				screen.getByRole('button', { name: 'Limpiar' }),
			);

			expect(field()).toHaveValue('');
			expect(onValueChange).toHaveBeenLastCalledWith('');
		});

		test('does not offer now when it is out of its limits', async () => {
			vi.spyOn(Date, 'now').mockReturnValue(
				Date.UTC(2026, 10, 15, 17, 35),
			);
			renderPicker({ labels: { now: 'Esta hora' }, max: '12:00' });

			await userEvent.click(opener());

			expect(
				screen.getByRole('button', { name: 'Esta hora' }),
			).toBeDisabled();
		});
	});

	test('applies the filters of a FilterBar when a time is picked', async () => {
		const onSubmit = vi.fn<(time: FormDataEntryValue | null) => void>();

		render(
			<FilterBar
				aria-label='Filtros'
				autoSubmit
				onSubmit={(data) => onSubmit(data.get('from'))}
			>
				<TimePicker aria-label='Hora' name='from' picker='list' />
			</FilterBar>,
		);

		await userEvent.click(opener());
		await userEvent.click(option('Horarios', '08:30'));

		expect(onSubmit).toHaveBeenCalledExactlyOnceWith('08:30');
	});

	describe('as two columns', () => {
		test('lists the hours and the minutes of its step, the focus on the first hour', async () => {
			renderPicker();

			await userEvent.click(opener());

			expect(names(HOURS)).toHaveLength(24);
			expect(names(HOURS).slice(0, 2)).toStrictEqual(['00', '01']);
			expect(names(MINUTES)).toStrictEqual([
				'00',
				'05',
				'10',
				'15',
				'20',
				'25',
				'30',
				'35',
				'40',
				'45',
				'50',
				'55',
			]);
			expect(option(HOURS, '00')).toHaveFocus();
		});

		test('keeps open after the hour, and closes once the minutes are picked', async () => {
			const onValueChange = renderPicker();

			await userEvent.click(opener());
			await userEvent.click(option(HOURS, '14'));

			expect(field()).toHaveValue('14:00');
			expect(panel()).toBeInTheDocument();

			await userEvent.click(option(MINUTES, '35'));

			expect(field()).toHaveValue('14:35');
			expect(panel()).not.toBeInTheDocument();
			expect(onValueChange.mock.calls).toStrictEqual([
				['14:00'],
				['14:35'],
			]);
		});

		test('keeps open after a minute picked before any hour, the hour shown as 00', async () => {
			const onValueChange = renderPicker();

			await userEvent.click(opener());
			await userEvent.click(option(MINUTES, '35'));

			// nobody chose the hour: the panel stays, for it to be seen and changed
			expect(field()).toHaveValue('00:35');
			expect(panel()).toBeInTheDocument();
			expect(option(HOURS, '00')).toHaveAttribute(SELECTED, 'true');

			await userEvent.click(option(HOURS, '14'));
			await userEvent.click(option(MINUTES, '40'));

			// with an hour, the minutes end the panel
			expect(panel()).not.toBeInTheDocument();
			expect(onValueChange.mock.calls).toStrictEqual([
				['00:35'],
				['14:35'],
				['14:40'],
			]);
		});

		test('keeps an hour picked alone within its limits', async () => {
			const onValueChange = renderPicker({ max: '17:15', min: '08:30' });

			await userEvent.click(opener());
			await userEvent.click(option(HOURS, '08'));

			// 08:00 is too early: the first time of that hour that can be
			expect(field()).toHaveValue('08:30');
			expect(option(MINUTES, '30')).toHaveAttribute(SELECTED, 'true');

			await userEvent.click(option(HOURS, '17'));

			// 17:30 is too late: the last one that can be
			expect(field()).toHaveValue('17:15');
			expect(onValueChange.mock.calls).toStrictEqual([
				['08:30'],
				['17:15'],
			]);
		});

		test('opens on the time it has, and moves through a column with the arrows', async () => {
			renderPicker({ defaultValue: '09:30' });

			await userEvent.click(opener());

			expect(option(HOURS, '09')).toHaveFocus();
			expect(option(MINUTES, '30')).toHaveAttribute(SELECTED, 'true');

			await userEvent.keyboard('{ArrowDown}{ArrowDown}');

			expect(option(HOURS, '11')).toHaveFocus();

			await userEvent.keyboard('{Enter}');

			expect(field()).toHaveValue('11:30');
		});

		test('is one Tab stop per column, and stops at the end of each', async () => {
			renderPicker({ defaultValue: '09:30' });

			await userEvent.click(opener());
			await userEvent.tab();

			expect(option(MINUTES, '30')).toHaveFocus();

			await userEvent.keyboard('{End}{ArrowDown}');

			expect(option(MINUTES, '55')).toHaveFocus();
		});

		test('takes another step for its minutes, and a minute typed that is between two', async () => {
			renderPicker({ defaultValue: '10:07', minuteStep: 15 });

			await userEvent.click(opener());

			expect(names(MINUTES)).toStrictEqual(['00', '15', '30', '45']);
			expect(
				within(list(MINUTES)).queryByRole('option', { selected: true }),
			).not.toBeInTheDocument();
		});

		test('does not offer what is out of its limits', async () => {
			renderPicker({ defaultValue: '08:30', max: '10:15', min: '08:20' });

			await userEvent.click(opener());

			expect(option(HOURS, '07')).toBeDisabled();
			expect(option(HOURS, '08')).toBeEnabled();
			expect(option(HOURS, '11')).toBeDisabled();
			// of the hour chosen: 08:15 is too early
			expect(option(MINUTES, '15')).toBeDisabled();
			expect(option(MINUTES, '20')).toBeEnabled();
		});
	});

	describe('as a list of times', () => {
		test('lists a time every interval and closes once one is picked', async () => {
			const onValueChange = renderPicker({
				interval: 60,
				picker: 'list',
			});

			await userEvent.click(opener());

			expect(names('Horarios')).toHaveLength(24);
			expect(names('Horarios').slice(8, 10)).toStrictEqual([
				'08:00',
				'09:00',
			]);

			await userEvent.click(option('Horarios', '09:00'));

			expect(field()).toHaveValue('09:00');
			expect(panel()).not.toBeInTheDocument();
			expect(onValueChange).toHaveBeenCalledExactlyOnceWith('09:00');
		});

		test('lists every half hour by default, within its limits', async () => {
			renderPicker({
				defaultValue: '09:30',
				max: '18:00',
				min: '08:00',
				picker: 'list',
			});

			await userEvent.click(opener());

			expect(names('Horarios')).toHaveLength(48);
			expect(option('Horarios', '09:30')).toHaveFocus();
			expect(option('Horarios', '07:30')).toBeDisabled();
			expect(option('Horarios', '18:00')).toBeEnabled();
			expect(option('Horarios', '18:30')).toBeDisabled();
		});
	});

	describe('as a clock', () => {
		const part = (name: string) => screen.getByRole('button', { name });

		test('shows the face of the hours first, and what is being chosen above it', async () => {
			renderPicker({ picker: 'clock' });

			await userEvent.click(opener());

			expect(names(HOURS)).toHaveLength(24);
			expect(part('Horas: 00')).toHaveAttribute('aria-pressed', 'true');
			expect(part('Minutos: 00')).toHaveAttribute(
				'aria-pressed',
				'false',
			);
			expect(option(HOURS, '00')).toHaveFocus();
		});

		test('moves on to the minutes once the hour is chosen, and closes after them', async () => {
			const onValueChange = renderPicker({ picker: 'clock' });

			await userEvent.click(opener());
			await userEvent.click(option(HOURS, '14'));

			expect(field()).toHaveValue('14:00');
			expect(part('Minutos: 00')).toHaveAttribute('aria-pressed', 'true');

			await userEvent.click(option(MINUTES, '35'));

			expect(field()).toHaveValue('14:35');
			expect(panel()).not.toBeInTheDocument();
			expect(onValueChange).toHaveBeenLastCalledWith('14:35');
		});

		test('keeps the hour chosen on the face within its limits', async () => {
			renderPicker({ min: '08:30', picker: 'clock' });

			await userEvent.click(opener());
			await userEvent.click(option(HOURS, '08'));

			expect(field()).toHaveValue('08:30');
			expect(part('Minutos: 30')).toHaveAttribute('aria-pressed', 'true');
		});

		test('goes around the face with the arrows and chooses with Enter', async () => {
			renderPicker({ defaultValue: '23:55', picker: 'clock' });

			await userEvent.click(opener());

			// past the last hour comes the first one
			await userEvent.keyboard('{ArrowRight}{ArrowDown}');

			expect(option(HOURS, '01')).toHaveFocus();

			await userEvent.keyboard('{Enter}');

			expect(field()).toHaveValue('01:55');
			expect(option(MINUTES, '55')).toHaveFocus();

			await userEvent.keyboard('{ArrowLeft} ');

			expect(field()).toHaveValue('01:50');
			expect(panel()).not.toBeInTheDocument();
		});

		test('follows a drag over the face, and takes the value it is let go on', async () => {
			renderPicker({ picker: 'clock' });

			await userEvent.click(opener());

			const face = list(HOURS);

			mockRect(face, { height: 200, left: 0, top: 0, width: 200 });
			// pressed at three o'clock on the outer ring, dragged down to six
			fireEvent.pointerDown(face, {
				button: 0,
				clientX: 190,
				clientY: 100,
			});

			expect(field()).toHaveValue('03:00');

			fireEvent.pointerMove(face, { clientX: 100, clientY: 190 });

			expect(field()).toHaveValue('06:00');

			// let go nearer the center: the inner ring, 18
			fireEvent.pointerUp(face, { clientX: 100, clientY: 150 });

			expect(field()).toHaveValue('18:00');

			const minutes = list(MINUTES);

			mockRect(minutes, { height: 200, left: 0, top: 0, width: 200 });
			fireEvent.pointerDown(minutes, {
				button: 0,
				clientX: 10,
				clientY: 100,
			});
			fireEvent.pointerUp(minutes, { clientX: 10, clientY: 100 });

			expect(field()).toHaveValue('18:45');
			expect(panel()).not.toBeInTheDocument();
		});

		test('ignores a move without a press, a press of another button and a cancelled drag', async () => {
			renderPicker({ picker: 'clock' });

			await userEvent.click(opener());

			const face = list(HOURS);

			mockRect(face, { height: 200, left: 0, top: 0, width: 200 });
			fireEvent.pointerMove(face, { clientX: 190, clientY: 100 });
			fireEvent.pointerDown(face, {
				button: 2,
				clientX: 190,
				clientY: 100,
			});
			fireEvent.pointerUp(face, { clientX: 190, clientY: 100 });

			expect(field()).toHaveValue('');

			fireEvent.pointerDown(face, {
				button: 0,
				clientX: 190,
				clientY: 100,
			});
			fireEvent.pointerCancel(face);
			fireEvent.pointerMove(face, { clientX: 100, clientY: 190 });

			// what the press showed stays; the cancelled drag chose nothing more
			expect(field()).toHaveValue('03:00');
			expect(list(HOURS)).toBeInTheDocument();
		});

		test('goes back to the hours from the numbers above the face', async () => {
			renderPicker({ defaultValue: '09:30', picker: 'clock' });

			await userEvent.click(opener());
			await userEvent.click(part('Minutos: 30'));

			expect(list(MINUTES)).toBeInTheDocument();
			expect(option(MINUTES, '30')).toHaveAttribute(SELECTED, 'true');

			await userEvent.click(part('Horas: 09'));

			expect(option(HOURS, '09')).toHaveAttribute(SELECTED, 'true');
		});

		test('marks every minute when its step is one, and leaves out what is out of its limits', async () => {
			renderPicker({
				defaultValue: '10:07',
				max: '10:30',
				min: '09:00',
				minuteStep: 1,
				picker: 'clock',
			});

			await userEvent.click(opener());

			expect(option(HOURS, '08')).toBeDisabled();

			// a disabled hour is not chosen
			await userEvent.click(option(HOURS, '11'));

			expect(field()).toHaveValue('10:07');

			await userEvent.click(
				screen.getByRole('button', { name: 'Minutos: 07' }),
			);

			expect(names(MINUTES)).toHaveLength(60);
			expect(option(MINUTES, '07')).toHaveAttribute(SELECTED, 'true');
			expect(option(MINUTES, '31')).toBeDisabled();
		});
	});

	test('sends nothing with its form while it is disabled', () => {
		render(
			<form aria-label='Datos'>
				<TimePicker
					aria-label='Hora'
					defaultValue='09:30'
					disabled
					name='time'
				/>
			</form>,
		);

		expect(
			new FormData(screen.getByRole<HTMLFormElement>('form')).has('time'),
		).toBe(false);
	});

	test('sends its value with the form it is given', () => {
		render(
			<>
				<form aria-label='Otro' id='other' />
				<TimePicker
					aria-label='Hora'
					defaultValue='09:30'
					form='other'
					name='time'
				/>
			</>,
		);

		expect(
			new FormData(screen.getByRole<HTMLFormElement>('form')).getAll(
				'time',
			),
		).toStrictEqual(['09:30']);
	});

	// A key does what it says: it takes away no digit it did not touch, and a zero goes
	// before an hour only when something was just typed or pasted
	describe('what a key does to a time', () => {
		test.each(
			[
				// the keys that leave the field with each text, from «09:30»
				{ keys: '{End}', text: '09:30' },
				{ keys: '{Backspace}', text: '09:3' },
			].flatMap(({ keys, text }) =>
				Array.from({ length: text.length + 1 }, (_, caret) => ({
					caret,
					keys,
					text,
				})),
			),
		)(
			'keeps «$text» whole when a colon or a dot is typed at $caret',
			async ({ caret, keys, text }) => {
				renderPicker({ defaultValue: '09:30' });
				await userEvent.type(field(), keys);

				for (const key of [':', '.']) {
					await userEvent.type(field(), key, {
						initialSelectionEnd: caret,
						initialSelectionStart: caret,
					});

					expect(field()).toHaveValue(text);
				}
			},
		);

		test.each(
			Array.from({ length: 6 }, (_, caret) => [
				{ caret, key: '{Backspace}', left: gone('09:30', caret - 1) },
				{ caret, key: '{Delete}', left: gone('09:30', caret) },
			]).flat(),
		)(
			'takes «$key» at $caret of «09:30» for one digit less, the rest as they come: «$left»',
			async ({ caret, key, left }) => {
				renderPicker({ defaultValue: '09:30' });

				await userEvent.type(field(), key, {
					initialSelectionEnd: caret,
					initialSelectionStart: caret,
				});

				expect(field()).toHaveValue(left);
			},
		);

		test('lets the hour be typed again once one of its digits is taken away', async () => {
			const onValueChange = renderPicker({ defaultValue: '09:30' });

			// «09|:30»: the 9 goes, an 8 comes
			await userEvent.type(field(), '{Backspace}8', {
				initialSelectionEnd: 2,
				initialSelectionStart: 2,
			});

			expect(field()).toHaveValue('08:30');
			expect(onValueChange).toHaveBeenLastCalledWith('08:30');
		});

		test('gives its zero to an hour of one digit typed over the one it had, or pasted', async () => {
			renderPicker({ defaultValue: '09:30' });

			// «[09]:30»
			await userEvent.type(field(), '8', {
				initialSelectionEnd: 2,
				initialSelectionStart: 0,
			});

			expect(field()).toHaveValue('08:30');

			await userEvent.clear(field());
			await userEvent.paste('7:15');

			expect(field()).toHaveValue('07:15');
		});
	});

	// a time has four digits: a full field takes no more, wherever it is typed, and
	// loses none of the ones it has
	describe('once it is full', () => {
		test.each([0, 1, 2, 3, 4, 5])(
			'takes no digit typed at %i, and keeps its time and its caret',
			async (caret) => {
				const onChange = vi.fn();
				const onValueChange = renderPicker({
					defaultValue: '09:30',
					onChange,
				});

				await userEvent.type(field(), '5', {
					initialSelectionEnd: caret,
					initialSelectionStart: caret,
				});

				expect(field()).toHaveValue('09:30');
				expect(field().selectionStart).toBe(caret);
				expect(onChange).not.toHaveBeenCalled();
				expect(onValueChange).not.toHaveBeenCalled();
			},
		);

		test('still lets a digit be typed over another, and takes nothing pasted that does not fit', async () => {
			const onValueChange = renderPicker({ defaultValue: '09:30' });

			// «09:[3]0»
			await userEvent.type(field(), '4', {
				initialSelectionEnd: 4,
				initialSelectionStart: 3,
			});

			expect(field()).toHaveValue('09:40');
			expect(onValueChange).toHaveBeenLastCalledWith('09:40');

			field().setSelectionRange(2, 2);
			await userEvent.paste('15');

			expect(field()).toHaveValue('09:40');
			expect(field().selectionStart).toBe(2);
		});

		test('takes nothing of digits pasted in an empty field that are more than a time has', async () => {
			const onValueChange = renderPicker();

			await userEvent.click(field());
			await userEvent.paste('14359');

			expect(field()).toHaveValue('');
			expect(onValueChange).not.toHaveBeenCalled();
		});
	});

	test('says its own message for one given as undefined, and its own label', async () => {
		renderPicker({
			labels: { open: undefined },
			messages: { min: undefined },
			min: '08:00',
		});

		await userEvent.type(field(), '0759');
		await leave();

		expect(
			screen.getByText('La hora no puede ser anterior a las 08:00'),
		).toBeVisible();
		expect(opener()).toBeVisible();
	});
});
