import { ComponentType, lazy, Suspense, SuspenseProps } from 'react';
import { Route, Routes } from 'react-router-dom';
import { RouteChild } from '../components/RouteChild';
import { RouteDefinition } from '../interfaces/IRouteDefinition';
import { routerService } from '../router.service';

type MetaModule = Record<
    string,
    () => Promise<{ default: ComponentType<any> }>
>;

/**
 * Search for any matching module
 * for route module lazy load.
 *
 * @returns {MetaModule}
 */
const discoverRouteModules = (): MetaModule => {
    const modules = import.meta.glob(
        '/src/app/**/*.(page|layout).(t|j)sx'
    ) as MetaModule;

    return Object.keys(modules).reduce((map, route) => {
        const path = route.replace(/^.*[/\\]/, '').replace(/\.[^./]+$/, '');

        map[path] = modules[route];

        return map;
    }, {} as MetaModule);
};

export interface RouterProps {
    autodiscover?: boolean;

    routes: RouteDefinition[];

    loader?: SuspenseProps['fallback'];

    fallback?: JSX.Element;
}

/**
 * Creates a routes rendering
 * using React Router.
 *
 * You can create multiple routers for
 * different routes contexts, i.e. public
 * and private routes.
 *
 * @example
 *  You must define your routes definition as:
 *  {
 *      ...,
 *      path: '/main',
 *      title: 'Main Page',
 *      render: {
 *          layout: Layouts.App,
 *          child: Pages.Main,
 *          children: [ ... ]
 *      },
 *      payload: { ... }
 *  }
 *
 * So, you can use this HOC as:
 *
 *  import { createRouter } from '@router';
 *  import { routes } from '...';
 *
 *  const Router = createRouter({
 *      routes: routes,
 *      loader: <h1>Loading</h1>,
 *      fallback: <h1>Not Found</h1>
 *  });
 *
 *  export const AppRouter: React.FC = (): JSX.Element => {
 *      // authorization or any other logic
 *
 *      return <Router />;
 *  };
 *
 * @param {RouterProps} props
 *
 * @returns {JSX.Element} routes render
 */
export const createRouter = ({
    routes,
    autodiscover,
    loader = 'Loading',
    fallback
}: RouterProps): React.FC => {
    const discovered = autodiscover ? discoverRouteModules() : undefined;

    const paths = routerService.createRoutes(routes, '/').map((route) => {
        const { path, render } = route;

        if (discovered) {
            if (typeof render?.child === 'string')
                render.child = lazy(discovered[render.child]);

            if (typeof render?.layout === 'string')
                render.layout = lazy(discovered[render.layout]);
        }

        // renders the route
        return (
            <Route
                key={path}
                path={path}
                element={<RouteChild route={route} />}
            />
        );
    });

    return (): JSX.Element => (
        <Suspense fallback={loader}>
            <Routes>
                {paths}

                <Route path='*' element={fallback} />
            </Routes>
        </Suspense>
    );
};
