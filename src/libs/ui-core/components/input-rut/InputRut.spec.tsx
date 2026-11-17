import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { afterEach, describe, expect, test, vi } from 'vitest';
import { inChile } from '../../__mocks__/locale.mock.ts';
import { Field } from '../field/Field.tsx';
import { FilterBar } from '../filter-bar/FilterBar.tsx';
import { InputRut } from './InputRut.tsx';

inChile();

const Controlled = ({ initial = '' }: { initial?: string }) => {
	const [rut, setRut] = useState(initial);

	return (
		<>
			<InputRut aria-label='RUT' onValueChange={setRut} value={rut} />
			<output>{rut}</output>
			<button onClick={() => setRut('11111111-1')} type='button'>
				otro
			</button>
			<button onClick={() => setRut('')} type='button'>
				limpiar
			</button>
		</>
	);
};

type Applied = Record<string, FormDataEntryValue>[];

/** A valid RUT as its form sends it: what the filters below are applied with. */
const SENT = '11111111-1';

const Filters = ({ applied }: { applied: Applied }) => {
	const [rut, setRut] = useState<string>();

	return (
		<>
			<FilterBar
				aria-label='Filtros'
				autoSubmit
				delay={300}
				onSubmit={(data) => applied.push(Object.fromEntries(data))}
			>
				<InputRut aria-label='RUT' name='rut' value={rut} />
				<button type='reset'>Limpiar</button>
			</FilterBar>
			<button onClick={() => setRut(SENT)} type='button'>
				otro
			</button>
		</>
	);
};

describe(InputRut, () => {
	// hooks
	afterEach(() => {
		cleanup();
		vi.useRealTimers();
	});

	// tests
	test('formats the RUT while it is typed and tells its normalized value', async () => {
		const onValueChange = vi.fn();

		render(<InputRut aria-label='RUT' onValueChange={onValueChange} />);

		const input = screen.getByRole('textbox', { name: 'RUT' });

		await userEvent.type(input, '123456785');

		expect(input).toHaveValue('12.345.678-5');
		expect(onValueChange).toHaveBeenLastCalledWith('12345678-5', 'valid');
		expect(onValueChange).toHaveBeenCalledWith('', 'incomplete');
	});

	test('never refuses a paste: it keeps what is a RUT', async () => {
		render(<InputRut aria-label='RUT' />);

		const input = screen.getByRole('textbox', { name: 'RUT' });

		await userEvent.click(input);
		await userEvent.paste('RUT: 20.347.878-k');

		expect(input).toHaveValue('20.347.878-K');
	});

	test('keeps the caret where the person is typing', async () => {
		render(<InputRut aria-label='RUT' defaultValue='12345678-5' />);

		const input = screen.getByRole<HTMLInputElement>('textbox', {
			name: 'RUT',
		});

		// after "12.3": delete the 3, type a 9
		await userEvent.type(input, '{Backspace}9', {
			initialSelectionEnd: 4,
			initialSelectionStart: 4,
		});

		expect(input).toHaveValue('12.945.678-5');
		expect(input.selectionStart).toBe(4);
	});

	test('waits for the blur to say what is wrong, and ties it to the field', async () => {
		render(
			<Field label='RUT'>
				<InputRut />
			</Field>,
		);

		const input = screen.getByRole('textbox', { name: 'RUT' });

		await userEvent.type(input, '12345');

		expect(input).toBeValid();

		await userEvent.tab();

		expect(input).toBeInvalid();
		expect(input).toHaveAccessibleDescription(
			'Escriba el RUT completo, con su dígito verificador',
		);
	});

	test('lets a message on screen follow the value until it is right', async () => {
		render(<InputRut aria-label='RUT' />);

		const input = screen.getByRole('textbox', { name: 'RUT' });

		await userEvent.type(input, '123456789');
		await userEvent.tab();

		expect(screen.getByText('RUT no válido')).toBeInTheDocument();

		await userEvent.type(input, '{Backspace}{Backspace}');

		expect(
			screen.getByText(
				'Escriba el RUT completo, con su dígito verificador',
			),
		).toBeInTheDocument();

		await userEvent.type(input, '85');

		expect(input).toBeValid();
		expect(screen.queryByText(/RUT/u)).not.toBeInTheDocument();
	});

	test('does not complain about an empty or a valid RUT on blur', async () => {
		const onBlur = vi.fn();

		render(<InputRut aria-label='RUT' onBlur={onBlur} />);

		const input = screen.getByRole('textbox', { name: 'RUT' });

		await userEvent.click(input);
		await userEvent.tab();
		await userEvent.type(input, '111111111');
		await userEvent.tab();

		expect(input).toBeValid();
		expect(input).not.toHaveAttribute('aria-describedby');
		expect(onBlur).toHaveBeenCalledTimes(2);
	});

	test('says the messages given', async () => {
		render(
			<InputRut
				aria-label='RUT'
				messages={{ invalid: 'Revise el dígito verificador' }}
			/>,
		);

		await userEvent.type(screen.getByRole('textbox'), '123456789');
		await userEvent.tab();

		expect(
			screen.getByText('Revise el dígito verificador'),
		).toBeInTheDocument();
	});

	test('sends the normalized RUT with its form, and nothing while it is not valid', async () => {
		render(
			<form aria-label='Datos'>
				<InputRut aria-label='RUT' name='rut' />
			</form>,
		);

		const form = screen.getByRole<HTMLFormElement>('form');

		await userEvent.type(screen.getByRole('textbox'), '12345');

		expect(new FormData(form).get('rut')).toBe('');

		await userEvent.type(screen.getByRole('textbox'), '6785');

		expect(new FormData(form).get('rut')).toBe('12345678-5');
	});

	test('goes back to its first RUT when its form is reset', async () => {
		const onValueChange = vi.fn();

		render(
			<form>
				<InputRut aria-label='RUT' onValueChange={onValueChange} />
				<button type='reset'>Limpiar</button>
			</form>,
		);

		await userEvent.type(screen.getByRole('textbox'), '123456785');
		await userEvent.click(screen.getByRole('button', { name: 'Limpiar' }));

		expect(screen.getByRole('textbox')).toHaveValue('');
		expect(onValueChange).toHaveBeenLastCalledWith('', 'empty');
	});

	describe('controlled', () => {
		test('shows the value given and reports what is typed', async () => {
			render(<Controlled initial='12345678-5' />);

			const input = screen.getByRole('textbox', { name: 'RUT' });

			expect(input).toHaveValue('12.345.678-5');

			await userEvent.type(input, '{Backspace}');

			// not valid any more: the value is empty, the text stays
			expect(screen.getByRole('status')).toBeEmptyDOMElement();
			expect(input).toHaveValue('1.234.567-8');
		});

		test('takes a new value from outside, and an empty one clears it', async () => {
			render(<Controlled />);

			const input = screen.getByRole('textbox', { name: 'RUT' });

			await userEvent.click(screen.getByRole('button', { name: 'otro' }));

			expect(input).toHaveValue('11.111.111-1');

			await userEvent.click(
				screen.getByRole('button', { name: 'limpiar' }),
			);

			expect(input).toHaveValue('');
		});
	});

	describe('in a FilterBar that applies by itself', () => {
		test('applies its RUT once it is typed whole, and not while it is not one', async () => {
			vi.useFakeTimers({ shouldAdvanceTime: true });

			const applied: Applied = [];

			render(<Filters applied={applied} />);
			await userEvent.type(screen.getByRole('textbox'), '11111111');
			await vi.advanceTimersByTimeAsync(300);

			expect(applied).toHaveLength(0);

			await userEvent.type(screen.getByRole('textbox'), '1');
			await vi.advanceTimersByTimeAsync(300);

			expect(applied).toStrictEqual([{ rut: SENT }]);
		});

		test('applies again once its RUT is cleared with the reset button', async () => {
			vi.useFakeTimers({ shouldAdvanceTime: true });

			const applied: Applied = [];

			render(<Filters applied={applied} />);
			await userEvent.type(screen.getByRole('textbox'), '111111111');
			await vi.advanceTimersByTimeAsync(300);
			await userEvent.click(
				screen.getByRole('button', { name: 'Limpiar' }),
			);
			await vi.advanceTimersByTimeAsync(300);

			expect(applied).toStrictEqual([{ rut: SENT }, { rut: '' }]);
		});

		test('applies a RUT that is given from outside, as every field with a hidden input does', async () => {
			vi.useFakeTimers({ shouldAdvanceTime: true });

			const applied: Applied = [];

			render(<Filters applied={applied} />);
			await userEvent.click(screen.getByRole('button', { name: 'otro' }));
			await vi.advanceTimersByTimeAsync(300);

			expect(applied).toStrictEqual([{ rut: SENT }]);
		});
	});

	test('sends nothing with its form while it is disabled', () => {
		render(
			<form aria-label='Datos'>
				<InputRut
					aria-label='RUT'
					defaultValue='12345678-5'
					disabled
					name='rut'
				/>
			</form>,
		);

		expect(
			new FormData(screen.getByRole<HTMLFormElement>('form')).has('rut'),
		).toBe(false);
	});

	test('sends its value with the form it is given', () => {
		render(
			<>
				<form aria-label='Otro' id='other' />
				<InputRut
					aria-label='RUT'
					defaultValue='12345678-5'
					form='other'
					name='rut'
				/>
			</>,
		);

		expect(
			new FormData(screen.getByRole<HTMLFormElement>('form')).getAll(
				'rut',
			),
		).toStrictEqual(['12345678-5']);
	});

	// a RUT has nine characters, the last one its check digit: a full field takes no
	// more, wherever it is typed, and its check digit is not pushed out
	describe('once it is full', () => {
		const RUT = '12.345.678-5';
		const rut = () => screen.getByRole<HTMLInputElement>('textbox');
		const renderFull = () => {
			const onChange = vi.fn();
			const onValueChange = vi.fn();

			render(
				<InputRut
					aria-label='RUT'
					defaultValue='12345678-5'
					onChange={onChange}
					onValueChange={onValueChange}
				/>,
			);

			return { onChange, onValueChange };
		};

		test.each(Array.from({ length: RUT.length + 1 }, (_, caret) => caret))(
			'takes no digit typed at %i, and keeps its RUT and its caret',
			async (caret) => {
				const { onChange, onValueChange } = renderFull();

				await userEvent.type(rut(), '9', {
					initialSelectionEnd: caret,
					initialSelectionStart: caret,
				});

				expect(rut()).toHaveValue(RUT);
				expect(rut().selectionStart).toBe(caret);
				expect(onChange).not.toHaveBeenCalled();
				expect(onValueChange).not.toHaveBeenCalled();
			},
		);

		test('takes no K after its check digit, and drops one typed before it', async () => {
			renderFull();

			await userEvent.type(rut(), 'k');

			expect(rut()).toHaveValue(RUT);

			await userEvent.type(rut(), 'k', {
				initialSelectionEnd: 4,
				initialSelectionStart: 4,
			});

			expect(rut()).toHaveValue(RUT);
		});

		test('still lets a character be typed over another, or taken away', async () => {
			const { onValueChange } = renderFull();

			// «[1]2.345.678-5»
			await userEvent.type(rut(), '2', {
				initialSelectionEnd: 1,
				initialSelectionStart: 0,
			});

			expect(rut()).toHaveValue('22.345.678-5');
			expect(onValueChange).toHaveBeenLastCalledWith('', 'invalid');

			await userEvent.type(rut(), '{Backspace}');

			expect(rut()).toHaveValue('2.234.567-8');
		});
	});

	test('takes nothing of a text pasted with more characters than a RUT has', async () => {
		const onValueChange = vi.fn();

		render(<InputRut aria-label='RUT' onValueChange={onValueChange} />);

		await userEvent.click(screen.getByRole('textbox'));
		await userEvent.paste('1234567890123');

		expect(screen.getByRole('textbox')).toHaveValue('');
		expect(onValueChange).not.toHaveBeenCalled();

		// the zeros before a RUT are no characters of it
		await userEvent.paste('0012.345.678-5');

		expect(screen.getByRole('textbox')).toHaveValue('12.345.678-5');
		expect(onValueChange).toHaveBeenLastCalledWith('12345678-5', 'valid');
	});

	test('says its own message for one given as undefined', async () => {
		render(<InputRut aria-label='RUT' messages={{ invalid: undefined }} />);

		await userEvent.type(screen.getByRole('textbox'), '123456789');
		await userEvent.tab();

		expect(screen.getByText('RUT no válido')).toBeInTheDocument();
		expect(screen.getByRole('textbox')).toBeInvalid();
	});
});
