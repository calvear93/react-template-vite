import { createRouter } from '#libs/router';
import { Spinner } from '#libs/ui-core';
import { routes } from './app.routes.tsx';

// creates a router
const Router = createRouter({
	loading: <Spinner block showLabel />,
	options: { basename: import.meta.env.BASE_URL },
	routes: routes.app,
});

/**
 * Application routing handler.
 *
 * Here you can define logic
 * for authorization or redirection .
 *
 * @returns application router
 */
export const AppRouter = () => {
	return <Router />;
};
