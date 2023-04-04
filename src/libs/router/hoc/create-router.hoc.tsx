import {
	RouterProvider,
	createBrowserRouter,
	createHashRouter,
	createMemoryRouter,
} from 'react-router-dom';
import { Suspense } from 'react';
import { createRoutes } from './create-routes';
import { RouteDefinition } from '../types/route.interface';

interface RouterOptions {
	basename?: string;
	window?: Window;
}

interface MemoryRouterOptions {
	basename?: string;
	initialEntries?: string[];
	initialIndex?: number;
}

export interface RouterConfigBase {
	routes: RouteDefinition[];

	loading?: React.ReactNode;

	fallback?: React.ReactNode;
}

export interface RouterConfig extends RouterConfigBase {
	type?: 'browser' | 'hash';

	options?: RouterOptions;
}

export interface MemoryRouterConfig extends RouterConfigBase {
	type?: 'memory';

	options?: MemoryRouterOptions;
}

/**
 * Create router lookup.
 */
const getRouterFactory = {
	browser: createBrowserRouter,
	hash: createHashRouter,
	memory: createMemoryRouter,
};

/**
 * Creates a routes rendering
 * using React Router.
 *
 * You can create multiple routers for
 * different routes contexts, i.e. public
 * and private routes.
 *
 * This HOC autodiscover pages and layout modules
 * with pre-extension .page and .layout, so you
 * can use them by its name, i.e. 'Main' for 'Main.page.tsx'.
 *
 * @example
 * ```ts
 *  // routes definition
 *	import { lazy } from 'react';
 *	import MyEagerPage from '@pages/MyEagerPage.page';
 *
 *	export const myRoutes = [
 *		...,
 *		{	// when not specified, by default '/' path
 *			Layout: AppLayout, // a layout wraps its children
 *			children: [
 *				{
 *					Component: lazy(() => import('./pages/main/Main.page')),
 *					..., // any React Router route config
 *				},
 *				{
 *					path: 'detail/:id?',
 *					Component: lazy(() => import('./pages/detail/Detail.page')),
 *				},
 *			],
 *		},
 *	];
 *```
 * @example
 * ```ts
 *  // use this HOC as
 *	import { createRouter } from '@router';
 *	import { myRoutes } from '...';
 *
 *	const Router = createRouter({
 *		routes: myRoutes,
 *		loader: <h1>Loading</h1>,
 *		fallback: <h1>Not Found</h1>
 *	});
 *
 *	export const AppRouter: React.FC = (): JSX.Element => {
 *		// authorization or any other logic
 *
 *		return <Router />;
 *	};
 *```
 *
 * @param config - router config
 *
 * @returns router with routes preloaded
 */
export const createRouter = ({
	routes: routesDef,
	type = 'browser',
	loading,
	fallback,
	options,
}: RouterConfig | MemoryRouterConfig): React.FC => {
	const routes = createRoutes(routesDef);

	const create = getRouterFactory[type];
	const router = create(routes, options);

	return (): JSX.Element => (
		<Suspense fallback={loading}>
			<RouterProvider router={router} fallbackElement={fallback} />
		</Suspense>
	);
};
