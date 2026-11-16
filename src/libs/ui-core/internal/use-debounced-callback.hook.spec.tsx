import { cleanup, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { useDebouncedCallback } from './use-debounced-callback.hook.ts';

describe(useDebouncedCallback, () => {
	// hooks
	beforeEach(() => {
		vi.useFakeTimers();
	});

	afterEach(() => {
		cleanup();
		vi.useRealTimers();
	});

	// tests
	test('runs only the last call, once the calls stop', () => {
		const callback = vi.fn();
		const { result } = renderHook(() =>
			useDebouncedCallback(callback, 250),
		);

		result.current.run('a');
		vi.advanceTimersByTime(200);
		result.current.run('ab');
		vi.advanceTimersByTime(249);

		expect(callback).not.toHaveBeenCalled();

		vi.advanceTimersByTime(1);

		expect(callback).toHaveBeenCalledExactlyOnceWith('ab');
	});

	test('runs the callback of the last render', () => {
		const first = vi.fn();
		const second = vi.fn();
		const { rerender, result } = renderHook(
			({ callback }) => useDebouncedCallback(callback, 100),
			{ initialProps: { callback: first } },
		);

		result.current.run();
		rerender({ callback: second });
		vi.advanceTimersByTime(100);

		expect(first).not.toHaveBeenCalled();
		expect(second).toHaveBeenCalledOnce();
	});

	test.each([
		{ how: 'it is cancelled', stop: 'cancel' },
		{ how: 'the component unmounts', stop: 'unmount' },
	] as const)('drops the pending call when $how', ({ stop }) => {
		const callback = vi.fn();
		const { result, unmount } = renderHook(() =>
			useDebouncedCallback(callback, 100),
		);

		result.current.run();

		const stops = { cancel: result.current.cancel, unmount };

		stops[stop]();
		vi.advanceTimersByTime(500);

		expect(callback).not.toHaveBeenCalled();
	});
});
