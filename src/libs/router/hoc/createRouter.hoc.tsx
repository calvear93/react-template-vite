import { Suspense, SuspenseProps } from 'react';
import { Route, Routes } from 'react-router-dom';
import { RouteChild } from '../components/RouteChild';
import { RouteDefinition } from '../interfaces/IRouteDefinition';
import { routerService } from '../router.service';

export interface RouterProps {
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
    loader = 'Loading',
    fallback
}: RouterProps): React.FC => {
    const paths = routerService.createRoutes(routes, '/').map((route) => {
        const { path } = route;

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
