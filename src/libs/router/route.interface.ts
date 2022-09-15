import { FC, LazyExoticComponent } from 'react';

export type RouteComponent = FC | LazyExoticComponent<any>;

export type RoutePayload<T = any> = Record<string, any> & T;

export type RoutePath = string | string[];

/**
 * Defines route config for router.
 *
 * @export
 * @interface RouteInfo
 */
export interface RouteInfo {
    path: RoutePath;

    page?: RouteComponent;

    layout?: RouteComponent | string;
}

/**
 * Lookup of routes info, where name
 * is page's React file name or a unique key.
 *
 * @export
 * @interface RoutesInfoCollection
 */
export interface RoutesInfoCollection {
    [name: string]: RouteInfo | RoutePath;
}

/**
 * RouteInfo type guard.
 *
 * @param {any} route
 *
 * @returns {boolean}
 */
export const isRouteInfo = (route: any): route is RouteInfo => {
    return !!route?.path;
};
