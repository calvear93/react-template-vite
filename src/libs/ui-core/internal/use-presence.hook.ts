import { type RefObject, useLayoutEffect, useState } from 'react';

/** An animation that ends: an endless one (a spinner) is not a way out. */
const ends = (animation: Animation) =>
	Number.isFinite(animation.effect?.getComputedTiming().endTime);

/**
 * Keeps in the page what closes until its closing animation ends: a dialog, a
 * popup, a toast. While it leaves, the element carries `data-leaving` (set by the
 * component from `isLeaving`), which is what starts that animation in its
 * stylesheet. With nothing to wait for (no animation, reduced motion) it is gone
 * at once, in the same frame.
 *
 * Only the animations of the element itself count, not those of what is inside.
 *
 * @example
 * ```tsx
 * const { isLeaving, isPresent } = usePresence(open, panel);
 *
 * if (!isPresent) return null;
 *
 * return <div data-leaving={isLeaving || undefined} ref={panel} />;
 * ```
 *
 * @param open - whether it is open
 * @param ref - the element that animates its way out
 *
 * @returns whether to render it, and whether it is on its way out
 */
export const usePresence = (
	open: boolean,
	ref: RefObject<HTMLElement | null>,
) => {
	const [wasOpen, setWasOpen] = useState(open);
	const [isLeaving, setIsLeaving] = useState(false);

	// closing starts the way out; opening again cancels it
	if (open !== wasOpen) {
		setWasOpen(open);
		setIsLeaving(!open);
	}

	useLayoutEffect(() => {
		if (!isLeaving) return;

		const animations = (ref.current?.getAnimations() ?? []).filter(ends);

		if (animations.length === 0) {
			setIsLeaving(false);

			return;
		}

		let isCurrent = true;

		// finished or cancelled, it is over either way
		const leave = async () => {
			await Promise.allSettled(
				animations.map((animation) => animation.finished),
			);

			if (isCurrent) setIsLeaving(false);
		};

		void leave();

		return () => {
			isCurrent = false;
		};
	}, [isLeaving, ref]);

	return { isLeaving, isPresent: open || isLeaving };
};
