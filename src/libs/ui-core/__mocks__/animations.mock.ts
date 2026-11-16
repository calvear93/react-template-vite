import { onTestFinished, vi } from 'vitest';

/**
 * Gives every element one running animation the test ends (happy-dom runs no
 * stylesheet, so nothing ever animates there): the path of what waits for its
 * closing animation.
 *
 * @example
 * ```ts
 * const animations = mockAnimations();
 *
 * await act(() => animations.finish());
 * ```
 *
 * It is taken away when the test ends, whatever its outcome.
 *
 * @param endTime - when the animation ends; `Infinity` for one that never does
 *
 * @returns the control of the mock
 */
export const mockAnimations = (endTime = 120) => {
	const pending = new Set<() => void>();

	const spy = vi
		.spyOn(HTMLElement.prototype, 'getAnimations')
		.mockImplementation(() => [
			{
				effect: { getComputedTiming: () => ({ endTime }) },
				finished: new Promise<void>((resolve) => {
					pending.add(resolve);
				}),
			} as unknown as Animation,
		]);

	const restore = () => spy.mockRestore();

	// a test that fails before its end must not leave it to the next one
	onTestFinished(restore);

	return {
		restore,
		/** Ends every animation asked for so far. */
		finish: async () => {
			for (const resolve of pending) resolve();

			pending.clear();
			await Promise.resolve();
		},
	};
};
