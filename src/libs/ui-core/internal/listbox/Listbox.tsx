import { type ComponentProps, memo, useId } from 'react';
import { Highlight } from '../../components/highlight/Highlight.tsx';
import { Icon } from '../../icon/Icon.tsx';
import { cx } from '../cx.ts';
import {
	flattenOptions,
	isGroup,
	type ListItem,
	type ListOption,
} from './listbox.model.ts';
import { optionId } from './use-listbox.hook.ts';
import styles from './Listbox.module.css';

const Option = ({
	id,
	index,
	isActive,
	isSelected,
	multiple,
	option,
	query,
}: {
	id: string;
	index: number;
	isActive: boolean;
	isSelected: boolean;
	multiple: boolean;
	option: ListOption;
	query: string;
}) => (
	<div
		aria-disabled={option.disabled || undefined}
		aria-selected={isSelected}
		className={styles.option}
		data-active={isActive || undefined}
		data-index={index}
		id={id}
		role='option'
	>
		{multiple && <span aria-hidden className={styles.box} />}
		<span className={styles.label}>
			<Highlight query={query} text={option.label} />
		</span>
		{!multiple && isSelected && (
			<Icon className={styles.check} name='check' size='sm' />
		)}
	</div>
);

/**
 * An option of the list. Memoized by hand, the one exception to the React
 * Compiler doing it: the compiler keeps a `.map` as a whole, not each of its
 * elements, and an arrow key would draw every option again to move one ring.
 */
const ListboxOption = memo(Option);

/**
 * The options of a picker, drawn: a `listbox` with its options, those of a group
 * under its heading (a `group` named by it, which selects nothing). The selected
 * option carries a check, or a ticked box where several can be (`multiple`); the
 * one the keys are on, a ring; what matches the search, in bold.
 *
 * It only draws: each option carries its place (`data-index`) for whoever
 * listens to the presses, and the keyboard is of whoever has the focus
 * (useListbox).
 *
 * @returns listbox
 */
export const Listbox = ({
	id,
	active,
	className,
	items,
	multiple = false,
	query = '',
	values,
	...props
}: ListboxProps) => {
	const groupId = useId();
	const options = flattenOptions(items);
	const places = new Map(options.map((option, index) => [option, index]));
	const picked = new Set(values);

	const draw = (option: ListOption) => {
		const index = places.get(option) ?? -1;

		return (
			<ListboxOption
				id={optionId(id, index)}
				index={index}
				isActive={index === active}
				isSelected={picked.has(option.value)}
				key={option.value}
				multiple={multiple}
				option={option}
				query={query}
			/>
		);
	};

	return (
		<div
			{...props}
			aria-multiselectable={multiple || undefined}
			className={cx(styles.root, className)}
			id={id}
			role='listbox'
		>
			{items.map((item, index) =>
				isGroup(item) ? (
					<div
						aria-labelledby={`${groupId}-${index}`}
						className={styles.group}
						key={`group-${item.label}`}
						role='group'
					>
						<div
							className={styles.heading}
							id={`${groupId}-${index}`}
							role='presentation'
						>
							{item.label}
						</div>
						{item.options.map(draw)}
					</div>
				) : (
					draw(item)
				),
			)}
		</div>
	);
};

export interface ListboxProps extends Omit<
	ComponentProps<'div'>,
	'id' | 'role'
> {
	id: string;
	/** The place of the option the keys are on, among those shown; -1 for none. */
	active: number;
	/** The options shown, grouped or not. */
	items: readonly ListItem[];
	/** The values selected. */
	values: readonly string[];
	/** Several options can be selected: each one shows a box. */
	multiple?: boolean;
	/** What was searched, to mark it in each option. */
	query?: string;
}
