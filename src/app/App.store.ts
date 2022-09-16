import { configureStore } from '@reduxjs/toolkit';
import { configureMiddleware } from '@store';
import { sampleSlice } from 'app/slices/sample.slice';
import { asyncSlice } from 'app/pages/detail/slices/async.slice';

const DEV =
    import.meta.env.VITEST !== 'true' &&
    import.meta.env.VITE_APP_ENV !== 'release';

/**
 * Creates a redux store.
 */
export const AppStore = configureStore({
    middleware: configureMiddleware(),
    devTools: DEV,
    reducer: {
        [sampleSlice.name]: sampleSlice.reducer,
        [asyncSlice.name]: asyncSlice.reducer
    }
});

export type AppState = ReturnType<typeof AppStore.getState>;
