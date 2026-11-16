import { type ComponentProps, useId, useRef } from 'react';
import { type IconName } from '../../icon/icon.registry.ts';
import { Icon } from '../../icon/Icon.tsx';
import { cx } from '../../internal/cx.ts';
import { useControllableState } from '../../internal/use-controllable-state.hook.ts';
import { useFormReset } from '../../internal/use-form-reset.hook.ts';
import styles from './SegmentedControl.module.css';

/**
 * Two to four options as joined buttons, one always chosen: the view of a list
 * (table or cards), a period, a unit. They are native radios in a `fieldset`, so
 * the arrows move through them, a form sends the one chosen and a reset puts the
 * first choice back. Its `legend` names the group for assistive technology (it
 * is not shown: the options speak for themselves).
 *
 * For more options, or ones that need a sentence, use RadioGroup; to change what
 * a page shows below, Tabs.
 *
 * @example
 * ```tsx
 * <SegmentedControl
 *   legend='View'
 *   options={[
 *     { value: 'table', label: 'Table', icon: 'list' },
 *     { value: 'cards', label: 'Cards', icon: 'document' },
 *   ]}
 *   value={view}
 *   onValueChange={setView}
 * />
 * ```
 *
 * @returns segmented control
 */
export const SegmentedControl = <Value extends string = string>({
	className,
	defaultValue,
	legend,
	name,
	onValueChange,
	options,
	size = 'md',
	value,
	...props
}: SegmentedControlProps<Value>) => {
	const groupName = useId();
	const first = useRef<HTMLInputElement>(null);
	const initial = defaultValue ?? options[0]?.value;
	const [selected, setSelected] = useControllableState({
		defaultValue: initial,
		value,
		onChange: (next) => {
			if (next !== undefined) onValueChange?.(next);
		},
	});

	useFormReset(first, () => setSelected(initial));

	return (
		<fieldset
			className={cx(styles.root, styles[size], className)}
			{...props}
		>
			<legend className={styles.legend}>{legend}</legend>

			{options.map((option, index) => (
				<label className={styles.option} key={option.value}>
					<input
						checked={option.value === selected}
						className={styles.input}
						disabled={option.disabled}
						name={name ?? groupName}
						onChange={() => setSelected(option.value)}
						ref={index === 0 ? first : undefined}
						type='radio'
						value={option.value}
					/>
					<span className={styles.segment}>
						{option.icon && <Icon name={option.icon} size='sm' />}
						{option.label}
					</span>
				</label>
			))}
		</fieldset>
	);
};

/** An option of a SegmentedControl. */
export interface SegmentedControlOption<Value extends string = string> {
	label: string;
	value: Value;
	disabled?: boolean;
	icon?: IconName;
}

export interface SegmentedControlProps<
	Value extends string = string,
> extends Omit<ComponentProps<'fieldset'>, 'children' | 'defaultValue'> {
	/** Names the group for assistive technology. */
	legend: string;
	/** Two to four options. */
	options: readonly SegmentedControlOption<Value>[];
	/** The option it starts with (the first one otherwise), and goes back to on a reset. */
	defaultValue?: Value;
	/** The name the chosen value is sent with. */
	name?: string;
	size?: 'md' | 'sm';
	/** The option chosen. Makes it controlled. */
	value?: Value;
	onValueChange?: (value: Value) => void;
}
