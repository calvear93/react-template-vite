import { createRouter } from '@router';
import { routes } from 'app/app.routes';

// creates a router
const Router = createRouter({
	layout: 'App',
	routes: routes.app,
	loader: <h1>Loading</h1>,
	fallback: <h1>Not Found</h1>
});

/**
 * Application routing handler.
 *
 * Here you can define logic
 * for authorization or redirection .
 *
 * @returns {JSX.Element} application router
 */
export const AppRouter: React.FC = (): JSX.Element => {
	return <Router />;
};
