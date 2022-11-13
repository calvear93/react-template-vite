import { useStoreActions, useStoreState } from 'app/App.store';
import { AsyncSampleState } from '../slices/async.slice';

export const useAsyncFetch = (): [AsyncSampleState, () => void] => {
	const state = useStoreState(({ async }) => async.state);
	const fetch = useStoreActions(({ async }) => async.fetch);

	return [state, fetch];
};
