import { type ComponentProps } from 'react';
import { Icon } from '../../icon/Icon.tsx';
import { cx } from '../../internal/cx.ts';
import { useFieldControl } from '../../internal/field/use-field-control.hook.ts';
import control from '../../internal/control/control.module.css';
import styles from './Select.module.css';

const drawOption = ({ disabled, label, value }: SelectOption) => (
	<option disabled={disabled} key={value} value={value}>
		{label}
	</option>
);

/**
 * One of many known options: the native select (its keyboard, its mobile picker),
 * with its open list drawn by the kit where the browser allows it. Give the
 * options as data (`options`) or as `<option>` children; an item of `options`
 * with its own `options` is a group (`<optgroup>`): a heading over them, which
 * selects nothing. `className` goes to the wrapper; every other prop and the
 * `ref` go to the `<select>`.
 *
 * For a long list use SearchSelect; for several options at once, MultiSelect.
 *
 * @example
 * ```tsx
 * <Field label='Region'>
 *   <Select name='region' placeholder='Select…' options={regions} />
 * </Field>
 *
 * <Select
 *   aria-label='City'
 *   options={[
 *     { label: 'Oregon', options: [{ value: 'portland', label: 'Portland' }] },
 *     { label: 'Washington', options: [{ value: 'seattle', label: 'Seattle' }] },
 *   ]}
 * />
 * ```
 *
 * @returns select
 */
export const Select = ({
	children,
	className,
	options,
	placeholder,
	size = 'md',
	...props
}: SelectProps) => (
	<span className={cx(styles.root, className)}>
		<select
			{...useFieldControl(props)}
			className={cx(control.control, control[size], styles.select)}
		>
			{placeholder !== undefined && (
				<option value=''>{placeholder}</option>
			)}
			{options?.map((item) =>
				'options' in item ? (
					<optgroup
						disabled={item.disabled}
						key={`group-${item.label}`}
						label={item.label}
					>
						{item.options.map(drawOption)}
					</optgroup>
				) : (
					drawOption(item)
				),
			)}
			{children}
		</select>
		<Icon className={styles.indicator} name='chevron-down' size='sm' />
	</span>
);

export interface SelectOption {
	label: string;
	value: number | string;
	disabled?: boolean;
}

/** Options of a Select under a heading: the group selects nothing by itself. */
export interface SelectOptionGroup {
	label: string;
	options: readonly SelectOption[];
	/** None of its options can be chosen. */
	disabled?: boolean;
}

export interface SelectProps extends Omit<ComponentProps<'select'>, 'size'> {
	/** The options, or groups of them. */
	options?: readonly (SelectOption | SelectOptionGroup)[];
	/** The text of the empty choice («Select…», «All»). */
	placeholder?: string;
	size?: 'lg' | 'md' | 'sm';
}
