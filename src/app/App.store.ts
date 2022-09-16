import { initStore } from '@config';
import { useDispatch } from 'react-redux';
import { sampleSlice } from 'app/slices/sample.slice';
import { asyncSlice } from 'app/pages/detail/slices/async.slice';

/**
 * Creates a redux store.
 */
export const AppStore = initStore({
    reducer: {
        [sampleSlice.name]: sampleSlice.reducer,
        [asyncSlice.name]: asyncSlice.reducer
    }
});

export type AppState = ReturnType<typeof AppStore.getState>;

export type AppDispatch = typeof AppStore.dispatch;

export const useAppDispatch = useDispatch as () => AppDispatch;
