import { atom } from 'jotai';
import { fetchSampleAsyncMock } from '../__mocks__/fetch-sample-async.mock.ts';

export interface AsyncSampleResult {
	anyProp?: string;
}

export interface AsyncSampleState {
	ready: boolean;
	loading: boolean;
	content: AsyncSampleResult;
}

const _innerAtom = atom<AsyncSampleState>({
	content: {},
	loading: false,
	ready: false,
});

export const asyncAtom = atom(
	(get) => get(_innerAtom),
	async (_get, set) => {
		set(_innerAtom, (state) => ({
			...state,
			loading: true,
			ready: false,
		}));

		const response = await fetchSampleAsyncMock();
		const content = await response.json();

		set(_innerAtom, (state) => ({
			...state,
			content,
			loading: false,
			ready: response.status === 200,
		}));
	},
);
