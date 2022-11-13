import { BrowserRouter } from '@router';
import { StoreProvider } from 'easy-peasy';
import { AppStore } from 'app/App.store';
import { AppRouter } from 'app/App.router';
import 'app/styles/app.scss';

/**
 * App container.
 *
 * Here occur the initialization,
 * for routing, store and main app.
 *
 * @returns {JSX.Element} app container
 */
export const App: React.FC = (): JSX.Element => {
	return (
		<BrowserRouter basename={import.meta.env.BASE_URL}>
			<StoreProvider store={AppStore}>
				<AppRouter />
			</StoreProvider>
		</BrowserRouter>
	);
};
