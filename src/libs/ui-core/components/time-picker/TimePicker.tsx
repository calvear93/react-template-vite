import { type ComponentProps, useId, useRef } from 'react';
import { isTimeWithin, nowTime } from '../../format/time.ts';
import { type UiTexts } from '../../i18n/en.ts';
import { useTexts } from '../../i18n/texts.hook.ts';
import { Icon } from '../../icon/Icon.tsx';
import { cx } from '../../internal/cx.ts';
import { defined } from '../../internal/defined.ts';
import { useFieldControl } from '../../internal/field/use-field-control.hook.ts';
import { HiddenInput } from '../../internal/hidden-input/HiddenInput.tsx';
import { mergeRefs } from '../../internal/merge-refs.ts';
import { Popup } from '../../internal/popup/Popup.tsx';
import { Button } from '../button/Button.tsx';
import { VisuallyHidden } from '../visually-hidden/VisuallyHidden.tsx';
import { useTimePicker } from './time-picker.hook.ts';
import { TimeClock } from './TimeClock.tsx';
import { TimeColumns, TimeSlots } from './TimePanels.tsx';
import control from '../../internal/control/control.module.css';
import styles from './TimePicker.module.css';

/**
 * A time of the day, typed (`hh:mm`, 24 hours: the colon goes in by itself) or
 * picked in its panel. `picker` chooses the panel: two `columns` of hours and
 * minutes (the default), a `list` of times every `interval` minutes, or a `clock`
 * face. Its value is `HH:mm` (`''` for none); with a `name` its form gets it, and
 * a reset of that form puts its first time back.
 *
 * Once the field is left it says what is wrong: a time that is not one, or one
 * before `min` or after `max`. `minuteStep` is how far apart the minutes of the
 * panel are; any minute can always be typed. Inside a Field it takes its label,
 * hint and error. Alt + ArrowDown opens the panel; Escape closes it. Its `onChange`
 * is the one of its text input: it hears what is typed or pasted in it, not a time
 * picked in the panel, which `onValueChange` hears as well.
 *
 * @example
 * ```tsx
 * <Field label='Time of the accident'>
 *   <TimePicker name='time' value={time} onValueChange={setTime} max={nowTime()} />
 * </Field>
 *
 * <TimePicker aria-label='Appointment time' picker='list' interval={30} min='08:00' max='18:00' />
 * <TimePicker aria-label='Visit time' picker='clock' minuteStep={1} />
 * ```
 *
 * @returns time picker
 */
export const TimePicker = ({
	className,
	defaultValue,
	disabled,
	interval = 30,
	labels,
	max,
	messages,
	min,
	minuteStep = 5,
	name,
	onChange,
	onKeyDown,
	onValueChange,
	picker = 'columns',
	ref,
	size = 'md',
	value,
	...props
}: TimePickerProps) => {
	const formatId = useId();
	const messageId = useId();
	const dialogId = useId();
	const texts = { ...useTexts().timePicker, ...defined(labels) };
	const root = useRef<HTMLDivElement>(null);
	const anchor = useRef<HTMLSpanElement>(null);
	const input = useRef<HTMLInputElement>(null);
	const field = useFieldControl(props);
	const time = useTimePicker({
		defaultValue,
		input,
		limits: { max, min, required: Boolean(field.required) },
		messages: { ...useTexts().timeMessages, ...defined(messages) },
		onChange,
		onKeyDown,
		onValueChange,
		root,
		value,
	});
	const now = nowTime();
	const panel = {
		labels: texts,
		max,
		min,
		onPick: time.pick,
		value: time.time,
	};

	return (
		<div
			className={cx(styles.root, className)}
			onBlur={time.handleBlur}
			ref={root}
		>
			<span className={styles.field} ref={anchor}>
				<input
					autoComplete='off'
					inputMode='numeric'
					placeholder='hh:mm'
					type='text'
					{...field}
					aria-describedby={cx(
						formatId,
						field['aria-describedby'],
						time.message && messageId,
					)}
					aria-invalid={time.message ? true : field['aria-invalid']}
					className={cx(control.control, control[size], styles.input)}
					disabled={disabled}
					onChange={time.handleChange}
					onKeyDown={time.handleKeyDown}
					ref={mergeRefs(input, ref)}
					value={time.text}
				/>
				<button
					aria-controls={time.isOpen ? dialogId : undefined}
					aria-expanded={time.isOpen}
					aria-haspopup='dialog'
					aria-label={texts.open}
					className={styles.opener}
					disabled={disabled}
					onClick={time.toggle}
					type='button'
				>
					<Icon name='clock' size='sm' />
				</button>
			</span>

			<VisuallyHidden id={formatId}>{texts.format}</VisuallyHidden>
			{name && (
				<HiddenInput
					disabled={disabled}
					form={props.form}
					name={name}
					value={time.time}
				/>
			)}
			<span aria-live='polite' className={control.error} id={messageId}>
				{time.message}
			</span>

			<Popup
				anchor={anchor}
				aria-label={texts.dialog}
				aria-modal={false}
				className={styles.popup}
				id={dialogId}
				onKeyDown={time.closeOnEscape}
				open={time.isOpen}
				role='dialog'
				tabIndex={-1}
			>
				{picker === 'clock' && (
					<TimeClock {...panel} minuteStep={minuteStep} />
				)}
				{picker === 'list' && (
					<TimeSlots {...panel} interval={interval} />
				)}
				{picker === 'columns' && (
					<TimeColumns {...panel} minuteStep={minuteStep} />
				)}

				<div className={styles.footer}>
					<Button
						disabled={!isTimeWithin(now, min, max)}
						onClick={() => time.pick(now)}
						size='sm'
						variant='ghost'
					>
						{texts.now}
					</Button>
					<Button
						onClick={() => time.pick('')}
						size='sm'
						variant='ghost'
					>
						{texts.clear}
					</Button>
				</div>
			</Popup>
		</div>
	);
};

export interface TimePickerProps extends Omit<
	ComponentProps<'input'>,
	'defaultValue' | 'max' | 'min' | 'size' | 'type' | 'value'
> {
	/** The time it starts with (`HH:mm`), and goes back to when its form is reset. */
	defaultValue?: string;
	/** Minutes between the times of the `list` panel. */
	interval?: number;
	labels?: Partial<UiTexts['timePicker']>;
	/** The latest time accepted, `HH:mm`. */
	max?: string;
	messages?: Partial<UiTexts['timeMessages']>;
	/** The earliest time accepted, `HH:mm`. */
	min?: string;
	/** Minutes between the options of the `columns` and `clock` panels. */
	minuteStep?: number;
	/** The name the time is sent with. */
	name?: string;
	/** How the panel offers the time: two columns, a list of times, or a clock face. */
	picker?: 'clock' | 'columns' | 'list';
	size?: 'lg' | 'md' | 'sm';
	/** The time, `HH:mm`; `''` for none. Makes it controlled. */
	value?: string;
	/** The time typed or picked, once it is a time within its limits; `''` otherwise. */
	onValueChange?: (value: string) => void;
}
