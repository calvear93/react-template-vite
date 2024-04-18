import { useContext } from 'react';
import type { FeatureHandler } from '../feature.handler.ts';
import { FeatureContext } from './Feature.provider.tsx';

export const useFeatureFlagHandler = () => {};

export const useFeatureHandler = (): FeatureHandler => {
	const handler = useContext(FeatureContext);

	if (!handler) {
		throw new Error('FeatureContext must wrap current context');
	}

	return handler;
};

export const useFeature = (feature: string): boolean => {
	const handler = useFeatureHandler();

	return handler.get(feature);
};
