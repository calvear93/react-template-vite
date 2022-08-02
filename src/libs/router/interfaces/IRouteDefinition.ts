import { LazyExoticComponent } from 'react';

export type RouteRenderComponent = React.FC | LazyExoticComponent<any>;

export interface RouteRenderDefinition {
    child?: RouteRenderComponent;

    layout?: RouteRenderComponent;

    children?: RouteDefinition[];
}

export interface RouteDefinition {
    path?: string;

    title?: string;

    render?: RouteRenderDefinition;

    payload?: any;
}
