import { lazy } from 'react';
import { type RouteDefinition } from '@router';
import { AppLayout } from './layouts/app/App.layout';

/**
 * Routes definition.
 *
 * Here you must define your app routes
 * per namespace.
 * A namespace helps you to organize your
 * routes, for example 'app', 'public',
 * 'private', etc.
 *
 * This routes should be used in createRouter
 * function from \@router module.
 */
export const routes = {
	app: [
		{
			Layout: AppLayout,
			children: [
				{
					Component: lazy(() => import('./pages/main/Main.page')),
				},
				{
					path: 'detail/:id?',
					Component: lazy(() => import('./pages/detail/Detail.page')),
					loader: () => Promise.resolve('a promise'),
				},
			],
		},
	] as RouteDefinition[],
};
