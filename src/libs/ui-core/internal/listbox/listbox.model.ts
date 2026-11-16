import { fold } from '../fold.ts';

/** An option of a list: what is shown and what is sent. */
export interface ListOption {
	label: string;
	value: string;
	disabled?: boolean;
}

/** Options under a heading. The group is only that heading: it selects nothing. */
export interface ListGroup {
	label: string;
	options: readonly ListOption[];
}

export type ListItem = ListGroup | ListOption;

export const isGroup = (item: ListItem): item is ListGroup => 'options' in item;

/**
 * The options of a list in the order they are shown, groups opened.
 *
 * @param items - options and groups of options
 *
 * @returns every option, in order
 */
export const flattenOptions = (items: readonly ListItem[]): ListOption[] =>
	items.flatMap((item) => (isGroup(item) ? item.options : [item]));

/** The label of each option, folded once: a search asks for it at every key. */
const FOLDS = new WeakMap<ListOption, { label: string; text: string }>();

/**
 * The label of an option without accents and in lower case: what a search and a
 * jump to a letter compare. Folded once per option, and again if its label changes.
 *
 * @param option - the option
 *
 * @returns its label, folded
 */
export const foldedLabel = (option: ListOption) => {
	const known = FOLDS.get(option);

	if (known?.label === option.label) return known.text;

	const text = fold(option.label);

	FOLDS.set(option, { label: option.label, text });

	return text;
};

/**
 * The place of the first option that can be picked.
 *
 * @param options - the options, in order
 *
 * @returns its place, or -1 when none can be
 */
export const firstEnabled = (options: readonly ListOption[]) =>
	options.findIndex((option) => !option.disabled);

/**
 * The options whose label has every word of a search, accents and case aside. A
 * group stays while it has an option left; an empty search keeps the list as it is.
 *
 * @example
 * ```ts
 * filterOptions([{ label: 'North', options: [{ label: 'Arica', value: 'arica' }] }], 'ari');
 * ```
 *
 * @param items - options and groups of options
 * @param query - what was typed
 *
 * @returns the items that match, groups without matches left out
 */
export const filterOptions = (
	items: readonly ListItem[],
	query: string,
): readonly ListItem[] => {
	const words = fold(query).split(/\s+/u).filter(Boolean);

	if (words.length === 0) return items;

	const matches = (option: ListOption) => {
		const text = foldedLabel(option);

		return words.every((word) => text.includes(word));
	};

	return items.flatMap((item): ListItem[] => {
		if (!isGroup(item)) return matches(item) ? [item] : [];

		const options = item.options.filter(matches);

		return options.length > 0 ? [{ ...item, options }] : [];
	});
};
