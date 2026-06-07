import { act, renderHook, type RenderOptions } from '@testing-library/react';
import { afterAll, beforeAll, describe, expect, test, vi } from 'vitest';
import { FeatureHandler } from '../feature.handler.ts';
import { FeatureContextException } from './exceptions/feature-context.exception.ts';
import { useFeature, useFeatureHandler } from './feature.hook.ts';
import { FeatureProvider } from './Feature.provider.tsx';

describe('feature hooks', () => {
	const _handler = new FeatureHandler();
	const wrapper: RenderOptions['wrapper'] = ({ children }) => (
		<FeatureProvider handler={_handler}>{children}</FeatureProvider>
	);

	// hooks
	beforeAll(() => {
		vi.spyOn(console, 'error').mockImplementation(() => null);
	});

	afterAll(() => {
		vi.clearAllMocks();
	});

	// tests
	describe('useFeatureHandler', () => {
		test('when no FeatureProvider found, throws FeatureContextException', () => {
			const test = () => renderHook(useFeatureHandler);

			expect(test).toThrow(FeatureContextException);
		});

		test('returns FeatureHandler', () => {
			const { result } = renderHook(useFeatureHandler, { wrapper });

			expect(result.current).toBe(_handler);
		});
	});

	describe('useFeature', () => {
		test('returns feature value', () => {
			const feature = 'FEATURE';
			const { result } = renderHook(() => useFeature(feature), {
				wrapper,
			});

			// using FeatureHandler
			act(() => _handler.set(feature, true));
			const [value, setValue] = result.current;

			// using set fn
			act(() => setValue(false));
			const [newValue] = result.current;

			expect(value).toBe(true);
			expect(newValue).toBe(false);
		});

		test('does not update when an unrelated feature changes', () => {
			const feature = 'FEATURE_OBSERVED';
			const { result } = renderHook(() => useFeature(feature), {
				wrapper,
			});

			act(() => _handler.set('FEATURE_UNRELATED', true));
			const [value] = result.current;

			expect(value).toBe(false);
		});

		test('unsubscribes from handler on unmount', () => {
			const feature = 'FEATURE_UNMOUNT';
			const removeSpy = vi.spyOn(_handler, 'removeOnChangeListener');
			const { unmount } = renderHook(() => useFeature(feature), {
				wrapper,
			});

			unmount();

			expect(removeSpy).toHaveBeenCalledOnce();
			removeSpy.mockRestore();
		});

		test('re-syncs the value when the feature argument changes', () => {
			_handler.set('FEATURE_ON', true);
			_handler.set('FEATURE_OFF', false);

			const { rerender, result } = renderHook(
				({ name }: { name: string }) => useFeature(name),
				{ initialProps: { name: 'FEATURE_ON' }, wrapper },
			);

			expect(result.current[0]).toBe(true);

			rerender({ name: 'FEATURE_OFF' });

			expect(result.current[0]).toBe(false);
		});
	});
});
