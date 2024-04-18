import { useContext, useEffect, useState } from 'react';
import type {
	FeatureHandler,
	FeatureOnChangeListener,
} from '../feature.handler.ts';
import { FeatureContext } from './Feature.provider.tsx';

export const useFeatureHandler = (): FeatureHandler => {
	const handler = useContext(FeatureContext);

	if (!handler) {
		throw new Error('FeatureContext must wrap current context');
	}

	return handler;
};

export const useFeature = (feature: string) => {
	const handler = useFeatureHandler();
	const [value, setFeature] = useState(handler.get(feature));

	useEffect(() => {
		const action: FeatureOnChangeListener = ({ changedFlags }) => {
			const newValue = changedFlags?.[feature];
			if (newValue !== undefined) {
				setFeature(newValue);
			}
		};

		handler.addOnChangeListener(action);

		return () => handler.removeOnChangeListener(action);
	}, [feature]);

	return [value, (value: boolean) => handler.set(feature, value)] as const;
};
