import { type ComponentProps, type ReactNode } from 'react';
import { useTexts } from '../../i18n/texts.hook.ts';
import { cx } from '../../internal/cx.ts';
import { useControllableState } from '../../internal/use-controllable-state.hook.ts';
import styles from './FilterChips.module.css';

/**
 * A row of chips that filters by one visible dimension (a state, a type): one is
 * chosen at a time, and «All» clears the filter (its value is ''). Buttons with
 * `aria-pressed` in a group named by `label`. Controlled with `value`, or
 * uncontrolled from `defaultValue`.
 *
 * @example
 * ```tsx
 * <FilterChips label='Status' value={status} onValueChange={setStatus}
 *   options={[
 *     { value: 'open', label: 'Open', count: 12 },
 *     { value: 'closed', label: 'Closed', count: 48 },
 *   ]} />
 * ```
 *
 * @returns filter chips
 */
export const FilterChips = ({
	allLabel,
	className,
	defaultValue = '',
	label,
	onValueChange,
	options,
	value,
	...props
}: FilterChipsProps) => {
	const texts = useTexts().filterChips;
	const [selected, setSelected] = useControllableState({
		defaultValue,
		onChange: onValueChange,
		value,
	});

	const chips: readonly FilterChipOption[] = [
		{ label: allLabel ?? texts.all, value: '' },
		...options,
	];

	return (
		<div
			aria-label={label}
			className={cx(styles.root, className)}
			role='group'
			{...props}
		>
			{chips.map((option) => (
				<button
					aria-pressed={selected === option.value}
					className={styles.chip}
					disabled={option.disabled}
					key={option.value}
					onClick={() => setSelected(option.value)}
					type='button'
				>
					{option.label}
					{option.count !== undefined && (
						<span className={styles.count}>{option.count}</span>
					)}
				</button>
			))}
		</div>
	);
};

export interface FilterChipOption {
	label: ReactNode;
	/** What the filter takes; never '' (that is «All»). */
	value: string;
	/** How many items the chip leaves. */
	count?: number;
	disabled?: boolean;
}

export interface FilterChipsProps extends Omit<
	ComponentProps<'div'>,
	'children' | 'defaultValue'
> {
	/** The dimension the chips filter by: the name of the group. */
	label: string;
	options: readonly FilterChipOption[];
	/** The text of the chip that clears the filter. */
	allLabel?: string;
	/** The chip chosen at first, uncontrolled ('' = all). */
	defaultValue?: string;
	/** The chip chosen, controlled ('' = all). */
	value?: string;
	onValueChange?: (value: string) => void;
}
