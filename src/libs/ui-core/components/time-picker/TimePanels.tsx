import { type KeyboardEvent, useEffect, useRef } from 'react';
import {
	isTimeWithin,
	timeParts,
	timeSlots,
	toTime,
} from '../../format/time.ts';
import { moveRovingFocus } from '../../internal/roving-focus.ts';
import styles from './TimePicker.module.css';

const OPTIONS = '[role="option"]';

const two = (amount: number) => String(amount).padStart(2, '0');

/** What a panel of a TimePicker needs: the time it shows and how to tell the one picked. */
export interface TimePanelProps {
	labels: { hours: string; minutes: string; times: string };
	/** Minutes between the options of the minutes. */
	minuteStep: number;
	/** The time of the field, `HH:mm`; `''` for none. */
	value: string;
	max?: string;
	min?: string;
	/** A time was picked; `done` when nothing is left to choose. */
	onPick: (time: string, done: boolean) => void;
}

interface TimeOption {
	disabled: boolean;
	label: string;
	value: string;
}

/**
 * A column of options to pick one from: a `listbox` that is one Tab stop, the
 * arrows move through it, Enter and Space pick. It opens with its chosen option
 * in sight; `focusOnMount` gives it the focus too.
 *
 * @returns list of times
 */
const TimeList = ({
	focusOnMount = false,
	label,
	onPick,
	options,
	selected,
}: {
	label: string;
	options: readonly TimeOption[];
	selected: string | undefined;
	focusOnMount?: boolean;
	onPick: (value: string) => void;
}) => {
	const list = useRef<HTMLDivElement>(null);
	const wantsFocus = useRef(focusOnMount);
	// the Tab stop: the chosen option, or the first one that can be picked
	const stop =
		options.find(
			(option) => option.value === selected && !option.disabled,
		) ?? options.find((option) => !option.disabled);

	// the chosen option in sight when the panel opens, and with the focus if asked
	useEffect(() => {
		const node = list.current?.querySelector<HTMLElement>('[tabindex="0"]');

		if (typeof node?.scrollIntoView === 'function')
			node.scrollIntoView({ block: 'center' });

		if (wantsFocus.current) node?.focus({ preventScroll: true });

		wantsFocus.current = false;
	}, []);

	const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
		moveRovingFocus(event, {
			container: list.current,
			loop: false,
			orientation: 'vertical',
			selector: OPTIONS,
		});
	};

	return (
		<div
			aria-label={label}
			className={styles.list}
			ref={list}
			role='listbox'
		>
			{options.map((option) => (
				<button
					aria-selected={option.value === selected}
					className={styles.option}
					disabled={option.disabled}
					key={option.value}
					onClick={() => onPick(option.value)}
					onKeyDown={handleKeyDown}
					role='option'
					tabIndex={option === stop ? 0 : -1}
					type='button'
				>
					{option.label}
				</button>
			))}
		</div>
	);
};

/**
 * The panel of a TimePicker as two columns: the hours and the minutes. Picking
 * the hour keeps the panel (the minutes are still to choose); picking the minutes
 * ends it, once there is an hour.
 *
 * @returns columns of hours and minutes
 */
export const TimeColumns = ({
	labels,
	max,
	min,
	minuteStep,
	onPick,
	value,
}: TimePanelProps) => {
	const parts = timeParts(value);
	const step = Math.min(30, Math.max(1, Math.trunc(minuteStep)));
	const hour = parts?.hours ?? 0;

	return (
		<div className={styles.columns}>
			<TimeList
				focusOnMount
				label={labels.hours}
				onPick={(picked) =>
					onPick(toTime(Number(picked), parts?.minutes ?? 0), false)
				}
				options={Array.from({ length: 24 }, (_, index) => ({
					label: two(index),
					value: two(index),
					// an hour none of whose minutes can be picked
					disabled:
						!isTimeWithin(toTime(index, 59), min) ||
						!isTimeWithin(toTime(index, 0), undefined, max),
				}))}
				selected={parts && two(parts.hours)}
			/>
			<TimeList
				label={labels.minutes}
				// the minutes end the panel once there is an hour: picked before any, the
				// hour is the 00 nobody chose, and the panel stays for it to be changed
				onPick={(picked) =>
					onPick(toTime(hour, Number(picked)), Boolean(parts))
				}
				options={Array.from(
					{ length: Math.ceil(60 / step) },
					(_, index) => ({
						label: two(index * step),
						value: two(index * step),
						disabled: !isTimeWithin(
							toTime(hour, index * step),
							min,
							max,
						),
					}),
				)}
				selected={parts && two(parts.minutes)}
			/>
		</div>
	);
};

/**
 * The panel of a TimePicker as one list of times at a regular interval: picking
 * one ends it.
 *
 * @returns list of times
 */
export const TimeSlots = ({
	interval,
	labels,
	max,
	min,
	onPick,
	value,
}: Omit<TimePanelProps, 'minuteStep'> & { interval: number }) => (
	<div className={styles.columns}>
		<TimeList
			focusOnMount
			label={labels.times}
			onPick={(picked) => onPick(picked, true)}
			options={timeSlots(interval).map((slot) => ({
				disabled: !isTimeWithin(slot, min, max),
				label: slot,
				value: slot,
			}))}
			selected={value || undefined}
		/>
	</div>
);
