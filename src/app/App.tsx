import { FeatureProvider } from '#libs/feature';
import { UiProvider } from '#libs/ui-core';
import { featureHandler } from './app.features.ts';
import { AppRouter } from './App.router.tsx';
import { RouterLink } from './components/atoms/router-link/RouterLink.tsx';
import './styles/app.css';

/**
 * Here occur the initialization,
 * for routing, store and main app.
 *
 * The UI kit gets the language of the app (APP_LOCALE) and the link of the router; a person
 * who chose another language in the settings keeps theirs.
 *
 * @returns app container
 */
export const App = () => {
	return (
		<FeatureProvider handler={featureHandler}>
			<UiProvider link={RouterLink} locale={import.meta.env.APP_LOCALE}>
				<AppRouter />
			</UiProvider>
		</FeatureProvider>
	);
};
