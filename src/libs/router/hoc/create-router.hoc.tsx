import { Route, Routes } from 'react-router-dom';
import { ReactNode, Suspense } from 'react';
import { routeFromInfo, wrapElementWithLayout } from './route-from-info.hoc';
import {
	isRouteInfo,
	RouteComponent,
	RouteInfo,
	RoutePath,
	RoutesInfoCollection,
} from '../route.interface';

export interface RouterConfig {
	routes: RoutesInfoCollection;

	layout?: RouteComponent | string;

	loader?: ReactNode;

	fallback?: JSX.Element;

	layoutProps?: React.ComponentProps<any>;
}

/**
 * Normalizes route info collection
 * and generates Route components
 * for each route info.
 *
 * @param routes - routes collection
 *
 * @returns array of router as components
 */
const getRoutesComponents = (routes: RoutesInfoCollection): JSX.Element[] => {
	const paths: JSX.Element[] = [];

	for (const name in routes) {
		const routeInfo = routes[name];

		let path: RoutePath;
		let render: Partial<RouteInfo>;

		if (isRouteInfo(routeInfo)) {
			({ path, ...render } = routeInfo);
		} else {
			path = routeInfo;
			render = {};
		}

		// may have single or multiple route paths for one page
		if (typeof path === 'string') {
			paths.push(routeFromInfo(name, { path, ...render }));
		} else if (Array.isArray(path)) {
			for (const route of path)
				paths.push(routeFromInfo(name, { path: route, ...render }));
		}
	}

	return paths;
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
 *	export const myRoutes = {
 *		...,
 *		MyMainPage : '/', // for use 'MyMainPage.page.tsx' as page for root path
 *		MyDetailPage : ['detail', 'detail/:id'], // multiple paths for same page
 *		DBoard: {
 *			path: 'dashboard', // single or multiple paths
 *			layout: 'MyLayout' // for use 'MyLayout.layout.tsx' for this page
 *		},
 *		eagerPage: {
 *			path: ['eager', 'no-lazy'],
 *			page: MyEagerPage // eager page
 *		},
 *		lazyManual: {
 *			path: 'lazy',
 *			// isn't necessary because autoload is lazy by default
 *			page: lazy(() => import('pages/MyPage.page'))
 *		}
 *	}
 *```
 * @example
 * ```ts
 *  // use this HOC as
 *	import { createRouter } from '@router';
 *	import { myRoutes } from '...';
 *
 *	const Router = createRouter({
 *		routes: myRoutes,
 *		layout: 'MyLayout', // for autoload MyLayout.layout.tsx
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
	routes,
	layout,
	loader = 'Loading',
	fallback,
	layoutProps,
}: RouterConfig): React.FC => {
	const paths = getRoutesComponents(routes);

	// wraps routes with layout if defined
	const render = wrapElementWithLayout(
		<Routes>
			{paths}

			<Route path='*' element={fallback} />
		</Routes>,
		layout,
		layoutProps,
	);

	return (): JSX.Element => <Suspense fallback={loader}>{render}</Suspense>;
};
