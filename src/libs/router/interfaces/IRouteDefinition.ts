import { LazyExoticComponent } from 'react';

export type RoutePayload<T = any> = Record<string, any> & T;

export type RouteRenderComponent = React.FC | LazyExoticComponent<any> | string;

export interface RouteRenderDefinition {
    child?: RouteRenderComponent;

    layout?: RouteRenderComponent;

    children?: RouteDefinition[];
}

export interface RouteDefinition {
    path?: string;

    title?: string;

    render?: RouteRenderDefinition;

    payload?: RoutePayload;
}
