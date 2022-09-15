import { useEffect } from 'react';
import { matchPath, matchRoutes, useLocation } from 'react-router-dom';
// import { RoutePayload } from './interfaces/IRouteDefinition';
// import { routerService } from './router.service';

/**
 * Sets page document title.
 *
 * @param {string} title document title
 */
export const useDocumentTitle = (title: string): void => {
    useEffect(() => {
        document.title = title;
    }, [title]);
};

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
export const useRoutePayload = <T>(): any => {
    const { pathname } = useLocation();
    // const { routes = [] } = routerService;

    return { footer: {}, header: {} };

    // return (
    //     routes.find((r) => r.path && matchPath(r.path, pathname))?.payload ?? {}
    // );
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
