import {
	type FocusEvent,
	type KeyboardEvent,
	type MouseEvent,
	type RefObject,
	useEffect,
	useId,
	useRef,
	useState,
} from 'react';
import { useOutsidePress } from '../use-outside-press.hook.ts';
import {
	filterOptions,
	firstEnabled,
	flattenOptions,
	type ListItem,
	type ListOption,
} from './listbox.model.ts';
import { FIRST_OPTION, useListbox } from './use-listbox.hook.ts';

/**
 * The behaviour of a picker of known options (SearchSelect, MultiSelect): its
 * list open or closed, what is typed in its search and the options left, the
 * option the keys are on, and what picking does: one value and the list closes,
 * or several (kept in the order of the list) and it stays.
 *
 * The focus is on the search box while the list is open, or stays on the button
 * when there is none; a press or a focus outside closes the list, and Escape
 * closes it alone (not the dialog it may be in).
 *
 * @param options - the options, the values picked, and the elements involved
 *
 * @returns the state of the picker and its handlers
 */
export const useListPicker = ({
	multiple,
	onValuesChange,
	options,
	root,
	search,
	searchable,
	trigger,
	values,
}: {
	multiple: boolean;
	options: readonly ListItem[];
	root: RefObject<HTMLElement | null>;
	search: RefObject<HTMLElement | null>;
	searchable: boolean;
	trigger: RefObject<HTMLElement | null>;
	values: readonly string[];
	onValuesChange: (values: string[]) => void;
}) => {
	const listId = useId();
	const isSpaceTaken = useRef(false);
	const [isOpen, setIsOpen] = useState(false);
	const [query, setQuery] = useState('');
	const all = flattenOptions(options);
	const items = filterOptions(options, query);
	const picked = new Set(values);

	const close = (returnFocus: boolean) => {
		setIsOpen(false);

		if (returnFocus) trigger.current?.focus();
	};

	const pick = (option: ListOption) => {
		if (!multiple) {
			onValuesChange([option.value]);
			close(true);

			return;
		}

		const next = new Set(values);

		if (!next.delete(option.value)) next.add(option.value);

		// in the order of the list, whatever the order they were picked in
		onValuesChange(
			all
				.filter(({ value }) => next.has(value))
				.map(({ value }) => value),
		);
	};

	const shown = flattenOptions(items);
	const listbox = useListbox({
		listId,
		onPick: pick,
		options: shown,
		typeToJump: !searchable,
	});

	const open = () => {
		const selected = all.findIndex(
			(option) => !option.disabled && picked.has(option.value),
		);

		setQuery('');
		setIsOpen(true);
		listbox.setActive(selected >= 0 ? selected : firstEnabled(all));
	};

	useOutsidePress(isOpen, [root], () => setIsOpen(false));

	// the search box takes the focus when the list opens: typing filters at once
	useEffect(() => {
		if (isOpen && searchable) search.current?.focus();
	}, [isOpen, search, searchable]);

	const handleKeyDown = (event: KeyboardEvent) => {
		const isOwner =
			event.target === trigger.current || event.target === search.current;

		if (!isOpen) {
			// the arrows open the list; Enter and Space do, as the click of the button
			if (isOwner && /^Arrow(?:Down|Up)$/u.test(event.key)) {
				event.preventDefault();
				open();
			}
		} else if (event.key === 'Escape') {
			// closes the list, not the dialog it may be in
			event.preventDefault();
			event.stopPropagation();
			close(true);
		} else if (isOwner) {
			isSpaceTaken.current = event.key === ' ' && !searchable;
			listbox.handleKeyDown(event);
		}
	};

	return {
		// closed, the keys are on no option
		activeId: isOpen ? listbox.activeId : undefined,
		listId,
		active: listbox.active,
		handleKeyDown,
		isOpen,
		items,
		query,
		selected: all.filter(({ value }) => picked.has(value)),
		clear: () => {
			onValuesChange([]);
			trigger.current?.focus();
		},
		handleBlur: (event: FocusEvent) => {
			if (!root.current?.contains(event.relatedTarget)) setIsOpen(false);
		},
		handleClick: (event: MouseEvent) => {
			// a press on an option, wherever in it: the list tells its place
			const node = (event.target as Element).closest<HTMLElement>(
				'[data-index]',
			);
			const option = shown[Number(node?.dataset.index)];

			if (option && !option.disabled) pick(option);
		},
		handleKeyUp: (event: KeyboardEvent) => {
			// a Space that picked an option is not also the click of the button
			if (event.key === ' ' && isSpaceTaken.current)
				event.preventDefault();

			isSpaceTaken.current = false;
		},
		search: (text: string) => {
			// on the first option left, once the list is filtered: one filter per key
			setQuery(text);
			listbox.setActive(FIRST_OPTION);
		},
		toggle: () => {
			if (isOpen) close(false);
			else open();
		},
	};
};
