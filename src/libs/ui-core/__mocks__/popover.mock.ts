import { onTestFinished, vi } from 'vitest';

/**
 * Gives elements the Popover API happy-dom lacks (`showPopover`, `hidePopover`), as
 * spies: a test of the enhanced path of a popup. Without it the fallback path runs.
 *
 * @example
 * ```ts
 * const popover = mockPopover();
 *
 * expect(popover.showPopover).toHaveBeenCalledOnce();
 * popover.restore();
 * ```
 *
 * @returns the spies and the function that takes them away
 */
export const mockPopover = () => {
	const prototype = HTMLElement.prototype as Partial<HTMLElement>;
	const showPopover = vi.fn();
	const hidePopover = vi.fn();

	const restore = () => {
		delete prototype.showPopover;
		delete prototype.hidePopover;
	};

	prototype.showPopover = showPopover;
	prototype.hidePopover = hidePopover;
	// a test that fails before its end must not leave it to the next one
	onTestFinished(restore);

	return { hidePopover, restore, showPopover };
};
