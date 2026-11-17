import {
	type ChangeEvent,
	type ComponentProps,
	type FocusEvent,
	useId,
	useRef,
	useState,
} from 'react';
import {
	maskRut,
	normalizeRut,
	RUT_MAX_LENGTH,
	type RutStatus,
	rutStatus,
} from '../../format/rut.ts';
import { type UiTexts } from '../../i18n/en.ts';
import { useTexts } from '../../i18n/texts.hook.ts';
import { cx } from '../../internal/cx.ts';
import { defined } from '../../internal/defined.ts';
import { useFieldControl } from '../../internal/field/use-field-control.hook.ts';
import { HiddenInput } from '../../internal/hidden-input/HiddenInput.tsx';
import { mergeRefs } from '../../internal/merge-refs.ts';
import { undoChange } from '../../internal/undo-change.ts';
import { useFormReset } from '../../internal/use-form-reset.hook.ts';
import { useMaskedCaret } from '../../internal/use-masked-caret.hook.ts';
import control from '../../internal/control/control.module.css';

const isRutCharacter = (character: string) => /[\dk]/iu.test(character);

/**
 * A Chilean RUT. It formats while typing (12.345.678-5), whatever is typed or
 * pasted, with its separators or without; it checks the digit when the field is
 * left, never while the RUT is still incomplete, and says why under the field.
 * A complete RUT takes no more characters: a key that does not fit is refused, so
 * none can push its check digit out.
 *
 * Its value is the normalized RUT (`12345678-5`), or '' while it is not valid:
 * `onValueChange` gets it with the status, and `name` sends it with the form. A
 * controlled `value` only moves between valid RUTs and '': to drop a half-typed
 * one, remount the input with a new `key`. A reset of its form puts it back to
 * `defaultValue`.
 *
 * @example
 * ```tsx
 * <Field label='RUT' required>
 *   <InputRut name='rut' onValueChange={(rut, status) => setRut(rut)} />
 * </Field>
 * ```
 *
 * @returns RUT input
 */
export const InputRut = ({
	className,
	defaultValue,
	messages,
	name,
	onBlur,
	onChange,
	onValueChange,
	ref,
	size = 'md',
	value,
	...props
}: InputRutProps) => {
	const messageId = useId();
	const [text, setText] = useState(() => maskRut(value ?? defaultValue));
	const [lastValue, setLastValue] = useState(value);
	const [isChecked, setIsChecked] = useState(false);
	const input = useRef<HTMLInputElement>(null);
	// the caret after the same number of digits it had before the reformat
	const keepCaret = useMaskedCaret(input, text, isRutCharacter);

	// a new value from outside replaces what was typed, unless it is the same RUT
	if (value !== lastValue) {
		setLastValue(value);

		if (value !== undefined && normalizeRut(text) !== value)
			setText(maskRut(value));
	}

	const status = rutStatus(text);

	// a reset form («Clear») puts the field back to its first RUT
	useFormReset(input, () => {
		const first = maskRut(defaultValue);

		setText(first);
		setIsChecked(false);

		if (first !== text)
			onValueChange?.(normalizeRut(first), rutStatus(first));
	});
	const texts = { ...useTexts().rutMessages, ...defined(messages) };
	const message = isChecked
		? texts[status as keyof UiTexts['rutMessages']]
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
		const { selectionStart, value: typed } = event.target;
		const masked = maskRut(typed);

		// a full field takes no more: the key or the paste is refused whole, rather than
		// let in and the check digit pushed out, which leaves another RUT
		if ([...masked].filter(isRutCharacter).length > RUT_MAX_LENGTH) {
			undoChange(event.target, text);

			return;
		}

		const next = rutStatus(masked);

		keepCaret(typed, selectionStart);
		setText(masked);

		// a message on screen follows the value; once gone, the next one waits for the blur
		if (next === 'empty' || next === 'valid') setIsChecked(false);

		onChange?.(event);
		onValueChange?.(normalizeRut(masked), next);
	};

	const handleBlur = (event: FocusEvent<HTMLInputElement>) => {
		setIsChecked(status !== 'empty' && status !== 'valid');
		onBlur?.(event);
	};

	return (
		<>
			<input
				autoComplete='off'
				inputMode='text'
				placeholder='12.345.678-5'
				type='text'
				{...field}
				className={cx(control.control, control[size], className)}
				onBlur={handleBlur}
				onChange={handleChange}
				ref={mergeRefs(input, ref)}
				value={text}
			/>
			{name && (
				<HiddenInput
					disabled={props.disabled}
					form={props.form}
					name={name}
					value={normalizeRut(text)}
				/>
			)}
			<span aria-live='polite' className={control.error} id={messageId}>
				{message}
			</span>
		</>
	);
};

export interface InputRutProps extends Omit<
	ComponentProps<'input'>,
	'defaultValue' | 'size' | 'type' | 'value'
> {
	/** The RUT at first, uncontrolled: normalized (`12345678-5`) or as typed. */
	defaultValue?: string;
	/** The texts of an incomplete or invalid RUT. */
	messages?: Partial<Record<keyof UiTexts['rutMessages'], string>>;
	/** The name the normalized RUT is sent with. */
	name?: string;
	size?: 'lg' | 'md' | 'sm';
	/** The RUT, controlled: normalized (`12345678-5`), or '' for none. */
	value?: string;
	/** The normalized RUT ('' while it is not valid) and what the text is as a RUT. */
	onValueChange?: (value: string, status: RutStatus) => void;
}
