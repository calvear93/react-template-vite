/* eslint-disable react/no-multi-comp */
import { Outlet, type RouteObject } from 'react-router-dom';
import { Suspense } from 'react';
import {
	type LayoutRouteComponent,
	type ComponentRoute,
	type RouteDefinition,
} from '../types/route';
import { isLayoutRoute } from '../types/is-layout-route';

const renderLayout = (
	Layout: LayoutRouteComponent,
	loading: React.ReactNode,
) => {
	if (loading)
		return () => (
			<Layout>
				<Suspense fallback={loading}>
					<Outlet />
				</Suspense>
			</Layout>
		);

	return () => (
		<Layout>
			<Outlet />
		</Layout>
	);
};

export const createRoutes = (routes: RouteDefinition[]): RouteObject[] => {
	for (const route of routes) {
		if (isLayoutRoute(route)) {
			const { Layout, loading } = route;

			(route as ComponentRoute).Component = renderLayout(Layout, loading);

			(route as RouteDefinition).Layout = undefined;
		}

		if (!route.path) route.path = '';

		if (route.children) createRoutes(route.children);
	}

	return routes;
};
