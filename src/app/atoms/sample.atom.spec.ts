import { beforeAll, describe, expect, test } from 'vitest';
import { useAtom } from 'jotai';
import { renderHook } from '@testing-library/react';
import { sampleAtom } from './sample.atom.ts';

const renderSampleAtom = () => renderHook(() => useAtom(sampleAtom));
type HookCurrent = ReturnType<typeof renderSampleAtom>['result'];

describe('sample atom', () => {
	let hook: HookCurrent;
	let rerender: () => void;

	// hooks
	beforeAll(() => {
		// renders the hook
		({ rerender, result: hook } = renderSampleAtom());
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
