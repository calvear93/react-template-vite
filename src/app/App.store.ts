import { configureStore } from '@reduxjs/toolkit';
import { useDispatch } from 'react-redux';
import { configureMiddleware } from 'app/config/middleware';
import { sampleSlice } from 'app/slices/sample.slice';
import { asyncSlice } from 'app/pages/detail/slices/async.slice';

const DEBUG = import.meta.env.VITE_APP_DEBUG === 'true';
const DEV =
    import.meta.env.NODE_ENV !== 'test' &&
    import.meta.env.VITE_APP_ENV !== 'prod';

/**
 * Creates a redux store.
 */
export const AppStore = configureStore({
    middleware: configureMiddleware(DEV),
    devTools: DEBUG,
    reducer: {
        [sampleSlice.name]: sampleSlice.reducer,
        [asyncSlice.name]: asyncSlice.reducer
    }
});

export type AppState = ReturnType<typeof AppStore.getState>;

export type AppDispatch = typeof AppStore.dispatch;

export const useAppDispatch = () => useDispatch<AppDispatch>();
