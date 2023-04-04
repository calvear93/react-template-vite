import { AppRouter } from 'app/App.router';
import 'app/styles/app.scss';

/**
 * App container.
 *
 * Here occur the initialization,
 * for routing, store and main app.
 *
 * @returns app container
 */
export const App: React.FC = (): JSX.Element => {
	return <AppRouter />;
};
