import {
	type ChangeEvent,
	type ClipboardEvent,
	type ComponentProps,
	type FocusEvent,
	type KeyboardEvent,
	useId,
	useRef,
	useState,
} from 'react';
import {
	clampIsoDate,
	DATE_DIGITS,
	datePattern,
	displayIsoDate,
	maskPastedDate,
	maskTypedDate,
	parseTypedDate,
	todayIso,
} from '../../format/iso-date.ts';
import { useLocale } from '../../format/locale.hook.ts';
import { type UiTexts } from '../../i18n/en.ts';
import { useTexts } from '../../i18n/texts.hook.ts';
import { Icon } from '../../icon/Icon.tsx';
import { cx } from '../../internal/cx.ts';
import { defined } from '../../internal/defined.ts';
import { useFieldControl } from '../../internal/field/use-field-control.hook.ts';
import { HiddenInput } from '../../internal/hidden-input/HiddenInput.tsx';
import { mergeRefs } from '../../internal/merge-refs.ts';
import { Popup } from '../../internal/popup/Popup.tsx';
import { undoChange } from '../../internal/undo-change.ts';
import { useFormReset } from '../../internal/use-form-reset.hook.ts';
import { useMaskedCaret } from '../../internal/use-masked-caret.hook.ts';
import { useOutsidePress } from '../../internal/use-outside-press.hook.ts';
import { writeInput } from '../../internal/write-input.ts';
import { Button } from '../button/Button.tsx';
import { Calendar } from '../calendar/Calendar.tsx';
import { VisuallyHidden } from '../visually-hidden/VisuallyHidden.tsx';
import control from '../../internal/control/control.module.css';
import styles from './DatePicker.module.css';

type DateProblem = keyof UiTexts['dateMessages'];

const isDigit = (character: string) => /\d/u.test(character);

const NOT_DIGITS = /\D/gu;

/** A date with a day no month could be its number: it shows which part is which. */
const EXAMPLE = '2026-11-25';

/** The shape of a date as a locale writes it, in the letters of the language: «mm/dd/yyyy». */
const shapeOf = (
	letters: Record<'day' | 'month' | 'year', string>,
	locale: string,
) => {
	const { order, separator } = datePattern(locale);

	return order.map((part) => letters[part]).join(separator);
};

/** What a typed text is as a date, and its ISO value when it can be taken. */
const readDate = (
	text: string,
	{ max, min, required }: { required: boolean; max?: string; min?: string },
	locale: string,
): { value: string; problem?: DateProblem } => {
	if (!text.trim())
		return { problem: required ? 'required' : undefined, value: '' };

	const value = parseTypedDate(text, locale);

	if (!value) return { problem: 'invalid', value: '' };
	if (min && value < min) return { problem: 'min', value: '' };
	if (max && value > max) return { problem: 'max', value: '' };

	return { value };
};

/**
 * A text of the picker with its blanks filled: `{format}` is the shape of a date, `{example}`
 * a date written so, and `{date}` the limit a date went over.
 */
const worded = (
	template: string,
	{
		date = '',
		example,
		format,
	}: { example: string; format: string; date?: string },
) =>
	template
		.replace('{date}', date)
		.replace('{format}', format)
		.replace('{example}', example);

/**
 * A date, typed or picked. The field takes a date as the locale writes it
 * (mm/dd/yyyy in the United States, dd-mm-yyyy in Chile) and puts its separators as
 * the digits come; its button (or Alt + ↓) opens a Calendar to pick the day with the
 * pointer or the keyboard, Escape closes it and gives the focus back. What is wrong
 * (not a date, out of `min` / `max`, missing) is said under the field when it is
 * left, and goes as soon as the date is right.
 *
 * A date pasted whole takes the place of what the field had, whatever its separators
 * and with a day or a month of one digit («11/5/2026»), or as an ISO date.
 *
 * Its value is an ISO date (YYYY-MM-DD), or '' while there is no valid one:
 * `onValueChange` gets it and `name` sends it with the form. A controlled `value`
 * only moves between valid dates and '': to drop a half-typed one, remount the
 * picker with a new `key`. A reset of its form puts it back to `defaultValue`.
 * `className` goes to the wrapper; every other prop and the `ref` go to the text
 * input. Its `onChange` is the one of that input: it hears what is typed or pasted
 * in it, not a day picked in the calendar, which `onValueChange` hears as well.
 *
 * @example
 * ```tsx
 * <Field label='Appointment date' required>
 *   <DatePicker name='appointmentDate' min={todayIso()} onValueChange={setDate} />
 * </Field>
 * ```
 *
 * @returns date picker
 */
export const DatePicker = ({
	className,
	defaultValue,
	disabled,
	labels,
	max,
	messages,
	min,
	name,
	onChange,
	onKeyDown,
	onPaste,
	onValueChange,
	ref,
	size = 'md',
	value,
	...props
}: DatePickerProps) => {
	const formatId = useId();
	const messageId = useId();
	const dialogId = useId();
	const { locale } = useLocale();
	const texts = { ...useTexts().datePicker, ...defined(labels) };
	const problems = { ...useTexts().dateMessages, ...defined(messages) };
	// how the locale writes a date, for the placeholder and for every text that says it
	const blanks = {
		example: displayIsoDate(EXAMPLE, locale),
		format: shapeOf(texts, locale),
	};
	const root = useRef<HTMLDivElement>(null);
	const anchor = useRef<HTMLSpanElement>(null);
	const input = useRef<HTMLInputElement>(null);
	const isEdited = useRef(false);
	const [text, setText] = useState(() =>
		displayIsoDate(value ?? defaultValue, locale),
	);
	const [lastValue, setLastValue] = useState(value);
	const [lastLocale, setLastLocale] = useState(locale);
	const [isChecked, setIsChecked] = useState(false);
	const [isOpen, setIsOpen] = useState(false);
	const keepCaret = useMaskedCaret(input, text, isDigit);
	const field = useFieldControl(props);
	const limits = { max, min, required: Boolean(field.required) };
	const date = readDate(text, limits, lastLocale);
	const today = todayIso();

	// another language writes the same date another way
	if (locale !== lastLocale) {
		setLastLocale(locale);

		if (date.value) setText(displayIsoDate(date.value, locale));
	}

	// a new value from outside replaces what was typed, unless it is the same date
	if (value !== lastValue) {
		setLastValue(value);

		if (value !== undefined && value !== date.value)
			setText(displayIsoDate(value, locale));
	}

	const message =
		isChecked && date.problem
			? worded(problems[date.problem], {
					...blanks,
					date: displayIsoDate(
						date.problem === 'min' ? min : max,
						locale,
					),
				})
			: undefined;

	useOutsidePress(isOpen, [root], () => setIsOpen(false));

	const take = (nextText: string) => {
		const next = readDate(nextText, limits, locale);

		setText(nextText);

		// a message on screen follows the value; once gone, the next one waits for the blur
		if (!next.problem) setIsChecked(false);
		if (next.value !== date.value) onValueChange?.(next.value);
	};

	// a reset form («Clear») puts the field back to its first date
	useFormReset(input, () => {
		isEdited.current = false;
		take(displayIsoDate(defaultValue, locale));
		setIsChecked(false);
	});

	/** The day of the calendar, or none: the field takes it and gets the focus back. */
	const pick = (day: string) => {
		isEdited.current = false;
		take(displayIsoDate(day, locale));
		setIsChecked(false);
		setIsOpen(false);
		input.current?.focus();
	};

	const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
		const { selectionStart, value: typed } = event.target;

		// a full field takes no more: the key or the paste is refused whole, rather than
		// let in and the last digit of the date pushed out
		if (typed.replaceAll(NOT_DIGITS, '').length > DATE_DIGITS) {
			undoChange(event.target, text);

			return;
		}

		isEdited.current = true;
		keepCaret(typed, selectionStart);
		take(maskTypedDate(typed, locale));
		onChange?.(event);
	};

	const handlePaste = (event: ClipboardEvent<HTMLInputElement>) => {
		onPaste?.(event);

		if (event.defaultPrevented || event.currentTarget.readOnly) return;

		// A date written whole («11/5/2026») is the date of the field, in the place of
		// what it had: its parts are apart already, and going through the keys would
		// read its digits one after another («11/52/026»). Anything else is typed in
		const pasted = maskPastedDate(
			event.clipboardData.getData('text'),
			locale,
		);

		if (pasted === undefined) return;

		// it goes in as a change of the field, which is what it is: `onChange` hears it
		event.preventDefault();
		writeInput(event.currentTarget, pasted);
	};

	const closeOnEscape = (event: KeyboardEvent) => {
		if (event.key !== 'Escape' || !isOpen) return;

		// only the calendar closes: not the dialog the field may be in
		event.preventDefault();
		event.stopPropagation();
		setIsOpen(false);
		input.current?.focus();
	};

	const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
		onKeyDown?.(event);
		closeOnEscape(event);

		if (event.altKey && event.key === 'ArrowDown') {
			event.preventDefault();
			setIsOpen(true);
		}
	};

	/** The focus left the field and its calendar: what was typed is checked once. */
	const handleBlur = (event: FocusEvent<HTMLDivElement>) => {
		if (root.current?.contains(event.relatedTarget)) return;

		setIsOpen(false);

		if (!isEdited.current) return;

		isEdited.current = false;
		setIsChecked(Boolean(date.problem));
	};

	return (
		<div
			className={cx(styles.root, className)}
			onBlur={handleBlur}
			ref={root}
		>
			<span className={styles.field} ref={anchor}>
				<input
					autoComplete='off'
					inputMode='numeric'
					placeholder={blanks.format}
					type='text'
					{...field}
					aria-describedby={cx(
						formatId,
						field['aria-describedby'],
						message && messageId,
					)}
					aria-invalid={message ? true : field['aria-invalid']}
					className={cx(control.control, control[size], styles.input)}
					disabled={disabled}
					onChange={handleChange}
					onKeyDown={handleKeyDown}
					onPaste={handlePaste}
					ref={mergeRefs(input, ref)}
					value={text}
				/>
				<button
					aria-controls={isOpen ? dialogId : undefined}
					aria-expanded={isOpen}
					aria-haspopup='dialog'
					aria-label={texts.open}
					className={styles.opener}
					disabled={disabled}
					onClick={() => setIsOpen(!isOpen)}
					type='button'
				>
					<Icon name='calendar' size='sm' />
				</button>
			</span>

			<VisuallyHidden id={formatId}>
				{worded(texts.format, blanks)}
			</VisuallyHidden>
			{name && (
				<HiddenInput
					disabled={disabled}
					form={props.form}
					name={name}
					value={date.value}
				/>
			)}
			<span aria-live='polite' className={control.error} id={messageId}>
				{message}
			</span>

			<Popup
				anchor={anchor}
				aria-label={texts.dialog}
				aria-modal={false}
				className={styles.popup}
				id={dialogId}
				onKeyDown={closeOnEscape}
				open={isOpen}
				role='dialog'
				tabIndex={-1}
			>
				<Calendar
					focusOnMount
					max={max}
					min={min}
					onValueChange={pick}
					value={date.value}
				/>
				<div className={styles.footer}>
					<Button
						disabled={clampIsoDate(today, min, max) !== today}
						onClick={() => pick(today)}
						size='sm'
						variant='ghost'
					>
						{texts.today}
					</Button>
					<Button onClick={() => pick('')} size='sm' variant='ghost'>
						{texts.clear}
					</Button>
				</div>
			</Popup>
		</div>
	);
};

export interface DatePickerProps extends Omit<
	ComponentProps<'input'>,
	'defaultValue' | 'max' | 'min' | 'size' | 'type' | 'value'
> {
	/** The date at first, uncontrolled (YYYY-MM-DD). */
	defaultValue?: string;
	labels?: Partial<UiTexts['datePicker']>;
	/** The last day that can be chosen (YYYY-MM-DD). */
	max?: string;
	/**
	 * The texts of a wrong date: `{date}` stands for the limit in `min` and `max`, `{format}`
	 * for the shape of a date and `{example}` for a date written so.
	 */
	messages?: Partial<UiTexts['dateMessages']>;
	/** The first day that can be chosen (YYYY-MM-DD). */
	min?: string;
	/** The name the ISO date is sent with. */
	name?: string;
	size?: 'lg' | 'md' | 'sm';
	/** The date, controlled (YYYY-MM-DD, or '' for none). */
	value?: string;
	/** The ISO date, or '' while there is no valid one. */
	onValueChange?: (value: string) => void;
}
