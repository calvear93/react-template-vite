import { withFeatures } from '#libs/feature';
import { lazy } from 'react';
import { ___ComponentName___V1 } from './___ComponentName___.v1.tsx';

/**
 * ___ComponentName___ component.
 *
 * @returns component
 */
export const ___ComponentName___ = withFeatures<___ComponentName___Props>({
	fallback: <h1>No Features Enabled</h1>,
	loading: <h2>Loading Feature</h2>,
	features: {
		FEATURE_V1: ___ComponentName___V1,
		// lazy load chunk
		FEATURE_V2: lazy(async () => {
			const { ___ComponentName___V2 } =
				await import('./___ComponentName___.v2.tsx');

			return { default: ___ComponentName___V2 };
		}),
	},
});

export interface ___ComponentName___Props {
	title?: string;
}
