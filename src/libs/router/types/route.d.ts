import { type RouteObject } from 'react-router';
import { type XOR } from './xor.d.ts';

export type LayoutRouteComponent =
	| React.ComponentType<React.PropsWithChildren>
	| React.LazyExoticComponent<React.ComponentType<React.PropsWithChildren>>;

export interface ComponentRoute extends Omit<RouteObject, 'index'> {
	children?: RouteDefinition[];
	lazy?: () => Promise<{ default: React.ComponentType }>;
}

export interface LayoutRoute extends Omit<
	ComponentRoute,
	'Component' | 'element'
> {
	Layout: LayoutRouteComponent;
	loading?: React.ReactNode;
}

export type RouteDefinition = XOR<ComponentRoute, LayoutRoute>;
