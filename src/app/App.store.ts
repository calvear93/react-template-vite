import { sampleSlice } from 'app/slices/sample.slice';
import { asyncSlice } from 'app/pages/detail/slices/async.slice';
import { initStore } from '@store';

const DEV =
    import.meta.env.MODE !== 'test' && import.meta.env.VITE_APP_ENV !== 'prod';

/**
 * Creates a redux store.
 */
export const AppStore = initStore({
    devMode: DEV,
    reducer: {
        [sampleSlice.name]: sampleSlice.reducer,
        [asyncSlice.name]: asyncSlice.reducer
    }
});

export type AppState = ReturnType<typeof AppStore.getState>;

export type AppDispatch = typeof AppStore.dispatch;
