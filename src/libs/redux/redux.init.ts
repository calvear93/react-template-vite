import thunk from 'redux-thunk';
import { createLogger } from 'redux-logger';
import {
    AnyAction,
    ConfigureEnhancersCallback,
    configureStore,
    Dispatch,
    EnhancedStore,
    Middleware,
    PayloadAction,
    Reducer,
    StoreEnhancer
} from '@reduxjs/toolkit';

/**
 * Creates a redux logger middleware.
 *
 * @returns {Middleware} redux logger middleware
 */
export function configureLogger(): Middleware {
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
}

/**
 * Creates the middleware array.
 *
 * @param {boolean} [debug] whether app is in debug mode
 *
 * @returns {Middleware[]}
 */
function configureMiddleware(debug = false): Middleware[] {
    const middleware: Middleware[] = [thunk];

    if (debug) middleware.push(configureLogger());

    return middleware;
}

interface InitStoreConfig<R, S> {
    reducer: R;
    preloadedState?: S;
    enhancers?: StoreEnhancer[] | ConfigureEnhancersCallback;
    devMode?: boolean;
}

/**
 * Initializes a redux store using redux toolkit.
 *
 * @export
 * @template R reducer lookup
 * @template K keyof any reducer
 * @template S merged state from reducers
 *
 * @param {InitStoreConfig<R>}
 *
 * @returns {EnhancedStore<S, AnyAction, Middleware<S>}
 */
export function initStore<
    R extends Record<string, Reducer<any, AnyAction>>,
    K extends keyof R,
    S extends {
        [P in K]: ReturnType<R[P]>;
    }
>({
    reducer,
    preloadedState,
    enhancers,
    devMode
}: InitStoreConfig<R, S>): EnhancedStore<
    S,
    AnyAction,
    Middleware<object, S, Dispatch<AnyAction>>[]
> {
    return configureStore<any, any, any>({
        middleware: configureMiddleware(devMode),
        devTools: devMode,
        preloadedState,
        reducer,
        enhancers
    });
}
