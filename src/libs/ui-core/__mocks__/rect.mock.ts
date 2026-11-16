import { vi } from 'vitest';

/**
 * Gives an element a box (happy-dom lays nothing out: every rect is zeros), for a
 * test of something that is placed next to it.
 *
 * @example
 * ```ts
 * mockRect(screen.getByRole('button'), { top: 100, left: 40, width: 120, height: 40 });
 * ```
 *
 * @param element - the element to measure
 * @param box - its position and size on the viewport
 *
 * @returns the spy on its getBoundingClientRect
 */
export const mockRect = (
	element: Element,
	box: { height: number; left: number; top: number; width: number },
) =>
	vi.spyOn(element, 'getBoundingClientRect').mockReturnValue({
		...box,
		bottom: box.top + box.height,
		right: box.left + box.width,
		x: box.left,
		y: box.top,
		toJSON: () => box,
	});
