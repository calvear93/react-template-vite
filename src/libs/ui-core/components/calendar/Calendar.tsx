import {
	type ComponentProps,
	type KeyboardEvent,
	useEffect,
	useId,
	useRef,
	useState,
} from 'react';
import {
	addDays,
	addMonths,
	clampIsoDate,
	isoDateParts,
	monthNames,
	todayIso,
	toIsoDate,
	weekdayOf,
} from '../../format/iso-date.ts';
import { useLocale } from '../../format/locale.hook.ts';
import { type UiTexts } from '../../i18n/en.ts';
import { useTexts } from '../../i18n/texts.hook.ts';
import { Icon } from '../../icon/Icon.tsx';
import { cx } from '../../internal/cx.ts';
import { defined } from '../../internal/defined.ts';
import { useControllableState } from '../../internal/use-controllable-state.hook.ts';
import { Select } from '../select/Select.tsx';
import { VisuallyHidden } from '../visually-hidden/VisuallyHidden.tsx';
import { monthDays, monthLabel, weekdayLabels } from './calendar.model.ts';
import styles from './Calendar.module.css';

/** The name of a month standing alone, as an option of a list: with its capital. */
const capitalize = (text: string, locale: string) =>
	text.charAt(0).toLocaleUpperCase(locale) + text.slice(1);

/** What each key does to the focused day. */
const MOVES: Record<
	string,
	(day: string, isShifted: boolean, locale: string) => string
> = {
	ArrowDown: (day) => addDays(day, 7),
	ArrowLeft: (day) => addDays(day, -1),
	ArrowRight: (day) => addDays(day, 1),
	ArrowUp: (day) => addDays(day, -7),
	End: (day, _, locale) => addDays(day, 6 - weekdayOf(day, locale)),
	Home: (day, _, locale) => addDays(day, -weekdayOf(day, locale)),
	PageDown: (day, isShifted) => addMonths(day, isShifted ? 12 : 1),
	PageUp: (day, isShifted) => addMonths(day, isShifted ? -12 : -1),
};

/**
 * A month to pick a day in. A grid with one Tab stop: the arrows move by day and
 * by week, Home and End to the ends of the week, PageUp and PageDown by month
 * (with Shift, by year), Enter or Space pick. Each day is said in full («Thursday,
 * November 5, 2026»); today and the day chosen are marked for assistive
 * technology too. `min` and `max` (YYYY-MM-DD) limit what can be picked and
 * shown.
 *
 * Its months, its days and the day its weeks start on are those of the locale. Its
 * value is an ISO date (YYYY-MM-DD), or '' for none; today is the day in the time zone
 * of the app.
 *
 * @example
 * ```tsx
 * <Calendar value={date} onValueChange={setDate} min={todayIso()} />
 * ```
 *
 * @returns calendar
 */
export const Calendar = ({
	className,
	defaultValue = '',
	focusOnMount = false,
	labels,
	max,
	min,
	onValueChange,
	value,
	...props
}: CalendarProps) => {
	const labelId = useId();
	const { locale } = useLocale();
	const texts = { ...useTexts().calendar, ...defined(labels) };
	const today = todayIso();
	const grid = useRef<HTMLDivElement>(null);
	const wantsFocus = useRef(focusOnMount);
	const [selected, select] = useControllableState({
		defaultValue,
		onChange: onValueChange,
		value,
	});

	// the years the calendar can show: around today, or those of its limits
	const thisYear = Number(today.slice(0, 4));
	const firstYear = min ? Number(min.slice(0, 4)) : thisYear - 100;
	const lastYear = Math.max(
		firstYear,
		max ? Number(max.slice(0, 4)) : thisYear + 10,
	);
	const lower = clampIsoDate(toIsoDate(firstYear, 1, 1), min);
	const upper = clampIsoDate(toIsoDate(lastYear, 12, 31), undefined, max);
	const within = (day: string) => clampIsoDate(day, lower, upper);

	const [focused, setFocused] = useState(() =>
		within(isoDateParts(selected) ? selected : today),
	);
	const [lastSelected, setLastSelected] = useState(selected);

	// a day chosen from outside brings its month into view
	if (selected !== lastSelected) {
		setLastSelected(selected);

		if (isoDateParts(selected)) setFocused(within(selected));
	}

	const year = Number(focused.slice(0, 4));
	const month = Number(focused.slice(5, 7));
	const first = toIsoDate(year, month, 1);
	const thisMonth = focused.slice(0, 7);
	// the grid of the month: the same one while the keys move inside it
	const days = monthDays(year, month, locale);

	// the roving focus follows the day shown, when a key moved it
	useEffect(() => {
		if (!wantsFocus.current) return;

		wantsFocus.current = false;
		grid.current
			?.querySelector<HTMLElement>(`[data-date="${focused}"]`)
			?.focus();
	}, [focused]);

	const show = (day: string, shouldFocus = false) => {
		wantsFocus.current = shouldFocus;
		setFocused(within(day));
	};

	const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
		const move = MOVES[event.key];

		if (!move) return;

		event.preventDefault();
		show(move(focused, event.shiftKey, locale), true);
	};

	/** The month and the year of the selects, the day kept within that month. */
	const jump = (toYear: number, toMonth: number) => {
		show(addMonths(focused, (toYear - year) * 12 + toMonth - month));
	};

	return (
		<div className={cx(styles.root, className)} {...props}>
			<div className={styles.navigation}>
				<button
					aria-label={texts.previous}
					className={styles.step}
					disabled={first <= lower}
					onClick={() => show(addMonths(focused, -1))}
					type='button'
				>
					<Icon name='chevron-left' size='sm' />
				</button>

				<VisuallyHidden aria-live='polite' id={labelId}>
					{monthLabel(year, month, locale)}
				</VisuallyHidden>

				<div className={styles.selects}>
					<Select
						aria-label={texts.month}
						className={styles.month}
						onChange={(event) =>
							jump(year, Number(event.target.value))
						}
						options={monthNames(locale).map((name, index) => {
							const monthStart = toIsoDate(year, index + 1, 1);

							return {
								label: capitalize(name, locale),
								value: index + 1,
								// a month with no day to choose cannot be shown
								disabled:
									addDays(addMonths(monthStart, 1), -1) <
										lower || monthStart > upper,
							};
						})}
						size='sm'
						value={month}
					/>
					<Select
						aria-label={texts.year}
						className={styles.year}
						onChange={(event) =>
							jump(Number(event.target.value), month)
						}
						options={Array.from(
							{ length: lastYear - firstYear + 1 },
							(_, index) => ({
								label: String(lastYear - index),
								value: lastYear - index,
							}),
						)}
						size='sm'
						value={year}
					/>
				</div>

				<button
					aria-label={texts.next}
					className={styles.step}
					disabled={addMonths(first, 1) > upper}
					onClick={() => show(addMonths(focused, 1))}
					type='button'
				>
					<Icon name='chevron-right' size='sm' />
				</button>
			</div>

			<div aria-hidden className={styles.weekdays}>
				{weekdayLabels(locale).map((name) => (
					<span className={styles.weekday} key={name}>
						{name}
					</span>
				))}
			</div>

			<div
				aria-labelledby={labelId}
				className={styles.grid}
				ref={grid}
				role='grid'
			>
				{Array.from({ length: 6 }, (_, week) => (
					<div
						className={styles.week}
						key={days[week * 7]?.date}
						role='row'
					>
						{days.slice(week * 7, week * 7 + 7).map((day) => (
							<span key={day.date} role='gridcell'>
								<button
									aria-current={
										day.date === today ? 'date' : undefined
									}
									aria-label={day.spoken}
									aria-pressed={day.date === selected}
									className={styles.day}
									data-date={day.date}
									data-outside={
										!day.date.startsWith(thisMonth) ||
										undefined
									}
									disabled={
										day.date < lower || day.date > upper
									}
									onClick={() => {
										show(day.date);
										select(day.date);
									}}
									onKeyDown={handleKeyDown}
									tabIndex={day.date === focused ? 0 : -1}
									type='button'
								>
									{day.day}
								</button>
							</span>
						))}
					</div>
				))}
			</div>
		</div>
	);
};

export interface CalendarProps extends Omit<
	ComponentProps<'div'>,
	'children' | 'defaultValue'
> {
	/** The day chosen at first, uncontrolled (YYYY-MM-DD). */
	defaultValue?: string;
	/** Puts the focus on its day when it appears (a calendar that just opened). */
	focusOnMount?: boolean;
	labels?: Partial<UiTexts['calendar']>;
	/** The last day that can be picked (YYYY-MM-DD). */
	max?: string;
	/** The first day that can be picked (YYYY-MM-DD). */
	min?: string;
	/** The day chosen, controlled (YYYY-MM-DD, or '' for none). */
	value?: string;
	onValueChange?: (value: string) => void;
}
