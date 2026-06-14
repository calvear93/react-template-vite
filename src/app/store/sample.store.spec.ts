import { renderHook } from '@testing-library/react';
import { useAtom } from 'jotai';
import { beforeAll, describe, expect, test } from 'vitest';
import { sampleStore } from './sample.store.ts';

const renderSampleStore = () => renderHook(() => useAtom(sampleStore));
type HookCurrent = ReturnType<typeof renderSampleStore>['result'];

describe('sample store', () => {
	let hook: HookCurrent;
	let rerender: () => void;

	// hooks
	beforeAll(() => {
		// renders the hook
		({ rerender, result: hook } = renderSampleStore());
	});

	// tests
	test('initial state returns "loading"', () => {
		const expected = 'loading';

		const {
			current: [state],
		} = hook;

		expect(state).toBe(expected);
	});

	test('dispatch a status 200 returns "success"', () => {
		const expected = 'success';

		const send = hook.current[1];
		send(200);
		rerender();

		const state = hook.current[0];
		expect(state).toBe(expected);
	});

	test('dispatch a status different from 200 returns "error"', () => {
		const expected = 'error';

		const send = hook.current[1];
		send(500);
		rerender();

		const state = hook.current[0];
		expect(state).toBe(expected);
	});
});
