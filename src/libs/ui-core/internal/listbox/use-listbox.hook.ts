import { type KeyboardEvent, useEffect, useRef, useState } from 'react';
import { fold } from '../fold.ts';
import { firstEnabled, foldedLabel, type ListOption } from './listbox.model.ts';

/** Letters typed with less than this between them are one word to jump to. */
const TYPING_PAUSE = 600;

/**
 * The keys go on the first option that can be picked, whatever the list shows by
 * then: what `setActive` takes after a search, whose results are not known yet.
 */
export const FIRST_OPTION = -2;

/**
 * The id of an option of a list: what `aria-activedescendant` points at.
 *
 * @param listId - the id of the list
 * @param index - the place of the option among those shown
 *
 * @returns the id of the option
 */
export const optionId = (listId: string, index: number) => `${listId}-${index}`;

/**
 * The keyboard of a list whose focus stays elsewhere (the box that opens it, its
 * search): which option the keys are on, moved with the arrows (disabled options
 * skipped, no wrapping around), picked with Enter. With `typeToJump` (no search
 * box to type in) Home and End go to the ends, Space picks too and typing goes
 * to the option that starts with what was typed.
 *
 * @param options - the list: its id, the options shown, and what picking does
 *
 * @returns the option the keys are on and the handler of the keys
 */
export const useListbox = ({
	listId,
	onPick,
	options,
	typeToJump,
}: {
	listId: string;
	options: readonly ListOption[];
	typeToJump: boolean;
	onPick: (option: ListOption) => void;
}) => {
	const [place, setPlace] = useState(-1);
	const active = place === FIRST_OPTION ? firstEnabled(options) : place;
	const typed = useRef({ at: 0, text: '' });

	// the option the keys are on stays in sight
	useEffect(() => {
		if (active < 0) return;

		const node = document.getElementById(optionId(listId, active));

		if (typeof node?.scrollIntoView === 'function')
			node.scrollIntoView({ block: 'nearest' });
	}, [active, listId]);

	/**
	 * The next option that can be picked from one, forwards or backwards; itself at the
	 * end. From outside the list (before its first option, after its last) with none
	 * to pick, there is no option to be on: -1, never a place the list does not have.
	 */
	const next = (from: number, step: -1 | 1) => {
		for (
			let index = from + step;
			index >= 0 && index < options.length;
			index += step
		)
			if (!options[index]?.disabled) return index;

		return from >= 0 && from < options.length ? from : -1;
	};

	const jump = (letter: string, at: number) => {
		const text =
			at - typed.current.at > TYPING_PAUSE
				? letter
				: typed.current.text + letter;
		const found = options.findIndex(
			(option) =>
				!option.disabled && foldedLabel(option).startsWith(text),
		);

		typed.current = { at, text };

		if (found >= 0) setPlace(found);
	};

	const moves: Record<string, (() => number) | undefined> = {
		ArrowDown: () => next(active, 1),
		ArrowUp: () => next(active < 0 ? options.length : active, -1),
		...(typeToJump && {
			End: () => next(options.length, -1),
			Home: () => next(-1, 1),
		}),
	};

	const handleKeyDown = (event: KeyboardEvent) => {
		const move = moves[event.key];
		const isLetter =
			event.key.length === 1 &&
			!event.ctrlKey &&
			!event.metaKey &&
			!event.altKey;

		if (move) {
			event.preventDefault();
			setPlace(move());
		} else if (event.key === 'Enter' || (typeToJump && event.key === ' ')) {
			const option = options[active];

			event.preventDefault();

			if (option && !option.disabled) onPick(option);
		} else if (typeToJump && isLetter)
			jump(fold(event.key), event.timeStamp);
	};

	return {
		activeId: active >= 0 ? optionId(listId, active) : undefined,
		active,
		handleKeyDown,
		setActive: setPlace,
	};
};
