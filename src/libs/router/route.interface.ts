import { Route } from 'react-router-dom';
import { FC, LazyExoticComponent } from 'react';

type RouteProps = Omit<
	Parameters<typeof Route>[0],
	'id' | 'path' | 'element' | 'children'
>;

export type RouteComponent = FC | LazyExoticComponent<any>;

export type RoutePayload<T = any> = Record<string, any> & T;

export type RoutePath = string | string[];

/**
 * Defines route config for router.
 */
export interface RouteInfo {
	path: RoutePath;

	page?: RouteComponent;

	layout?: RouteComponent | string;

	pageProps?: React.ComponentProps<any>;

	layoutProps?: React.ComponentProps<any>;

	config?: RouteProps;
}

/**
 * Lookup of routes info, where name
 * is page's React file name or a unique key.
 */
export type RoutesInfoCollection = Record<string, RouteInfo | RoutePath>;

export const isRouteInfo = (route: any): route is RouteInfo => {
	return !!route?.path;
};
