import { type LayoutRoute, type RouteDefinition } from './route';

export const isLayoutRoute = (route: RouteDefinition): route is LayoutRoute => {
	return !!(route as LayoutRoute).Layout;
};
