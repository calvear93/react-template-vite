import { FeatureProvider } from '#libs/feature';
import { featureHandler } from './app.features.ts';
import { AppRouter } from './App.router.tsx';
import './styles/app.css';

/**
 * Here occur the initialization,
 * for routing, store and main app.
 *
 * @returns app container
 */
export const App = () => {
	return (
		<FeatureProvider handler={featureHandler}>
			<AppRouter />
		</FeatureProvider>
	);
};
