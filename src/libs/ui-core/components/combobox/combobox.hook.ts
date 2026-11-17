import {
	type ChangeEvent,
	type KeyboardEvent,
	type MouseEvent,
	type RefObject,
	useEffect,
	useId,
	useRef,
	useState,
} from 'react';
import { useControllableState } from '../../internal/use-controllable-state.hook.ts';
import { useDebouncedCallback } from '../../internal/use-debounced-callback.hook.ts';
import { useFormReset } from '../../internal/use-form-reset.hook.ts';

/** What the line under the box says: nothing, or how the search is going. */
export type ComboboxNote = 'empty' | 'error' | 'none' | 'searching';

/** What a Combobox needs to search and to keep what was picked. */
export interface ComboboxOptions<T> {
	/** The box: what a reset of its form is heard from. */
	input: RefObject<HTMLInputElement | null>;
	/** The list of results: where the one the arrows reach is brought into view. */
	list: RefObject<HTMLDivElement | null>;
	/** Keeps nothing: after a pick the box empties, and `onValueChange` got the item. */
	clearOnPick?: boolean;
	/** The item picked at first, uncontrolled. */
	defaultValue?: T | null;
	/** How long the typing must stop before the search, in milliseconds. */
	delay?: number;
	/** How many letters a search needs. */
	minLength?: number;
	/** The item picked, controlled (null for none). */
	value?: T | null;
	/** The text of an item: what its result says and the box shows once picked. */
	getLabel: (item: T) => string;
	/** Finds the items of a text; it may throw. The signal aborts with a newer search. */
	search: (
		query: string,
		signal: AbortSignal,
	) => Promise<readonly T[]> | readonly T[];
	/** The item picked, or null once the text is edited. */
	onValueChange?: (item: T | null) => void;
}

/**
 * The behaviour of a Combobox: the text of its box, the search it runs once the
 * typing stops (a late answer never replaces a newer one), the results and the
 * one the arrows are on, and the item it keeps.
 *
 * @param options - how to search, what to keep and whom to tell
 *
 * @returns the state of the box and of its list, their refs and their handlers
 */
export const useCombobox = <T>({
	clearOnPick = false,
	defaultValue = null,
	delay = 250,
	getLabel,
	input,
	list,
	minLength = 2,
	onValueChange,
	search,
	value,
}: ComboboxOptions<T>) => {
	const listId = useId();
	const request = useRef<AbortController>(null);
	const [selected, select] = useControllableState<T | null>({
		defaultValue,
		onChange: onValueChange,
		value,
	});
	const [lastSelected, setLastSelected] = useState(selected);
	const [text, setText] = useState(() =>
		selected ? getLabel(selected) : '',
	);
	const [items, setItems] = useState<readonly T[]>([]);
	// what the results in sight were found for: it is what they mark, whatever is typed since
	const [searched, setSearched] = useState('');
	const [active, setActive] = useState(-1);
	const [isOpen, setIsOpen] = useState(false);
	const [note, setNote] = useState<ComboboxNote>('none');
	const [isChecked, setIsChecked] = useState(false);

	// a value from outside shows its label; one dropped by typing leaves the text alone
	if (selected !== lastSelected) {
		setLastSelected(selected);

		if (selected) setText(getLabel(selected));
		else if (lastSelected && text === getLabel(lastSelected)) setText('');
	}

	const lookUp = async (query: string) => {
		const mine = new AbortController();

		// the answer of an older search is of no use
		request.current?.abort();
		request.current = mine;

		try {
			const found = await search(query, mine.signal);

			if (mine.signal.aborted) return;

			setItems(found);
			setSearched(query);
			setActive(found.length > 0 ? 0 : -1);
			setIsOpen(found.length > 0);
			setNote(found.length > 0 ? 'none' : 'empty');
		} catch {
			if (mine.signal.aborted) return;

			setIsOpen(false);
			setNote('error');
		}
	};

	const typing = useDebouncedCallback((query: string) => {
		void lookUp(query);
	}, delay);

	// a search still on its way has nobody to answer to
	useEffect(() => () => request.current?.abort(), []);

	// the result the arrows reach is brought into view
	useEffect(() => {
		list.current
			?.querySelector('[aria-selected="true"]')
			?.scrollIntoView({ block: 'nearest' });
	}, [active, list]);

	/** Closing also drops the pending search: a late answer never reopens the list. */
	const close = () => {
		typing.cancel();
		request.current?.abort();
		setIsOpen(false);
		setActive(-1);
		setNote('none');
	};

	const pick = (item: T) => {
		close();
		setIsChecked(false);

		if (clearOnPick) {
			setText('');
			onValueChange?.(item);

			return;
		}

		setText(getLabel(item));
		select(item);
	};

	// a reset form («Clear») puts the box back to its first value
	useFormReset(input, () => {
		close();
		setIsChecked(false);
		setText(defaultValue ? getLabel(defaultValue) : '');

		if (selected !== defaultValue) select(defaultValue);
	});

	const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
		const typed = event.target.value;
		const query = typed.trim();

		setText(typed);
		setIsChecked(false);

		// what is typed is no longer what was picked
		if (selected) select(null);

		if (query.length < minLength) {
			close();

			return;
		}

		request.current?.abort();
		setNote('searching');
		typing.run(query);
	};

	const handleEnter = (event: KeyboardEvent<HTMLInputElement>) => {
		// Enter never sends the form from a search that is open or on its way
		if (isOpen || note === 'searching') event.preventDefault();
		if (isOpen && active >= 0) pick(items[active]);
	};

	const handleArrow = (
		event: KeyboardEvent<HTMLInputElement>,
		step: number,
	) => {
		const query = text.trim();

		if (isOpen) {
			event.preventDefault();
			setActive(Math.max(0, Math.min(active + step, items.length - 1)));
		} else if (step > 0 && query.length >= minLength) {
			// ↓ on a closed box looks again for what it holds
			event.preventDefault();
			setNote('searching');
			void lookUp(query);
		}
	};

	const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
		if (event.key === 'ArrowDown') handleArrow(event, 1);
		if (event.key === 'ArrowUp') handleArrow(event, -1);
		if (event.key === 'Enter') handleEnter(event);

		if (event.key === 'Escape' && (isOpen || note === 'searching')) {
			// only the list closes: not the dialog the box may be in
			event.preventDefault();
			event.stopPropagation();
			close();
		}
	};

	/** The focus left the box: its list closes, and a text left unpicked is said. */
	const handleBlur = () => {
		close();
		setIsChecked(!clearOnPick && !selected && text.trim() !== '');
	};

	const handleListClick = (event: MouseEvent<HTMLDivElement>) => {
		const option =
			event.target instanceof Element
				? event.target.closest<HTMLElement>('[role="option"]')
				: null;

		if (option) pick(items[Number(option.dataset.index)]);
	};

	return {
		activeId: isOpen && active >= 0 ? `${listId}-${active}` : undefined,
		listId,
		active,
		handleBlur,
		handleChange,
		handleKeyDown,
		handleListClick,
		isChecked,
		isOpen,
		items,
		note,
		searched,
		selected,
		text,
	};
};
