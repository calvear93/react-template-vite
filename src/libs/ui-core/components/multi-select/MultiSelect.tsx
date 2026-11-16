import { useTexts } from '../../i18n/texts.hook.ts';
import { defined } from '../../internal/defined.ts';
import { type FieldControlProps } from '../../internal/field/use-field-control.hook.ts';
import { type ListItem } from '../../internal/listbox/listbox.model.ts';
import {
	ListPicker,
	type ListPickerTexts,
} from '../../internal/listbox/ListPicker.tsx';
import { useControllableState } from '../../internal/use-controllable-state.hook.ts';

const NONE: readonly string[] = [];

/**
 * Several options of a list at once: a field that opens its list, each option
 * with a box. Closed, it says what is picked in one line (the names, cut with an
 * ellipsis) and how many: the field never grows. Picking keeps the list open;
 * its foot counts what is picked and clears it. The options may come in groups,
 * which are only headings: a group does not select its options. `searchable`
 * adds a search box for a long list.
 *
 * Inside a Field it takes its label, hint and error; with a `name` its form gets
 * one value per option picked (`formData.getAll(name)`).
 *
 * @example
 * ```tsx
 * <Field label='Statuses'>
 *   <MultiSelect
 *     name='state'
 *     options={[
 *       { value: 'open', label: 'Open' },
 *       { value: 'review', label: 'In review' },
 *       { value: 'closed', label: 'Closed' },
 *     ]}
 *     value={states}
 *     onValueChange={setStates}
 *   />
 * </Field>
 * ```
 *
 * @returns multiple select
 */
export const MultiSelect = ({
	defaultValue = NONE,
	labels,
	onValueChange,
	placeholder,
	searchable = false,
	value,
	...props
}: MultiSelectProps) => {
	const [selected, setSelected] = useControllableState({
		defaultValue,
		onChange: onValueChange,
		value,
	});

	return (
		<ListPicker
			{...props}
			multiple
			onReset={() => setSelected(defaultValue)}
			onValuesChange={setSelected}
			searchable={searchable}
			texts={{
				...useTexts().multiSelect,
				...defined(labels),
				...(placeholder !== undefined && { placeholder }),
			}}
			values={selected}
		/>
	);
};

export interface MultiSelectProps extends FieldControlProps {
	/** The options, or groups of them (`{ label, options }`). */
	options: readonly ListItem[];
	'aria-label'?: string;
	'aria-labelledby'?: string;
	className?: string;
	/** The values it starts with, and goes back to when its form is reset. */
	defaultValue?: readonly string[];
	disabled?: boolean;
	labels?: Partial<ListPickerTexts>;
	/** The name the values are sent with, one per option picked. */
	name?: string;
	/** Shown while nothing is picked. */
	placeholder?: string;
	/** A search box above the list, for a long one. */
	searchable?: boolean;
	size?: 'lg' | 'md' | 'sm';
	/** The values of the options picked, in the order of the list. Makes it controlled. */
	value?: readonly string[];
	onValueChange?: (values: readonly string[]) => void;
}
