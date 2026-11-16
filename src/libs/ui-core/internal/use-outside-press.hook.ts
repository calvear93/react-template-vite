import { type RefObject, useEffect } from 'react';

/**
 * Tells when the pointer is pressed outside of some elements: what closes a menu
 * or a list that is open. It listens only while `active`.
 *
 * @example
 * ```ts
 * useOutsidePress(isOpen, [trigger, panel], () => setIsOpen(false));
 * ```
 *
 * @param active - whether to listen
 * @param inside - the elements a press does not count on
 * @param onPress - called on a press outside of them all
 */
export const useOutsidePress = (
	active: boolean,
	inside: readonly RefObject<HTMLElement | null>[],
	onPress: () => void,
) => {
	useEffect(() => {
		if (!active) return;

		const handlePress = (event: PointerEvent) => {
			const target = event.target;

			if (
				target instanceof Node &&
				!inside.some((ref) => ref.current?.contains(target))
			)
				onPress();
		};

		document.addEventListener('pointerdown', handlePress, true);

		return () => {
			document.removeEventListener('pointerdown', handlePress, true);
		};
	}, [active, inside, onPress]);
};
