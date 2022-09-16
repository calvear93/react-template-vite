import { useAppDispatch } from 'app/App.store';
import {
    fetchSampleAsync,
    FetchSampleAsyncState,
    useAsyncFetchSelector
} from '../slices/async.slice';

export const useAsyncFetch = (): [FetchSampleAsyncState, () => void] => {
    const dispatch = useAppDispatch();
    const state = useAsyncFetchSelector();

    const triggerFetch = () => {
        dispatch(fetchSampleAsync());
    };

    return [state, triggerFetch];
};
