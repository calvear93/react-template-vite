import { onTestFinished, vi } from 'vitest';

/**
 * Replaces `matchMedia` with one whose answers the test controls (happy-dom does not know
 * prefers-contrast, and never reports a change of the system).
 *
 * @example
 * ```ts
 * const media = mockMatchMedia({ '(prefers-color-scheme: dark)': true });
 *
 * media.set('(prefers-color-scheme: dark)', false); // dispatches `change`
 * media.restore();
 * ```
 *
 * @param initial - the queries that match from the start
 *
 * @returns the control of the mock
 */
export const mockMatchMedia = (initial: Record<string, boolean> = {}) => {
	const lists = new Map<string, FakeMediaQueryList>();

	const listOf = (media: string) => {
		let list = lists.get(media);

		if (!list) {
			list = Object.assign(new EventTarget(), {
				matches: initial[media] ?? false,
				media,
			});
			lists.set(media, list);
		}

		return list;
	};

	vi.stubGlobal('matchMedia', listOf);
	// a test that fails before its end must not leave it to the next one
	onTestFinished(() => {
		vi.unstubAllGlobals();
	});

	return {
		restore: () => {
			vi.unstubAllGlobals();
		},
		set: (media: string, matches: boolean) => {
			const list = listOf(media);

			list.matches = matches;
			list.dispatchEvent(new Event('change'));
		},
	};
};

interface FakeMediaQueryList extends EventTarget {
	matches: boolean;
	media: string;
}
