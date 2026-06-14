import { atom } from 'jotai';
import { fetchSampleAsyncMock } from '../__mocks__/fetch-sample-async.mock.ts';

const _innerStore = atom<AsyncSampleState>({
	content: {},
	loading: false,
	ready: false,
});

export const asyncStore = atom(
	(get) => get(_innerStore),
	async (_get, set) => {
		set(_innerStore, (state) => ({
			...state,
			loading: true,
			ready: false,
		}));

		const response = await fetchSampleAsyncMock();
		const content = await response.json();

		set(_innerStore, (state) => ({
			...state,
			content,
			loading: false,
			ready: response.status === 200,
		}));
	},
);

export interface AsyncSampleResult {
	anyProp?: string;
}

export interface AsyncSampleState {
	content: AsyncSampleResult;
	loading: boolean;
	ready: boolean;
}
