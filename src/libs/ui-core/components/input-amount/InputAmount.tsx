import {
	type ChangeEvent,
	type ComponentProps,
	type CSSProperties,
	type FocusEvent,
	useId,
	useRef,
	useState,
} from 'react';
import {
	amountShape,
	formatAmount,
	isAmountText,
	maskAmount,
	parseAmount,
} from '../../format/amount.ts';
import { useLocale } from '../../format/locale.hook.ts';
import { type UiTexts } from '../../i18n/en.ts';
import { useTexts } from '../../i18n/texts.hook.ts';
import { cx } from '../../internal/cx.ts';
import { defined } from '../../internal/defined.ts';
import { useFieldControl } from '../../internal/field/use-field-control.hook.ts';
import { HiddenInput } from '../../internal/hidden-input/HiddenInput.tsx';
import { insertedRange } from '../../internal/inserted-range.ts';
import { mergeRefs } from '../../internal/merge-refs.ts';
import { undoChange } from '../../internal/undo-change.ts';
import { useFormReset } from '../../internal/use-form-reset.hook.ts';
import { useMaskedCaret } from '../../internal/use-masked-caret.hook.ts';
import control from '../../internal/control/control.module.css';
import styles from './InputAmount.module.css';

/** Which limit an amount is out of, if any. */
const limitBroken = (
	amount: number | null,
	min: number | undefined,
	max: number | undefined,
) => {
	if (amount === null) return;
	if (min !== undefined && amount < min) return 'min';
	if (max !== undefined && amount > max) return 'max';
};

/** The currency and the locale an amount is written in. */
interface Money {
	currency: string;
	locale: string;
}

const isSameMoney = (one: Money, other: Money) =>
	one.currency === other.currency && one.locale === other.locale;

/** What a field says of an amount out of a limit: the limit, written with its currency. */
const limitMessage = (
	broken: 'max' | 'min' | undefined,
	texts: UiTexts['amountMessages'],
	limits: { max?: number; min?: number },
	{ currency, locale }: Money,
) => broken && texts[broken](formatAmount(limits[broken], currency, locale));

/**
 * An amount of money, written as the locale writes one: its thousands get their
 * separators while it is typed (`1,250,000`), it takes as many decimals as its
 * currency has (two for US dollars, none for Chilean pesos) and anything else is
 * left out. Its form gets the clean number (`1250000.5`) under `name`; a disabled
 * one sends none. `onValueChange` gives the number, or `null` while it is empty.
 * With `min` or `max` it says so, once the field is left, when the amount is out
 * of them.
 *
 * `currency` is the one of the app (`UiProvider`) unless it is given. Inside a
 * Field it takes its label, hint and error.
 *
 * @example
 * ```tsx
 * <Field label='Monthly income'>
 *   <InputAmount name='income' value={income} onValueChange={setIncome} min={1} />
 * </Field>
 *
 * <InputAmount aria-label='Price' currency='CLP' />
 * ```
 *
 * @returns amount input
 */
export const InputAmount = ({
	className,
	currency: givenCurrency,
	defaultValue,
	max,
	messages,
	min,
	name,
	onBlur,
	onChange,
	onValueChange,
	ref,
	size = 'md',
	value,
	...props
}: InputAmountProps) => {
	const messageId = useId();
	const app = useLocale();
	const money = {
		currency: givenCurrency ?? app.currency,
		locale: app.locale,
	};
	const shape = amountShape(money.currency, money.locale);
	const texts = { ...useTexts().amountMessages, ...defined(messages) };
	// `null` is an amount that was given, the empty one: only without a `value` does
	// the field start with its `defaultValue`
	const [text, setText] = useState(() =>
		maskAmount(value === undefined ? defaultValue : value, money),
	);
	const [lastValue, setLastValue] = useState(value);
	const [written, setWritten] = useState(money);
	const [isChecked, setIsChecked] = useState(false);
	const input = useRef<HTMLInputElement>(null);
	// the caret after the same number of digits it had before the separators moved
	const keepCaret = useMaskedCaret(
		input,
		text,
		(character) => /\d/u.test(character) || character === shape.decimal,
	);
	// what the text says, read as it was written
	const amount = parseAmount(text, written);

	// another language or currency writes the same amount another way
	if (!isSameMoney(written, money)) {
		setWritten(money);
		setText(maskAmount(amount, money));
	}

	// a new value from outside replaces what was typed, unless it is the same amount
	if (value !== lastValue) {
		setLastValue(value);

		if (value !== undefined && amount !== value)
			setText(maskAmount(value, money));
	}

	const broken = limitBroken(amount, min, max);

	// a reset form puts the field back to its first amount
	useFormReset(input, () => {
		const first = maskAmount(defaultValue, money);

		setText(first);
		setIsChecked(false);

		if (first !== text) onValueChange?.(parseAmount(first, money));
	});

	const message = isChecked
		? limitMessage(broken, texts, { max, min }, money)
		: undefined;
	const field = useFieldControl({
		...props,
		'aria-invalid': message ? true : props['aria-invalid'],
		'aria-describedby':
			[props['aria-describedby'], message && messageId]
				.filter(Boolean)
				.join(' ') || undefined,
	});

	const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
		const { selectionEnd, selectionStart, value: typed } = event.target;
		// what is read into is what was just typed or pasted, never the digits the
		// field already had: no key takes away a digit it did not touch
		const typedAs = {
			...money,
			inserted: insertedRange(text, typed, selectionEnd),
		};

		// a full field takes no more: the key or the paste is refused whole, and the text
		// stays as it was, rather than cut to make room
		if (!isAmountText(typed, typedAs)) {
			undoChange(event.target, text);

			return;
		}

		const masked = maskAmount(typed, typedAs);
		const next = parseAmount(masked, money);

		keepCaret(typed, selectionStart);
		setText(masked);

		// a message on screen follows the amount; once gone, the next one waits for the blur
		if (!limitBroken(next, min, max)) setIsChecked(false);

		onChange?.(event);
		onValueChange?.(next);
	};

	const handleBlur = (event: FocusEvent<HTMLInputElement>) => {
		setIsChecked(broken !== undefined);
		onBlur?.(event);
	};

	return (
		<>
			<span
				className={cx(styles.root, className)}
				style={
					{ '--ui-amount-sign': shape.symbol.length } as CSSProperties
				}
			>
				<span aria-hidden className={styles.prefix}>
					{shape.symbol}
				</span>
				<input
					autoComplete='off'
					inputMode={shape.fraction > 0 ? 'decimal' : 'numeric'}
					placeholder='0'
					type='text'
					{...field}
					className={cx(control.control, control[size], styles.input)}
					onBlur={handleBlur}
					onChange={handleChange}
					ref={mergeRefs(input, ref)}
					value={text}
				/>
			</span>
			{name && (
				<HiddenInput
					disabled={props.disabled}
					form={props.form}
					name={name}
					value={amount === null ? '' : String(amount)}
				/>
			)}
			<span aria-live='polite' className={control.error} id={messageId}>
				{message}
			</span>
		</>
	);
};

export interface InputAmountProps extends Omit<
	ComponentProps<'input'>,
	'defaultValue' | 'max' | 'min' | 'size' | 'type' | 'value'
> {
	/** The currency of the amount, as ISO 4217 (`USD`, `CLP`). Default: the one of the app. */
	currency?: string;
	/** The amount it starts with, and goes back to when its form is reset. */
	defaultValue?: number;
	/** The largest amount accepted. */
	max?: number;
	/** What it says of an amount out of its limits; each takes the limit, written. */
	messages?: Partial<UiTexts['amountMessages']>;
	/** The smallest amount accepted. */
	min?: number;
	/** The name the clean number is sent with. */
	name?: string;
	size?: 'lg' | 'md' | 'sm';
	/** The amount; `null` for none. Makes it controlled. */
	value?: number | null;
	/** The amount typed, or `null` when the field is empty. */
	onValueChange?: (value: number | null) => void;
}
