import { Outlet, type RouteObject } from 'react-router-dom';
import { Suspense } from 'react';
import { type ComponentRoute, type RouteDefinition } from '../types/route';
import { isLayoutRoute } from '../types/is-layout-route';

export const createRoutes = (routes: RouteDefinition[]): RouteObject[] => {
	for (const route of routes) {
		if (isLayoutRoute(route)) {
			const { Layout, loading } = route;

			(route as ComponentRoute).Component = () =>
				loading ? (
					<Layout>
						<Suspense fallback={loading}>
							<Outlet />
						</Suspense>
					</Layout>
				) : (
					<Layout>
						<Outlet />
					</Layout>
				);

			(route as RouteDefinition).Layout = undefined;
		}

		if (!route.path) route.path = '';

		if (route.children) createRoutes(route.children);
	}

	return routes;
};
