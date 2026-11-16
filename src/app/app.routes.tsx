import { type RouteDefinition } from '#libs/router';
import { AppLayout } from './layouts/app/App.layout.tsx';
import ErrorPage from './pages/error/Error.page.tsx';
import MainPage from './pages/main/Main.page.tsx';

/**
 * Routes definition.
 *
 * Here you must define your app routes
 * per namespace.
 * A namespace helps you to organize your
 * routes, for example 'app', 'public',
 * 'private', etc.
 *
 * [!] Be sure your Layout is defined
 * in parent route, due to <Outlet />
 * that renderices children only.
 *
 * This routes should be used in createRouter
 * function from #libs/router module.
 */
export const routes = {
	app: [
		{
			ErrorBoundary: ErrorPage,
			Layout: AppLayout,
			children: [
				{
					Component: MainPage,
				},
				{
					path: 'detail/:id?',
					lazy: () => import('./pages/detail/Detail.page.tsx'),
					loader: () => Promise.resolve('a promise'),
				},
			],
		},
		{
			// sample: the live catalog of the UI kit (#libs/ui-core). A project that does
			// not want it deletes this route and src/app/pages/ui-catalog/
			ErrorBoundary: ErrorPage,
			path: 'ui/:section?',
			lazy: () => import('./pages/ui-catalog/UiCatalog.page.tsx'),
		},
	],
} satisfies Record<string, RouteDefinition[]>;
