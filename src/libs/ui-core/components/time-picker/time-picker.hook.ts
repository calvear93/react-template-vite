import {
	type ChangeEvent,
	type FocusEvent,
	type KeyboardEvent,
	type RefObject,
	useRef,
	useState,
} from 'react';
import {
	clampTime,
	isTimeWithin,
	maskTypedTime,
	parseTypedTime,
	TIME_DIGITS,
} from '../../format/time.ts';
import { type UiTexts } from '../../i18n/en.ts';
import { insertedRange } from '../../internal/inserted-range.ts';
import { undoChange } from '../../internal/undo-change.ts';
import { useFormReset } from '../../internal/use-form-reset.hook.ts';
import { useMaskedCaret } from '../../internal/use-masked-caret.hook.ts';
import { useOutsidePress } from '../../internal/use-outside-press.hook.ts';

type TimeProblem = keyof UiTexts['timeMessages'];

interface Limits {
	required: boolean;
	max?: string;
	min?: string;
}

const isDigit = (character: string) => /\d/u.test(character);

const digitsOf = (text: string) => text.replaceAll(/\D/gu, '').length;

/** The time a text says, or what is wrong with it. */
const readTime = (
	text: string,
	{ max, min, required }: Limits,
): { value: string; problem?: TimeProblem } => {
	if (!text.trim())
		return { problem: required ? 'required' : undefined, value: '' };

	const value = parseTypedTime(text);

	if (!value) return { problem: 'invalid', value: '' };
	if (!isTimeWithin(value, min)) return { problem: 'min', value: '' };
	if (!isTimeWithin(value, undefined, max))
		return { problem: 'max', value: '' };

	return { value };
};

/**
 * The behaviour of a TimePicker: what is typed in its field (shaped as hh:mm) and
 * the time it says, what is wrong with it once the field is left, its panel open
 * or closed, and the value it tells its parent and its form.
 *
 * @param options - the value, its limits, the elements involved and the handlers of the parent
 *
 * @returns the state of the field and of its panel, and their handlers
 */
export const useTimePicker = ({
	defaultValue,
	input,
	limits,
	messages,
	onChange,
	onKeyDown,
	onValueChange,
	root,
	value,
}: {
	defaultValue: string | undefined;
	input: RefObject<HTMLInputElement | null>;
	limits: Limits;
	messages: UiTexts['timeMessages'];
	onChange: ((event: ChangeEvent<HTMLInputElement>) => void) | undefined;
	onKeyDown: ((event: KeyboardEvent<HTMLInputElement>) => void) | undefined;
	onValueChange: ((value: string) => void) | undefined;
	root: RefObject<HTMLElement | null>;
	value: string | undefined;
}) => {
	const isEdited = useRef(false);
	const [text, setText] = useState(value ?? defaultValue ?? '');
	const [lastValue, setLastValue] = useState(value);
	const [isChecked, setIsChecked] = useState(false);
	const [isOpen, setIsOpen] = useState(false);
	// the caret after the same number of digits it had before the colon went in
	const keepCaret = useMaskedCaret(input, text, isDigit);
	const time = readTime(text, limits);

	// a new value from outside replaces what was typed, unless it is the same time
	if (value !== lastValue) {
		setLastValue(value);

		if (value !== undefined && value !== time.value) setText(value);
	}

	const problem = isChecked ? time.problem : undefined;
	const limit = problem === 'min' ? limits.min : limits.max;

	useOutsidePress(isOpen, [root], () => setIsOpen(false));

	const take = (nextText: string) => {
		const next = readTime(nextText, limits);

		setText(nextText);

		// a message on screen follows the value; once gone, the next one waits for the blur
		if (!next.problem) setIsChecked(false);
		if (next.value !== time.value) onValueChange?.(next.value);
	};

	// a reset form («Clear») puts the field back to its first time
	useFormReset(input, () => {
		isEdited.current = false;
		take(defaultValue ?? '');
		setIsChecked(false);
	});

	const closeOnEscape = (event: KeyboardEvent) => {
		if (event.key !== 'Escape' || !isOpen) return;

		// only the panel closes: not the dialog the field may be in
		event.preventDefault();
		event.stopPropagation();
		setIsOpen(false);
		input.current?.focus();
	};

	return {
		closeOnEscape,
		isOpen,
		message: problem && messages[problem].replace('{time}', limit ?? ''),
		text,
		time: time.value,
		toggle: () => setIsOpen(!isOpen),
		handleBlur: (event: FocusEvent) => {
			if (root.current?.contains(event.relatedTarget)) return;

			setIsOpen(false);

			if (!isEdited.current) return;

			isEdited.current = false;
			setIsChecked(Boolean(time.problem));
		},
		handleChange: (event: ChangeEvent<HTMLInputElement>) => {
			const { selectionEnd, selectionStart, value: typed } = event.target;

			// a full field takes no more: the key or the paste is refused whole, rather
			// than let in and the last digit of the time pushed out
			if (digitsOf(typed) > TIME_DIGITS) {
				undoChange(event.target, text);

				return;
			}

			// an hour of one digit gets its zero when something was put in, not when a
			// digit was taken away: the place it leaves is for the next key
			const masked = maskTypedTime(
				typed,
				insertedRange(text, typed, selectionEnd),
			);

			isEdited.current = true;

			// a zero the mask put before the hour moves every digit: the caret goes to the end
			if (digitsOf(masked) <= digitsOf(typed))
				keepCaret(typed, selectionStart);

			take(masked);
			onChange?.(event);
		},
		handleKeyDown: (event: KeyboardEvent<HTMLInputElement>) => {
			onKeyDown?.(event);
			closeOnEscape(event);

			if (event.altKey && event.key === 'ArrowDown') {
				event.preventDefault();
				setIsOpen(true);
			}
		},
		/**
		 * Takes a time from the panel; `done` closes it and gives the focus back to the
		 * field. One that is not the last word (an hour, its minutes still to choose) is
		 * kept within the limits: 08 with a minimum of 08:30 is 08:30, never 08:00.
		 */
		pick: (picked: string, done = true) => {
			isEdited.current = false;
			take(done ? picked : clampTime(picked, limits.min, limits.max));
			setIsChecked(false);

			if (!done) return;

			setIsOpen(false);
			input.current?.focus();
		},
	};
};
