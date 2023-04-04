import { LayoutRoute, RouteDefinition } from './route.interface';

export const isLayoutRoute = (route: RouteDefinition): route is LayoutRoute => {
	return !!(route as LayoutRoute).Layout;
};
