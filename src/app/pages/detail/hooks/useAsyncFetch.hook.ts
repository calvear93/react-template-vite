import { useStoreActions, useStoreState } from 'app/App.store';
import { AsyncSampleState } from '../slices/async.slice';

export const useAsyncFetch = (): [AsyncSampleState, () => void] => {
	const state = useStoreState((store) => store.async.state);
	const fetch = useStoreActions((store) => store.async.get);

	return [state, fetch];
};
