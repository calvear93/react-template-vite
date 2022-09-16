import thunk from 'redux-thunk';
import { createLogger } from 'redux-logger';
import {
    Action,
    AnyAction,
    configureStore,
    ConfigureStoreOptions,
    EnhancedStore,
    Middleware,
    PayloadAction
} from '@reduxjs/toolkit';
import { ThunkMiddlewareFor } from '@reduxjs/toolkit/dist/getDefaultMiddleware';

const DEV =
    import.meta.env.VITEST !== 'true' &&
    import.meta.env.VITE_APP_ENV !== 'release';

/**
 * Creates a redux logger middleware.
 *
 * @returns {Middleware} redux logger middleware
 */
const configureLogger = (): Middleware => {
    return createLogger({
        duration: true,
        timestamp: true,
        diff: true,
        collapsed: (
            _getState: any,
            _action: PayloadAction<any>,
            logEntry: any
        ) => !logEntry.error
    });
};

/**
 * Creates the middleware array.
 *
 * @param {boolean} [debug] whether app is in debug mode
 *
 * @returns {Middleware[]}
 */
const configureMiddleware = (debug = false): Middleware[] => {
    const middleware: Middleware[] = [thunk];

    if (debug) middleware.push(configureLogger());

    return middleware;
};

type InitStoreConfig<S, A extends Action> = Omit<
    ConfigureStoreOptions<S, A>,
    'middleware' | 'devTools'
>;

/**
 * Initializes a redux store using redux toolkit.
 *
 * @template A action
 * @template S store state
 * @param {InitStoreConfig<S, A>}
 *
 * @returns {EnhancedStore<S, A, [ThunkMiddlewareFor<S>]>}
 */
export const initStore = <A extends Action = AnyAction, S = any>({
    reducer,
    preloadedState,
    enhancers
}: InitStoreConfig<S, A>): EnhancedStore<S, A, [ThunkMiddlewareFor<S>]> => {
    return configureStore<S, A, any>({
        middleware: configureMiddleware(DEV),
        devTools: DEV,
        preloadedState,
        reducer,
        enhancers
    });
};
