import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef } from 'react';
import { afterEach, describe, expect, test, vi } from 'vitest';
import { inChile } from '../../__mocks__/locale.mock.ts';
import { Field } from '../field/Field.tsx';
import { InputAmount, type InputAmountProps } from './InputAmount.tsx';

inChile();

const renderAmount = (props: Partial<InputAmountProps> = {}) => {
	const onValueChange = vi.fn();

	render(
		<InputAmount
			aria-label='Monto'
			onValueChange={onValueChange}
			{...props}
		/>,
	);

	return onValueChange;
};

const input = () =>
	screen.getByRole<HTMLInputElement>('textbox', { name: 'Monto' });

/** An amount of fifteen digits, as many as the field holds, and how it shows it. */
const FULL = 123_456_789_012_345;
const FULL_TEXT = '123.456.789.012.345';

/** The number a text of digits and dots stands for. */
const digitsOf = (text: string) => Number(text.replaceAll('.', ''));

/** A text with `count` characters from `index` replaced by `put`, as a key leaves it. */
const at = (text: string, index: number, count: number, put = '') =>
	index < 0
		? text
		: `${text.slice(0, index)}${put}${text.slice(index + count)}`;

/** The digits of a text as the field must show them, worked out apart from the kit. */
const dotted = (text: string) => {
	const digits = text.replaceAll(/\D/gu, '');

	return digits === ''
		? ''
		: new Intl.NumberFormat('es-CL').format(Number(digits));
};

describe(InputAmount, () => {
	// hooks
	afterEach(cleanup);

	// tests
	test('is a text field for digits, empty at first', () => {
		const ref = createRef<HTMLInputElement>();

		renderAmount({ className: 'extra', ref, size: 'sm' });

		expect(input()).toHaveValue('');
		expect(input()).toHaveAttribute('inputmode', 'numeric');
		expect(input()).toBeValid();
		expect(ref.current).toBe(input());
	});

	test('separates the thousands while it is typed in, and tells the number', async () => {
		const onValueChange = renderAmount();

		await userEvent.type(input(), '1250000');

		expect(input()).toHaveValue('1.250.000');
		expect(onValueChange).toHaveBeenLastCalledWith(1_250_000);
		expect(onValueChange).toHaveBeenCalledTimes(7);
	});

	test('leaves out what is not a digit, and tells null once it is empty', async () => {
		const onValueChange = renderAmount();

		await userEvent.type(input(), '$ 9a8,0');

		expect(input()).toHaveValue('980');

		await userEvent.clear(input());

		expect(onValueChange).toHaveBeenLastCalledWith(null);
	});

	test('keeps the caret where the person is typing when the dots move', async () => {
		renderAmount({ defaultValue: 12_345 });

		// «12.345»: a digit typed after the 1 leaves the caret after it, not at the end
		input().setSelectionRange(1, 1);
		await userEvent.type(input(), '9', {
			initialSelectionEnd: 1,
			initialSelectionStart: 1,
		});

		expect(input()).toHaveValue('192.345');
		expect(input().selectionStart).toBe(2);
	});

	test('takes what is typed over the event of the input too', async () => {
		const onChange = vi.fn();
		const onBlur = vi.fn();

		renderAmount({ onBlur, onChange });

		await userEvent.type(input(), '5');
		await userEvent.tab();

		expect(onChange).toHaveBeenCalledOnce();
		expect(onBlur).toHaveBeenCalledOnce();
	});

	test.each([
		{
			limits: { min: 1000 },
			says: 'El monto mínimo es $1.000',
			typed: '999',
		},
		{
			limits: { max: 5_000_000 },
			says: 'El monto máximo es $5.000.000',
			typed: '5000001',
		},
	])(
		'says «$says» once the field is left, and until the amount is right',
		async ({ limits, says, typed }) => {
			renderAmount(limits);

			await userEvent.type(input(), typed);

			// not while it is still being typed
			expect(input()).toBeValid();

			await userEvent.tab();

			expect(input()).toBeInvalid();
			expect(input()).toHaveAccessibleDescription(says);

			await userEvent.clear(input());
			await userEvent.type(input(), '2000');

			expect(input()).toBeValid();
			expect(screen.queryByText(says)).not.toBeInTheDocument();
		},
	);

	test('accepts an amount within its limits, and an empty field', async () => {
		renderAmount({
			max: 5000,
			messages: { min: (limit) => `Desde ${limit}` },
			min: 1000,
		});

		await userEvent.type(input(), '5000');
		await userEvent.tab();

		expect(input()).toBeValid();

		await userEvent.clear(input());
		await userEvent.type(input(), '5');
		await userEvent.tab();

		expect(input()).toHaveAccessibleDescription('Desde $1.000');

		await userEvent.clear(input());
		await userEvent.tab();

		expect(input()).toBeValid();
	});

	test('shows the amount it is given, and follows it when it changes', () => {
		const { rerender } = render(
			<InputAmount aria-label='Monto' value={1500} />,
		);

		expect(input()).toHaveValue('1.500');

		rerender(<InputAmount aria-label='Monto' value={980_000} />);

		expect(input()).toHaveValue('980.000');

		rerender(<InputAmount aria-label='Monto' value={null} />);

		expect(input()).toHaveValue('');
	});

	test('is empty when the amount it is given is none, whatever its first one', () => {
		render(
			<form aria-label='Datos'>
				<InputAmount
					aria-label='Monto'
					defaultValue={45_000}
					name='income'
					value={null}
				/>
			</form>,
		);

		expect(input()).toHaveValue('');
		expect(
			new FormData(screen.getByRole<HTMLFormElement>('form')).get(
				'income',
			),
		).toBe('');
	});

	test('takes a pasted amount without its decimals, not a hundred times larger', async () => {
		const onValueChange = vi.fn();

		render(
			<form aria-label='Datos'>
				<InputAmount
					aria-label='Monto'
					name='income'
					onValueChange={onValueChange}
				/>
			</form>,
		);

		await userEvent.click(input());
		await userEvent.paste('1.250.000,00');

		expect(input()).toHaveValue('1.250.000');
		expect(onValueChange).toHaveBeenLastCalledWith(1_250_000);
		expect(
			new FormData(screen.getByRole<HTMLFormElement>('form')).get(
				'income',
			),
		).toBe('1250000');
	});

	test.each(['1250000.50', '1,250,000.00', '$ 1250000.5 USD'])(
		'takes «%s», pasted as English writes it, without its decimals',
		async (pasted) => {
			const onValueChange = renderAmount();

			await userEvent.click(input());
			await userEvent.paste(pasted);

			expect(input()).toHaveValue('1.250.000');
			expect(onValueChange).toHaveBeenLastCalledWith(1_250_000);
		},
	);

	test('takes what is pasted over the whole of an amount without its decimals', async () => {
		const onValueChange = renderAmount({ defaultValue: 1_250_000 });

		// it starts with the same digit as the amount it replaces
		input().focus();
		input().select();
		await userEvent.paste('12.50');

		expect(input()).toHaveValue('12');
		expect(onValueChange).toHaveBeenLastCalledWith(12);
	});

	// A key at every place of an amount with no dot, of one with dots, and of a long one.
	// Whatever the field reads as decimals is of what was just put in: no key takes away
	// a digit it did not touch
	test.each(
		[
			{ amount: 980, text: '980' },
			{ amount: 12_345, text: '12.345' },
			{ amount: 1_250_000, text: '1.250.000' },
		].flatMap(({ amount, text }) =>
			Array.from({ length: text.length + 1 }, (_, caret) => ({
				amount,
				caret,
				text,
			})),
		),
	)(
		'keeps «$text» whole when a comma or a dot is typed at $caret',
		async ({ amount, caret, text }) => {
			const onValueChange = renderAmount({ defaultValue: amount });

			for (const key of [',', '.']) {
				await userEvent.type(input(), key, {
					initialSelectionEnd: caret,
					initialSelectionStart: caret,
				});

				expect(input()).toHaveValue(text);
				expect(onValueChange).toHaveBeenLastCalledWith(amount);
			}
		},
	);

	test.each(
		['980', '12.345', '1.250.000'].flatMap((text) =>
			Array.from({ length: text.length + 1 }, (_, caret) => [
				{ caret, key: '7', text, typed: at(text, caret, 0, '7') },
				{
					caret,
					key: '{Backspace}',
					text,
					typed: at(text, caret - 1, 1),
				},
				{ caret, key: '{Delete}', text, typed: at(text, caret, 1) },
			]).flat(),
		),
	)(
		'takes «$key» at $caret of «$text» for one digit more or less, no other gone',
		async ({ caret, key, text, typed }) => {
			renderAmount({ defaultValue: digitsOf(text) });

			await userEvent.type(input(), key, {
				initialSelectionEnd: caret,
				initialSelectionStart: caret,
			});

			expect(input()).toHaveValue(dotted(typed));
		},
	);

	test('takes what is pasted in the middle of an amount without its decimals, the rest kept', async () => {
		const onValueChange = renderAmount({ defaultValue: 980 });

		// «9|80»
		input().focus();
		input().setSelectionRange(1, 1);
		await userEvent.paste('5,5');

		expect(input()).toHaveValue('9.580');
		expect(onValueChange).toHaveBeenLastCalledWith(9580);
	});

	test.each([1_234_567_890_123_456, 1e21])(
		'shows and sends no amount for %d, a number with more digits than it holds',
		(value) => {
			render(
				<form aria-label='Datos'>
					<InputAmount
						aria-label='Monto'
						name='income'
						value={value}
					/>
				</form>,
			);

			expect(input()).toHaveValue('');
			expect(
				new FormData(screen.getByRole<HTMLFormElement>('form')).get(
					'income',
				),
			).toBe('');
		},
	);

	test('sends the clean number with its form, and goes back to its first one on a reset', async () => {
		const onValueChange = vi.fn();

		render(
			<form aria-label='Datos'>
				<InputAmount
					aria-label='Monto'
					defaultValue={45_000}
					name='income'
					onValueChange={onValueChange}
				/>
				<button type='reset'>Restablecer</button>
			</form>,
		);

		const sent = () =>
			new FormData(screen.getByRole<HTMLFormElement>('form')).get(
				'income',
			);

		expect(sent()).toBe('45000');

		await userEvent.type(input(), '0');

		expect(sent()).toBe('450000');

		await userEvent.click(
			screen.getByRole('button', { name: 'Restablecer' }),
		);

		expect(input()).toHaveValue('45.000');
		expect(sent()).toBe('45000');
		expect(onValueChange).toHaveBeenLastCalledWith(45_000);
	});

	test('takes its label, hint and error from its Field, with its own message', async () => {
		render(
			<Field hint='Antes de impuestos' label='Monto'>
				<InputAmount min={10} />
			</Field>,
		);

		await userEvent.type(input(), '5');
		await userEvent.tab();

		expect(input()).toHaveAccessibleDescription(
			'El monto mínimo es $10 Antes de impuestos',
		);
	});

	// fifteen digits is as many as an amount has: a full field takes no more, wherever it
	// is typed or pasted, and loses none of the digits it has
	test.each([0, 1, 7, 19])(
		'takes no digit typed at %i of a full field, and keeps the ones it has and its caret',
		async (caret) => {
			const onChange = vi.fn();
			const onValueChange = renderAmount({
				defaultValue: FULL,
				onChange,
			});

			await userEvent.type(input(), '7', {
				initialSelectionEnd: caret,
				initialSelectionStart: caret,
			});

			expect(input()).toHaveValue(FULL_TEXT);
			expect(input().selectionStart).toBe(caret);
			expect(onChange).not.toHaveBeenCalled();
			expect(onValueChange).not.toHaveBeenCalled();
		},
	);

	test('still lets a digit of a full field be replaced or taken away', async () => {
		const onValueChange = renderAmount({ defaultValue: FULL });

		// «1|2|3.456…»: the 2 selected and typed over
		await userEvent.type(input(), '9', {
			initialSelectionEnd: 2,
			initialSelectionStart: 1,
		});

		expect(input()).toHaveValue('193.456.789.012.345');

		await userEvent.type(input(), '{Backspace}');

		expect(input()).toHaveValue('19.345.678.901.234');
		expect(onValueChange).toHaveBeenLastCalledWith(19_345_678_901_234);
	});

	test.each(['1234567890123456', '12345678901234567890'])(
		'takes nothing of «%s» pasted, more digits than an amount has',
		async (pasted) => {
			const onValueChange = renderAmount();

			await userEvent.click(input());
			await userEvent.paste(pasted);

			expect(input()).toHaveValue('');
			expect(onValueChange).not.toHaveBeenCalled();
		},
	);

	test('keeps its amount when what is pasted in it would leave more digits than it holds', async () => {
		const onValueChange = renderAmount({ defaultValue: 1_250_000 });

		input().focus();
		input().setSelectionRange(1, 1);
		await userEvent.paste('123456789');

		expect(input()).toHaveValue('1.250.000');
		expect(onValueChange).not.toHaveBeenCalled();

		// as many as fit are taken
		input().setSelectionRange(1, 1);
		await userEvent.paste('12345678');

		expect(input()).toHaveValue('112.345.678.250.000');
	});

	test('sends nothing with its form while it is disabled', () => {
		render(
			<form aria-label='Datos'>
				<InputAmount
					aria-label='Monto'
					defaultValue={45_000}
					disabled
					name='income'
				/>
			</form>,
		);

		expect(
			new FormData(screen.getByRole<HTMLFormElement>('form')).has(
				'income',
			),
		).toBe(false);
	});

	test('sends its value with the form it is given', () => {
		render(
			<>
				<form aria-label='Otro' id='other' />
				<InputAmount
					aria-label='Monto'
					defaultValue={45_000}
					form='other'
					name='income'
				/>
			</>,
		);

		expect(
			new FormData(screen.getByRole<HTMLFormElement>('form')).getAll(
				'income',
			),
		).toStrictEqual(['45000']);
	});

	test.each([
		{
			limits: { messages: { min: undefined }, min: 1000 },
			says: 'El monto mínimo es $1.000',
			typed: '999',
		},
		{
			limits: { max: 5000, messages: { max: undefined } },
			says: 'El monto máximo es $5.000',
			typed: '5001',
		},
	])(
		'says «$says» when the message of that limit is given as undefined',
		async ({ limits, says, typed }) => {
			renderAmount(limits);

			await userEvent.type(input(), typed);
			await userEvent.tab();

			expect(input()).toBeInvalid();
			expect(input()).toHaveAccessibleDescription(says);
		},
	);
});
