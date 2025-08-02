/* eslint-disable @typescript-eslint/no-floating-promises */
import { renderHook } from '@testing-library/react';
import { useAtom } from 'jotai';
import { afterAll, beforeAll, describe, expect, test, vi } from 'vitest';
import { asyncAtom, type AsyncSampleState } from './async.atom.ts';

const renderAsyncAtom = () => renderHook(() => useAtom(asyncAtom));
type HookCurrent = ReturnType<typeof renderAsyncAtom>['result'];

describe('async atom', () => {
	let hook: HookCurrent;
	let rerender: () => void;

	// hooks
	beforeAll(() => {
		vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
		// renders the hook
		({ rerender, result: hook } = renderAsyncAtom());
	});

	afterAll(() => {
		vi.useRealTimers();
	});

	// tests
	test('initial state has "content" empty, and "loading" and "ready" false', () => {
		const expected: AsyncSampleState = {
			content: {},
			loading: false,
			ready: false,
		};

		const {
			current: [state],
		} = hook;

		expect(state).toStrictEqual(expected);
	});

	test('starts fetch changes "loading" to true', () => {
		const expected: AsyncSampleState = {
			content: {},
			loading: true,
			ready: false,
		};

		const startFetch = hook.current[1];
		startFetch();
		rerender();

		const state = hook.current[0];
		expect(state).toStrictEqual(expected);
	});

	test('once fetch is resolved, content has the value', async () => {
		const expected: AsyncSampleState = {
			content: { anyProp: 'anyValue' },
			loading: false,
			ready: true,
		};

		const startFetch = hook.current[1];
		startFetch();
		await vi.advanceTimersToNextTimerAsync();
		rerender();

		const state = hook.current[0];
		expect(state).toStrictEqual(expected);
	});
});
