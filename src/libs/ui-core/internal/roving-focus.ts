import { type KeyboardEvent } from 'react';

export interface RovingFocusOptions {
	/** Which items take part, among the descendants of the container. */
	selector: string;
	/** The element that holds the items. Default: the one that got the event. */
	container?: Element | null;
	/** From the last item the next one is the first, and back. */
	loop?: boolean;
	/** The arrows that move: left and right, or up and down. */
	orientation?: 'horizontal' | 'vertical';
}

/**
 * Moves the focus between the items of a composite widget (a tab list, a menu)
 * with the arrow keys, Home and End: one Tab stop for the whole widget. Call it
 * from the `onKeyDown` of the container, or of an item giving its `container`;
 * the items are read from the DOM in their order, skipping the disabled ones.
 *
 * @example
 * ```tsx
 * <div role='tablist' onKeyDown={(event) => {
 *   const tab = moveRovingFocus(event, { selector: '[role="tab"]' });
 * }} />
 * ```
 *
 * @param event - the keydown of the container
 * @param options - which items, in which direction
 *
 * @returns the item that took the focus, or undefined when the key moved nothing
 */
export const moveRovingFocus = (
	event: KeyboardEvent<HTMLElement>,
	{
		container,
		loop = true,
		orientation = 'horizontal',
		selector,
	}: RovingFocusOptions,
) => {
	const items = [
		...(container ?? event.currentTarget).querySelectorAll<HTMLElement>(
			selector,
		),
	].filter(
		(item) =>
			item.getAttribute('aria-disabled') !== 'true' &&
			!item.matches(':disabled'),
	);
	const index = items.indexOf(document.activeElement as HTMLElement);
	const last = items.length - 1;
	const [previousKey, nextKey] =
		orientation === 'horizontal'
			? ['ArrowLeft', 'ArrowRight']
			: ['ArrowUp', 'ArrowDown'];
	const step = (to: number) => {
		if (loop) return (to + items.length) % items.length;

		return Math.max(0, Math.min(last, to));
	};
	const moves: Record<string, number> = {
		End: last,
		Home: 0,
		[nextKey]: step(index + 1),
		[previousKey]: step(index < 0 ? last : index - 1),
	};
	const target = event.key in moves ? items[moves[event.key]] : undefined;

	if (!target) return;

	event.preventDefault();
	target.focus();

	return target;
};
