import { Middleware, PayloadAction } from '@reduxjs/toolkit';
import { createLogger } from 'redux-logger';
import thunk from 'redux-thunk';

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
        collapsed: (getState: any, action: PayloadAction<any>, logEntry: any) =>
            !logEntry.error
    });
}

/**
 * Creates the middleware array.
 *
 * @param {boolean} debug whether app is in debug mode
 *
 * @returns {MiddlewareArray<Middleware>} middleware array
 */
export function configureMiddleware(debug = false): Middleware[] {
    const middleware: Middleware[] = [thunk];

    if (debug) middleware.push(configureLogger());

    return middleware as Middleware[];
}
