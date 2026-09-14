import { useContext, useEffect, useState } from 'react';
import type {
	FeatureHandler,
	FeatureOnChangeListener,
} from '../feature.handler.ts';
import { FeatureContextException } from './exceptions/feature-context.exception.ts';
import { FeatureContext } from './Feature.provider.tsx';

/**
 * Returns feature handler.
 * It does not get triggered on features changes,
 * use "addOnChangeListener" for observes it.
 */
export const useFeatureHandler = (): FeatureHandler => {
	const handler = useContext(FeatureContext);

	if (!handler) throw new FeatureContextException();

	return handler;
};

/**
 * Returns a feature and allows to set it.
 * Rerenders the component if any change occurs.
 */
export const useFeature = (feature: string) => {
	const handler = useFeatureHandler();
	const [value, setValue] = useState(handler.get(feature));

	useEffect(() => {
		// re-sync the value when the feature key (or handler) changes,
		// otherwise the state keeps the previously observed feature's value
		setValue(handler.get(feature));

		const listener: FeatureOnChangeListener = ({ changedFeatures }) => {
			const newValue = changedFeatures?.[feature];
			if (newValue !== undefined) {
				setValue(newValue);
			}
		};

		handler.addOnChangeListener(listener);

		return () => handler.removeOnChangeListener(listener);
	}, [feature, handler]);

	return [
		value,
		(newValue: boolean) => handler.set(feature, newValue),
	] as const;
};
