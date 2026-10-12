import { useContext, useSyncExternalStore } from 'react';
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

	// the handler is an external store: subscribe to its changes and read
	// the current value on every render (also when the feature key changes)
	const value = useSyncExternalStore(
		(onStoreChange) => {
			const listener: FeatureOnChangeListener = ({ changedFeatures }) => {
				if (changedFeatures?.[feature] !== undefined) onStoreChange();
			};

			handler.addOnChangeListener(listener);

			return () => handler.removeOnChangeListener(listener);
		},
		() => handler.get(feature),
	);

	return [
		value,
		(newValue: boolean) => handler.set(feature, newValue),
	] as const;
};
