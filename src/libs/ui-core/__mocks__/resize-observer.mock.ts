import { onTestFinished, vi } from 'vitest';

/**
 * Replaces `ResizeObserver` with one the test fires (happy-dom lays nothing out, so
 * the real one never reports a size).
 *
 * @example
 * ```ts
 * const sizes = mockResizeObserver();
 *
 * act(() => sizes.resize()); // every observer that watches something is told
 * sizes.restore();
 * ```
 *
 * @returns the control of the mock
 */
export const mockResizeObserver = () => {
	const watching = new Set<FakeResizeObserver>();

	class FakeResizeObserver implements ResizeObserver {
		disconnect() {
			watching.delete(this);
		}

		notify() {
			this.callback([], this);
		}

		observe() {
			watching.add(this);
		}

		constructor(private readonly callback: ResizeObserverCallback) {}

		readonly unobserve = vi.fn();
	}

	vi.stubGlobal('ResizeObserver', FakeResizeObserver);
	// a test that fails before its end must not leave it to the next one
	onTestFinished(() => {
		vi.unstubAllGlobals();
	});

	return {
		/** How many observers watch something now. */
		get count() {
			return watching.size;
		},
		resize: () => {
			for (const observer of watching) observer.notify();
		},
		restore: () => {
			vi.unstubAllGlobals();
		},
	};
};
