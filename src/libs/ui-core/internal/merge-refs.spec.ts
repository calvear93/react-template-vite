import { createRef } from 'react';
import { describe, expect, test, vi } from 'vitest';
import { mergeRefs } from './merge-refs.ts';

describe(mergeRefs, () => {
	test('sets every ref it was given, and skips the missing ones', () => {
		const object = createRef<string>();
		const callback = vi.fn();
		const ref = mergeRefs(object, undefined, callback, null);

		ref('node');

		expect(object.current).toBe('node');
		expect(callback).toHaveBeenCalledExactlyOnceWith('node');

		ref(null);

		expect(object.current).toBeNull();
	});
});
