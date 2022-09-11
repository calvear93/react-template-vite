import { matchPath, useLocation } from 'react-router-dom';
import { RoutePayload } from './interfaces/IRouteDefinition';
import { routerService } from './router.service';

/**
 * Returns current payload
 * from routes definition.
 *
 * Children payload has higher
 * priority over parents payload.
 *
 * @example
 *  You should define payload in routes definition as:
 *  {
 *      ...,
 *      path: '/main',
 *      render: {
 *          layout: Layouts.App,
 *          child: Pages.Main,
 *      },
 *      payload: { ... }
 *  }
 *
 * @dependency useLocation and matchPath from react-router.
 *
 * @returns {T} array with route payload and loaded boolean.
 */
export const useRoutePayload = <T>(): RoutePayload<T> => {
    const { pathname } = useLocation();
    const { routes = [] } = routerService;

    return (
        routes.find((r) => r.path && matchPath(r.path, pathname))?.payload ?? {}
    );
};

/**
 * Returns URL query parameters.
 *
 * @example
 *  const { get } = useQueryParams();
 *  const name = get('name');
 *
 * @dependency useLocation from react-router-dom.
 *
 * @returns {URLSearchParams} URL params handler.
 */
export const useQueryParams = (): URLSearchParams => {
    const { search } = useLocation();

    return new URLSearchParams(search);
};

/**
 * Returns URL hash value.
 *
 * @example
 *  const hash = useHash();
 *
 * @dependency useLocation from react-router-dom.
 *
 * @returns {string} URL hash.
 */
export const useHashValue = (): string => {
    const { hash } = useLocation();

    return hash.slice(1);
};

/**
 * Retrieves current path state.
 *
 * @dependency useLocation from react-router-dom.
 *
 * @returns {T} route state.
 */
export const useRouteState = <T>(): T => {
    const { state } = useLocation();

    return state as T;
};
