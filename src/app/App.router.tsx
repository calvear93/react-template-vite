import { routes } from 'app/app.routes';
import { createRouter } from '@router';

// creates a router
const Router = createRouter({
	routes: routes.app,
	loading: <h1>Loading</h1>,
	fallback: <h1>Not Found</h1>,
	options: { basename: import.meta.env.BASE_URL },
});

/**
 * Application routing handler.
 *
 * Here you can define logic
 * for authorization or redirection .
 *
 * @returns application router
 */
export const AppRouter: React.FC = (): JSX.Element => {
	return <Router />;
};
