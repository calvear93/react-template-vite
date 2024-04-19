import { createContext, useEffect } from 'react';
import { FeatureHandler, type FeatureLookup } from '../feature.handler.ts';

const STORAGE_PREFIX = 'feature:';
export const FeatureContext = createContext<FeatureHandler | null>(null);
const handler = new FeatureHandler();

const getStorageFeatures = (storage: Storage): Record<string, boolean> => {
	const features: Record<string, boolean> = {};

	for (const [key, value] of Object.entries(storage)) {
		if (key.startsWith(STORAGE_PREFIX)) {
			features[key.replace(STORAGE_PREFIX, '')] = !!value;
		}
	}

	return features;
};

export const FeatureProvider: React.FC<FeatureProviderProps> = ({
	children,
	features,
}) => {
	useEffect(() => {
		handler.setAll({
			...features,
			...getStorageFeatures(localStorage),
			...getStorageFeatures(sessionStorage),
		});

		addEventListener('storage', ({ key, newValue }) => {
			if (key?.startsWith(STORAGE_PREFIX)) {
				handler.set(
					key.replace(STORAGE_PREFIX, ''),
					newValue === '1' || newValue === 'true',
				);
			}
		});
	}, []);

	return (
		<FeatureContext.Provider value={handler}>
			{children}
		</FeatureContext.Provider>
	);
};

export interface FeatureProviderProps extends React.PropsWithChildren {
	features?: FeatureLookup;
}
