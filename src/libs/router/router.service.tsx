import {
    RouteDefinition,
    RouteRenderComponent
} from './interfaces/IRouteDefinition';

/**
 * Routes handler for expose
 * application routes definition.
 */
class RouterService {
    /**
     * Application routes
     *
     * @private
     * @type {RouteDefinition[]}
     */
    private _routes: RouteDefinition[] = [];

    /**
     * Return routes.
     *
     * @readonly
     */
    get routes() {
        return this._routes;
    }

    /**
     * Flattens a route definition
     * four router rendering.
     *
     * @param {RouteDefinition[]} routesDefinition
     * @param {string} basePath
     * @param {RouteRenderComponent} parentLayout
     * @param {RouteRenderComponent} parentPayload
     *
     * @returns {RouteDefinition[]} flattened routes
     */
    createRoutes(
        routesDefinition: RouteDefinition[],
        basePath: string,
        parentLayout?: RouteRenderComponent,
        parentPayload?: RouteRenderComponent
    ): RouteDefinition[] {
        const routes = this._createRoutes(
            routesDefinition,
            basePath,
            parentLayout,
            parentPayload
        );

        this._routes = [...this._routes, ...routes];

        return routes;
    }

    /**
     * Flattens a route definition
     * four router rendering.
     *
     * @param {RouteDefinition[]} routesDefinition
     * @param {string} basePath
     * @param {RouteRenderComponent} parentLayout
     * @param {RouteRenderComponent} parentPayload
     * @param {RouteDefinition[]} [routes]
     *
     * @returns {RouteDefinition[]} flattened routes
     */
    private _createRoutes(
        routesDefinition: RouteDefinition[],
        basePath: string,
        parentLayout?: RouteRenderComponent,
        parentPayload?: RouteRenderComponent,
        routes: RouteDefinition[] = []
    ): RouteDefinition[] {
        for (const route of routesDefinition) {
            const {
                title,
                path: relativePath = '',
                render: { child, children, layout = parentLayout } = {},
                payload
            } = route;

            // removes duplicated forward slashes
            const path = (basePath + '/' + relativePath).replace(/\/+/g, '/');

            if (child) {
                routes.push({
                    title,
                    path,
                    render: {
                        layout,
                        child
                    },
                    // payloads merging, child has priority over parent
                    payload: {
                        ...parentPayload,
                        ...payload
                    }
                });
            }

            if (children) {
                this._createRoutes(
                    children,
                    path,
                    layout,
                    {
                        ...parentPayload,
                        ...payload
                    },
                    routes
                );
            }
        }

        return routes;
    }
}

// singleton
export const routerService = new RouterService();
