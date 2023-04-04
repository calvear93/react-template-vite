import { NonIndexRouteObject } from 'react-router-dom';
import { XOR } from './xor.type';

export type LayoutRouteComponent =
	| React.ComponentType
	| React.LazyExoticComponent<any>;

export interface ComponentRoute extends Omit<NonIndexRouteObject, 'index'> {
	children?: RouteDefinition[];
}

export interface LayoutRoute
	extends Omit<ComponentRoute, 'element' | 'Component'> {
	Layout: LayoutRouteComponent;
	loading?: React.ReactNode;
}

export type RouteDefinition = XOR<ComponentRoute, LayoutRoute>;