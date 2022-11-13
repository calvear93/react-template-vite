import { action, Action, Thunk, thunk } from 'easy-peasy';
import { fetchSampleAsyncMock } from '../__mocks__/fetchSampleAsync.mock';

export interface AsyncSampleResult {
	anyProp?: string;
}

export interface AsyncSampleState {
	ready: boolean;
	loading: boolean;
	content: AsyncSampleResult;
}

export interface AsyncSampleStore {
	state: AsyncSampleState;
	fetch: Thunk<AsyncSampleStore>;
	pending: Action<AsyncSampleStore>;
	fulfilled: Action<AsyncSampleStore, AsyncSampleResult>;
	rejected: Action<AsyncSampleStore>;
}

export const asyncState: AsyncSampleStore = {
	state: {
		ready: false,
		loading: false,
		content: {}
	},
	fetch: thunk(async (actions) => {
		actions.pending();

		const response = await fetchSampleAsyncMock();

		if (response.status !== 200) actions.rejected();
		else actions.fulfilled(await response.json());
	}),
	pending: action(({ state }) => {
		state.ready = false;
		state.loading = true;
	}),
	fulfilled: action(({ state }, data) => {
		state.ready = true;
		state.loading = false;
		state.content = data;
	}),
	rejected: action(({ state }) => {
		state.loading = false;
	})
};
