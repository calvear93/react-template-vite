import {
	type KeyboardEvent,
	type PointerEvent,
	useEffect,
	useRef,
	useState,
} from 'react';
import { isTimeWithin, timeParts, toTime } from '../../format/time.ts';
import { cx } from '../../internal/cx.ts';
import { moveRovingFocus } from '../../internal/roving-focus.ts';
import {
	handOf,
	hourAt,
	hourMarks,
	minuteAt,
	minuteMarks,
	placeOf,
} from './clock.model.ts';
import { type TimePanelProps } from './TimePanels.tsx';
import styles from './TimePicker.module.css';

const MARKS = '[role="option"]';

const two = (amount: number) => String(amount).padStart(2, '0');

/**
 * The panel of a TimePicker as a clock face: the hours first (1 to 12 on the outer
 * ring, 13 to 23 and 00 on the inner one), then the minutes, with a hand to what
 * is chosen. A press or a drag on the face chooses; letting go of the hour moves
 * on to the minutes, letting go of the minutes ends it. The two numbers above
 * say which part is being chosen and go back to the other.
 *
 * Each face is a `listbox`: the arrows go around it, Enter and Space choose.
 *
 * @returns clock face
 */
export const TimeClock = ({
	labels,
	max,
	min,
	minuteStep,
	onPick,
	value,
}: TimePanelProps) => {
	const dial = useRef<HTMLDivElement>(null);
	const isPressed = useRef(false);
	// the box of the face, measured when a drag starts: it does not move while it lasts
	const face = useRef<DOMRect>(undefined);
	const [part, setPart] = useState<'hours' | 'minutes'>('hours');
	const parts = timeParts(value);
	const hour = parts?.hours ?? 0;
	const minute = parts?.minutes ?? 0;
	const isHours = part === 'hours';
	const marks = isHours ? hourMarks() : minuteMarks(minuteStep);
	const chosen = isHours ? parts?.hours : parts?.minutes;
	const hand = chosen === undefined ? undefined : handOf(isHours, chosen);

	const timeOf = (amount: number) =>
		isHours ? toTime(amount, minute) : toTime(hour, amount);

	const isAllowed = (amount: number) =>
		isHours
			? isTimeWithin(toTime(amount, 59), min) &&
				isTimeWithin(toTime(amount, 0), undefined, max)
			: isTimeWithin(toTime(hour, amount), min, max);

	// the Tab stop: what is chosen, or the first mark that can be
	const stop =
		marks.find((mark) => mark.value === chosen && isAllowed(mark.value)) ??
		marks.find((mark) => isAllowed(mark.value));

	// the face shown takes the focus: when the panel opens, and when the hour gives way to the minutes
	useEffect(() => {
		dial.current
			?.querySelector<HTMLElement>('[tabindex="0"]')
			?.focus({ preventScroll: true });
	}, [part]);

	/** Shows a value as the time, without leaving the face: what a press or a drag is on. */
	const preview = (amount: number) => {
		if (isAllowed(amount)) onPick(timeOf(amount), false);
	};

	/** Takes a value: the hour moves on to the minutes, the minutes end the panel. */
	const choose = (amount: number) => {
		if (!isAllowed(amount)) return;

		onPick(timeOf(amount), !isHours);

		if (isHours) setPart('minutes');
	};

	/** The value under the pointer: the mark pressed, or what its direction from the center says. */
	const amountAt = (event: PointerEvent<HTMLDivElement>) => {
		const mark = (event.target as Element).closest<HTMLElement>(
			'[data-amount]',
		);

		if (mark) return Number(mark.dataset.amount);

		const box = face.current ?? event.currentTarget.getBoundingClientRect();
		const radius = box.width / 2;
		const dx = event.clientX - box.left - radius;
		const dy = event.clientY - box.top - radius;

		return isHours ? hourAt(dx, dy, radius) : minuteAt(dx, dy, minuteStep);
	};

	const handleKeyDown = (
		event: KeyboardEvent<HTMLButtonElement>,
		amount: number,
	) => {
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			choose(amount);

			return;
		}

		// around the face, with either pair of arrows
		const options = { container: dial.current, selector: MARKS };

		if (!moveRovingFocus(event, { ...options, orientation: 'vertical' }))
			moveRovingFocus(event, { ...options, orientation: 'horizontal' });
	};

	return (
		<div className={styles.clock}>
			<div className={styles.readout}>
				<button
					aria-label={`${labels.hours}: ${two(hour)}`}
					aria-pressed={isHours}
					className={styles.part}
					onClick={() => setPart('hours')}
					type='button'
				>
					{two(hour)}
				</button>
				<span aria-hidden>:</span>
				<button
					aria-label={`${labels.minutes}: ${two(minute)}`}
					aria-pressed={!isHours}
					className={styles.part}
					onClick={() => setPart('minutes')}
					type='button'
				>
					{two(minute)}
				</button>
			</div>

			<div
				aria-label={isHours ? labels.hours : labels.minutes}
				className={styles.dial}
				onPointerCancel={() => {
					isPressed.current = false;
					face.current = undefined;
				}}
				onPointerDown={(event) => {
					if (event.button !== 0) return;

					isPressed.current = true;
					face.current = event.currentTarget.getBoundingClientRect();

					// the drag goes on outside the face, and ends wherever the pointer is let go
					if (
						typeof event.currentTarget.setPointerCapture ===
						'function'
					)
						event.currentTarget.setPointerCapture(event.pointerId);

					preview(amountAt(event));
				}}
				onPointerMove={(event) => {
					if (isPressed.current) preview(amountAt(event));
				}}
				onPointerUp={(event) => {
					if (!isPressed.current) return;

					isPressed.current = false;
					choose(amountAt(event));
					face.current = undefined;
				}}
				ref={dial}
				role='listbox'
			>
				{hand && (
					<span
						aria-hidden
						className={styles.hand}
						data-ring={hand.ring}
						style={{ rotate: `${hand.angle}deg` }}
					/>
				)}

				{marks.map((mark) => (
					<button
						aria-label={mark.isNumbered ? undefined : mark.label}
						aria-selected={mark.value === chosen}
						className={cx(
							styles.mark,
							!mark.isNumbered && styles.dot,
						)}
						data-amount={mark.value}
						data-ring={mark.ring}
						disabled={!isAllowed(mark.value)}
						key={mark.value}
						onKeyDown={(event) => handleKeyDown(event, mark.value)}
						role='option'
						style={placeOf(mark)}
						tabIndex={mark === stop ? 0 : -1}
						type='button'
					>
						{mark.isNumbered && mark.label}
					</button>
				))}
			</div>
		</div>
	);
};
