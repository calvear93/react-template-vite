import { initStore } from '@config';
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
