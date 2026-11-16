import { useTexts } from '../../i18n/texts.hook.ts';
import { defined } from '../../internal/defined.ts';
import { type FieldControlProps } from '../../internal/field/use-field-control.hook.ts';
import { type ListItem } from '../../internal/listbox/listbox.model.ts';
import {
	ListPicker,
	type ListPickerTexts,
} from '../../internal/listbox/ListPicker.tsx';
import { useControllableState } from '../../internal/use-controllable-state.hook.ts';

/**
 * One option of a long list the app already has (comunas, companies, codes): a
 * field that opens its list with a search box above it. Typing filters, accents
 * and case aside; the arrows move, Enter picks and closes, Escape closes. The
 * options may come in groups, which are only headings.
 *
 * For a handful of options use Select; for options that come from an API as the
 * person types, Combobox; for several at once, MultiSelect. Inside a Field it
 * takes its label, hint and error; with a `name` its form gets the value.
 *
 * @example
 * ```tsx
 * <Field label='City'>
 *   <SearchSelect
 *     name='city'
 *     options={[
 *       { label: 'Oregon', options: [{ value: 'portland', label: 'Portland' }] },
 *       { label: 'Washington', options: [{ value: 'seattle', label: 'Seattle' }] },
 *     ]}
 *     value={city}
 *     onValueChange={setCity}
 *   />
 * </Field>
 * ```
 *
 * @returns select with search
 */
export const SearchSelect = ({
	defaultValue = '',
	labels,
	onValueChange,
	placeholder,
	value,
	...props
}: SearchSelectProps) => {
	const [selected, setSelected] = useControllableState({
		defaultValue,
		onChange: onValueChange,
		value,
	});

	return (
		<ListPicker
			{...props}
			multiple={false}
			onReset={() => setSelected(defaultValue)}
			onValuesChange={([picked = '']) => setSelected(picked)}
			searchable
			texts={{
				...useTexts().searchSelect,
				...defined(labels),
				...(placeholder !== undefined && { placeholder }),
			}}
			values={selected === '' ? [] : [selected]}
		/>
	);
};

/** An option of a SearchSelect or a MultiSelect. */
export type { ListOption as SelectListOption } from '../../internal/listbox/listbox.model.ts';

/** Options of a SearchSelect or a MultiSelect under a heading; it selects nothing. */
export type { ListGroup as SelectListGroup } from '../../internal/listbox/listbox.model.ts';

export interface SearchSelectProps extends FieldControlProps {
	/** The options, or groups of them (`{ label, options }`). */
	options: readonly ListItem[];
	'aria-label'?: string;
	'aria-labelledby'?: string;
	className?: string;
	/** A button in the field takes the selection away. */
	clearable?: boolean;
	/** The value it starts with, and goes back to when its form is reset. */
	defaultValue?: string;
	disabled?: boolean;
	labels?: Partial<ListPickerTexts>;
	/** The name the value is sent with. */
	name?: string;
	/** Shown while nothing is picked. */
	placeholder?: string;
	size?: 'lg' | 'md' | 'sm';
	/** The value of the option picked; `''` for none. Makes it controlled. */
	value?: string;
	onValueChange?: (value: string) => void;
}
