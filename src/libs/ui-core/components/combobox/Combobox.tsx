import {
	type ComponentProps,
	memo,
	type ReactNode,
	useId,
	useRef,
} from 'react';
import { type UiTexts } from '../../i18n/en.ts';
import { useTexts } from '../../i18n/texts.hook.ts';
import { Icon } from '../../icon/Icon.tsx';
import { cx } from '../../internal/cx.ts';
import { defined } from '../../internal/defined.ts';
import { useFieldControl } from '../../internal/field/use-field-control.hook.ts';
import { HiddenInput } from '../../internal/hidden-input/HiddenInput.tsx';
import { mergeRefs } from '../../internal/merge-refs.ts';
import { Popup } from '../../internal/popup/Popup.tsx';
import { Highlight } from '../highlight/Highlight.tsx';
import {
	type ComboboxNote,
	type ComboboxOptions,
	useCombobox,
} from './combobox.hook.ts';
import control from '../../internal/control/control.module.css';
import styles from './Combobox.module.css';

/** What the line under the box says, and whether it is something wrong. */
const noteOf = (
	note: ComboboxNote,
	isChecked: boolean,
	texts: UiTexts['combobox'],
) => ({
	isWrong: note === 'error' || (isChecked && note === 'none'),
	message: {
		empty: texts.empty,
		error: texts.error,
		none: isChecked ? texts.unpicked : '',
		searching: texts.searching,
	}[note],
});

const Indicator = ({ isSearching }: { isSearching: boolean }) => (
	<span
		aria-hidden
		className={styles.indicator}
		data-searching={isSearching || undefined}
	>
		<Icon name={isSearching ? 'loader' : 'search'} size='sm' />
	</span>
);

const Result = <T,>({
	id,
	getLabel,
	index,
	isActive,
	item,
	query,
	renderOption,
}: {
	id: string;
	index: number;
	isActive: boolean;
	item: T;
	query: string;
	getLabel: (item: T) => string;
	renderOption?: (item: T, query: string) => ReactNode;
}) => (
	<div
		aria-selected={isActive}
		className={styles.option}
		data-index={index}
		id={id}
		role='option'
	>
		{renderOption ? (
			renderOption(item, query)
		) : (
			<Highlight query={query} text={getLabel(item)} />
		)}
	</div>
);

/**
 * A result of the list. Memoized by hand, the one exception to the React
 * Compiler doing it: it keeps a `.map` as a whole, not each of its elements, and
 * an arrow key would draw every result again.
 */
const ComboboxResult = memo(Result) as typeof Result;

/**
 * A search box that finds one of many: what is typed goes to `search` once the
 * typing stops, and its results hang under the box. The focus stays in the box:
 * the arrows move through the results, Enter picks, Escape closes only the list.
 * A late answer never replaces a newer one (`search` gets an `AbortSignal` to
 * cancel its request). How the search goes («Searching…», «No results») is
 * said under the box, to assistive technology too.
 *
 * It keeps what was picked: the box shows its label, `onValueChange` gets the
 * item (null once the text is edited) and `name` sends its key with the form;
 * leaving a text that was not picked is said under the box. With `clearOnPick`
 * nothing is kept: the box empties after each pick, ready for the next one (to
 * add people to a list). A reset of its form puts it back to `defaultValue`.
 * `className` goes to the wrapper; every other prop and the `ref` go to the
 * input. Its `onChange` is the one of that input: it hears what is typed in the
 * box, not a result that is picked, which `onValueChange` hears.
 *
 * @example
 * ```tsx
 * <Field label='City'>
 *   <Combobox
 *     name='city'
 *     getKey={(city) => city.code}
 *     getLabel={(city) => city.name}
 *     search={(text, signal) => api.cities(text, { signal })}
 *     onValueChange={setCity}
 *   />
 * </Field>
 * ```
 *
 * @returns combobox
 */
export const Combobox = <T,>({
	className,
	clearOnPick,
	defaultValue,
	delay,
	getKey,
	getLabel,
	labels,
	minLength,
	name,
	onBlur,
	onChange,
	onKeyDown,
	onValueChange,
	ref,
	renderOption,
	search,
	size = 'md',
	value,
	...props
}: ComboboxProps<T>) => {
	const noteId = useId();
	const anchor = useRef<HTMLSpanElement>(null);
	const input = useRef<HTMLInputElement>(null);
	const list = useRef<HTMLDivElement>(null);
	const field = useFieldControl(props);
	const keyOf = getKey ?? getLabel;
	const box = useCombobox({
		clearOnPick,
		defaultValue,
		delay,
		getLabel,
		input,
		list,
		minLength,
		onValueChange,
		search,
		value,
	});
	const texts = { ...useTexts().combobox, ...defined(labels) };
	const { isWrong, message } = noteOf(box.note, box.isChecked, texts);

	return (
		<div className={cx(styles.root, className)}>
			<span className={styles.field} ref={anchor}>
				<input
					autoComplete='off'
					type='text'
					{...field}
					aria-activedescendant={box.activeId}
					aria-autocomplete='list'
					aria-controls={box.isOpen ? box.listId : undefined}
					aria-describedby={cx(
						field['aria-describedby'],
						message && noteId,
					)}
					aria-expanded={box.isOpen}
					aria-invalid={isWrong ? true : field['aria-invalid']}
					className={cx(control.control, control[size], styles.input)}
					onBlur={(event) => {
						box.handleBlur();
						onBlur?.(event);
					}}
					onChange={(event) => {
						box.handleChange(event);
						onChange?.(event);
					}}
					onKeyDown={(event) => {
						onKeyDown?.(event);
						box.handleKeyDown(event);
					}}
					ref={mergeRefs(input, ref)}
					role='combobox'
					value={box.text}
				/>
				<Indicator isSearching={box.note === 'searching'} />
			</span>

			{name && (
				<HiddenInput
					disabled={props.disabled}
					form={props.form}
					name={name}
					value={box.selected ? keyOf(box.selected) : ''}
				/>
			)}
			<span
				aria-live='polite'
				className={cx(
					styles.note,
					isWrong ? control.error : control.hint,
				)}
				id={noteId}
			>
				{message}
			</span>

			<Popup
				anchor={anchor}
				aria-label={texts.list}
				className={styles.list}
				id={box.listId}
				matchWidth
				onClick={box.handleListClick}
				onMouseDown={(event) => {
					// the focus stays in the box while a result is pressed
					event.preventDefault();
				}}
				open={box.isOpen}
				ref={list}
				role='listbox'
			>
				{box.items.map((item, index) => (
					<ComboboxResult
						getLabel={getLabel}
						id={`${box.listId}-${index}`}
						index={index}
						isActive={index === box.active}
						item={item}
						key={keyOf(item)}
						query={box.searched}
						renderOption={renderOption}
					/>
				))}
			</Popup>
		</div>
	);
};

export interface ComboboxProps<T>
	extends
		Omit<ComboboxOptions<T>, 'input' | 'list'>,
		Omit<
			ComponentProps<'input'>,
			'defaultValue' | 'role' | 'size' | 'type' | 'value'
		> {
	labels?: Partial<UiTexts['combobox']>;
	/** The name the key of the item picked is sent with. */
	name?: string;
	size?: 'lg' | 'md' | 'sm';
	/** What tells an item from the others, and what `name` sends. Default: its label. */
	getKey?: (item: T) => string;
	/** Draws a result; `query` is the text it was found for. Default: its label, with that text marked in it. */
	renderOption?: (item: T, query: string) => ReactNode;
}
