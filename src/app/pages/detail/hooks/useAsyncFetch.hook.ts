import { useDispatch } from 'react-redux';
import {
    fetchSampleAsync,
    FetchSampleAsyncState,
    useAsyncFetchSelector
} from '../slices/async.slice';

export const useAsyncFetch = (): [FetchSampleAsyncState, () => void] => {
    const dispatch = useDispatch();
    const state = useAsyncFetchSelector();

    function triggerFetch() {
        dispatch(fetchSampleAsync());
    }

    return [state, triggerFetch];
};
