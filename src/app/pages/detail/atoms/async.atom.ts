import { atom } from 'jotai';
import { fetchSampleAsyncMock } from '../__mocks__/fetch-sample-async.mock';

export interface AsyncSampleResult {
	anyProp?: string;
}

export interface AsyncSampleState {
	ready: boolean;
	loading: boolean;
	content: AsyncSampleResult;
}

const _innerAtom = atom<AsyncSampleState>({
	ready: false,
	loading: false,
	content: {},
});

export const asyncAtom = atom(
	(get) => get(_innerAtom),
	async (_get, set) => {
		set(_innerAtom, (state) => ({
			...state,
			ready: false,
			loading: true,
		}));

		const response = await fetchSampleAsyncMock();
		const content = await response.json();

		set(_innerAtom, (state) => ({
			...state,
			ready: response.status === 200,
			loading: false,
			content,
		}));
	}
);
