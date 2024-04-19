import { withFeatures } from '#libs/feature';
import { lazy } from 'react';
import { FetchBox_v2a } from './FetchBox.v2a.tsx';

// feature managing example
export const FetchBox = withFeatures({
	fallback: <h1>No Features Enabled</h1>,
	features: {
		// lazy load chunk
		FEATURE_FETCHBOX_V1: lazy(() =>
			import('./FetchBox.v1.tsx').then(({ FetchBox_v1 }) => ({
				default: FetchBox_v1,
			})),
		),
		FEATURE_FETCHBOX_V2ALPHA: FetchBox_v2a,
	},
	loading: <h2>Loading Feature</h2>,
});
