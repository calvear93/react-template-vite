import { act, cleanup, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, test, vi } from 'vitest';
import { useControllableState } from './use-controllable-state.hook.ts';

describe(useControllableState, () => {
	// hooks
	afterEach(cleanup);

	// tests
	test('keeps its own state when it is not controlled', () => {
		const onChange = vi.fn();
		const { result } = renderHook(() =>
			useControllableState({
				defaultValue: 'a',
				onChange,
				value: undefined,
			}),
		);

		expect(result.current[0]).toBe('a');

		act(() => result.current[1]('b'));

		expect(result.current[0]).toBe('b');
		expect(onChange).toHaveBeenCalledExactlyOnceWith('b');
	});

	test('shows the value of its parent and only asks for a change when controlled', () => {
		const onChange = vi.fn();
		const { rerender, result } = renderHook(
			({ value }) =>
				useControllableState({ defaultValue: 'a', onChange, value }),
			{ initialProps: { value: 'x' } },
		);

		act(() => result.current[1]('y'));

		expect(result.current[0]).toBe('x');
		expect(onChange).toHaveBeenCalledExactlyOnceWith('y');

		rerender({ value: 'y' });

		expect(result.current[0]).toBe('y');
	});

	test('works without a listener', () => {
		const { result } = renderHook(() =>
			useControllableState({ defaultValue: 1, value: undefined }),
		);

		act(() => result.current[1](2));

		expect(result.current[0]).toBe(2);
	});
});
