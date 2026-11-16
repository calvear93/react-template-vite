import { type RefObject, useRef } from 'react';
import { Button } from '../../components/button/Button.tsx';
import { useLocale } from '../../format/locale.hook.ts';
import { formatNumber } from '../../format/number.ts';
import { Icon } from '../../icon/Icon.tsx';
import { cx } from '../cx.ts';
import {
	type FieldControlProps,
	useFieldControl,
} from '../field/use-field-control.hook.ts';
import { HiddenInput } from '../hidden-input/HiddenInput.tsx';
import { Popup } from '../popup/Popup.tsx';
import { useFormReset } from '../use-form-reset.hook.ts';
import { useListPicker } from './list-picker.hook.ts';
import { type ListItem } from './listbox.model.ts';
import { Listbox } from './Listbox.tsx';
import control from '../control/control.module.css';
import styles from './ListPicker.module.css';

type Picker = ReturnType<typeof useListPicker>;

/** The search box above the list: what is typed filters it, the keys move through it. */
const SearchBox = ({
	label,
	picker,
	ref,
}: {
	label: string;
	picker: Picker;
	ref: RefObject<HTMLInputElement | null>;
}) => (
	<div className={styles.search}>
		<Icon name='search' size='sm' />
		<input
			aria-activedescendant={picker.activeId}
			aria-autocomplete='list'
			aria-controls={picker.listId}
			aria-expanded
			aria-label={label}
			autoComplete='off'
			className={styles.searchInput}
			onChange={(event) => picker.search(event.target.value)}
			placeholder={label}
			ref={ref}
			role='combobox'
			type='text'
			value={picker.query}
		/>
	</div>
);

/** The foot of a list where several can be picked: how many are, and the way to clear them. */
const Foot = ({
	picker,
	texts,
}: {
	picker: Picker;
	texts: ListPickerTexts;
}) => {
	const { locale } = useLocale();
	const count = picker.selected.length;

	return (
		<div className={styles.footer}>
			<span aria-live='polite'>
				{texts.selected?.(count, formatNumber(count, locale))}
			</span>
			<Button
				disabled={picker.selected.length === 0}
				onClick={picker.clear}
				size='sm'
				variant='ghost'
			>
				{texts.clear}
			</Button>
		</div>
	);
};

/** The list, what it says when the search leaves it empty, and its foot where several can be picked. */
const Options = ({
	multiple,
	picker,
	texts,
	values,
}: {
	multiple: boolean;
	picker: Picker;
	texts: ListPickerTexts;
	values: readonly string[];
}) => (
	<>
		<Listbox
			active={picker.active}
			aria-label={texts.list}
			className={styles.list}
			id={picker.listId}
			items={picker.items}
			multiple={multiple}
			query={picker.query}
			values={values}
		/>
		{picker.items.length === 0 && (
			<p className={styles.empty} role='status'>
				{texts.empty}
			</p>
		)}
		{multiple && <Foot picker={picker} texts={texts} />}
	</>
);

/** What the field says: what is picked in one line, and how many where several can be. */
const Value = ({
	count,
	placeholder,
	summary,
}: {
	count: number;
	placeholder: string;
	summary: string;
}) => (
	<>
		<span
			className={styles.value}
			data-placeholder={summary === '' || undefined}
		>
			{summary || placeholder}
		</span>
		{count > 0 && (
			<span aria-hidden className={styles.count}>
				{count}
			</span>
		)}
	</>
);

/**
 * The picker under SearchSelect and MultiSelect: a button with the look of a
 * field that says what is picked (a select-only `combobox`: a label names it and
 * its text is its value), and its list in a popup of the width of the field,
 * with a search box above it (`searchable`) and, where several can be picked
 * (`multiple`), a foot that counts them and clears them.
 *
 * Inside a Field it takes its label, hint, error and `required`. With a `name`
 * its form gets the value (one per option picked) and a reset of that form calls
 * `onReset`.
 *
 * @returns picker
 */
export const ListPicker = ({
	className,
	clearable = false,
	disabled = false,
	multiple,
	name,
	onReset,
	onValuesChange,
	options,
	searchable,
	size = 'md',
	texts,
	values,
	...props
}: ListPickerProps) => {
	const root = useRef<HTMLDivElement>(null);
	const trigger = useRef<HTMLButtonElement>(null);
	const search = useRef<HTMLInputElement>(null);
	const { required, ...field } = useFieldControl(props);
	const picker = useListPicker({
		multiple,
		onValuesChange,
		options,
		root,
		search,
		searchable,
		trigger,
		values,
	});
	const count = picker.selected.length;
	const summary = picker.selected.map(({ label }) => label).join(', ');
	const canClear = clearable && count > 0 && !disabled;

	useFormReset(trigger, onReset);

	return (
		<div
			className={cx(styles.root, className)}
			onBlur={picker.handleBlur}
			ref={root}
		>
			<button
				{...field}
				aria-activedescendant={searchable ? undefined : picker.activeId}
				aria-controls={picker.listId}
				aria-expanded={picker.isOpen}
				aria-haspopup='listbox'
				aria-required={required}
				className={cx(control.control, control[size], styles.trigger)}
				data-clearable={canClear || undefined}
				disabled={disabled}
				onClick={picker.toggle}
				onKeyDown={picker.handleKeyDown}
				onKeyUp={picker.handleKeyUp}
				ref={trigger}
				role='combobox'
				title={summary || undefined}
				type='button'
			>
				<Value
					count={multiple ? count : 0}
					placeholder={texts.placeholder}
					summary={summary}
				/>
			</button>

			{canClear && (
				<button
					aria-label={texts.clear}
					className={styles.clear}
					onClick={picker.clear}
					type='button'
				>
					<Icon name='close' size='xs' />
				</button>
			)}
			<Icon className={styles.indicator} name='chevron-down' size='sm' />

			{name !== undefined && (
				<HiddenInput
					disabled={disabled}
					name={name}
					value={multiple ? values : (values[0] ?? '')}
				/>
			)}

			<Popup
				anchor={root}
				className={styles.popup}
				matchWidth
				maxHeight={360}
				onClick={picker.handleClick}
				onKeyDown={picker.handleKeyDown}
				onMouseDown={(event) => {
					// a press on the popup keeps the focus where it is; its search box takes it
					if (event.target !== search.current) event.preventDefault();
				}}
				open={picker.isOpen}
			>
				{searchable && (
					<SearchBox
						label={texts.search}
						picker={picker}
						ref={search}
					/>
				)}
				<Options
					multiple={multiple}
					picker={picker}
					texts={texts}
					values={values}
				/>
			</Popup>
		</div>
	);
};

/** The texts of a picker. */
export interface ListPickerTexts {
	/** The button that takes the selection away. */
	clear: string;
	/** Shown when the search leaves no option. */
	empty: string;
	/** The name of the list, for assistive technology. */
	list: string;
	/** Shown in the field while nothing is picked. */
	placeholder: string;
	/** The name and the placeholder of the search box. */
	search: string;
	/** How many are picked, in the foot of a multiple picker: the count, and as the locale writes it. */
	selected?: (count: number, formatted: string) => string;
}

export interface ListPickerProps extends FieldControlProps {
	/** Several options can be picked: the list stays open and its foot counts them. */
	multiple: boolean;
	/** The options, grouped or not. */
	options: readonly ListItem[];
	/** A search box above the list. */
	searchable: boolean;
	texts: ListPickerTexts;
	/** The values picked. */
	values: readonly string[];
	'aria-label'?: string;
	'aria-labelledby'?: string;
	className?: string;
	/** A button in the field takes the selection away. */
	clearable?: boolean;
	disabled?: boolean;
	/** The name the values are sent with. */
	name?: string;
	size?: 'lg' | 'md' | 'sm';
	/** The form the picker is in was reset. */
	onReset: () => void;
	onValuesChange: (values: string[]) => void;
}
