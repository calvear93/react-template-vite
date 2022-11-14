import { createStore, createTypedHooks } from 'easy-peasy';
import { asyncState } from './pages/detail/slices/async.slice';
import { sampleState } from './slices/sample.slice';

export const state = {
	sample: sampleState,
	async: asyncState
};

export type AppState = typeof state;

export const { useStoreActions, useStoreDispatch, useStoreState, useStore } =
	createTypedHooks<AppState>();

export const AppStore = createStore(state, {
	name: import.meta.env.VITE_APP_NAME,
	devTools: import.meta.env.VITE_APP_STORE_DEVTOOLS === 'true'
});
