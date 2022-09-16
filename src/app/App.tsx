import { Provider } from 'react-redux';
import { BrowserRouter } from '@router';
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
            <Provider store={AppStore}>
                <AppRouter />
            </Provider>
        </BrowserRouter>
    );
};
