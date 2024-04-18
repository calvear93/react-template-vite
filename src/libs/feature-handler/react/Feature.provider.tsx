import { createContext } from 'react';
import { FeatureHandler, type FeatureLookup } from '../feature.handler.ts';

export const FeatureContext = createContext<FeatureHandler | null>(null);

// TODO: localstorage and url with namespace for get query params

export const FeatureProvider: React.FC<FeatureProviderProps> = ({
	children,
	features,
}) => {
	return (
		<FeatureContext.Provider value={new FeatureHandler(features)}>
			{children}
		</FeatureContext.Provider>
	);
};

export interface FeatureProviderProps extends React.PropsWithChildren {
	features?: FeatureLookup;
}
