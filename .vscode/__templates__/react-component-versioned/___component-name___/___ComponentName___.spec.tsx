import { FeatureHandler, FeatureProvider } from '#libs/feature';
import { cleanup, render, screen } from '@testing-library/react';
import { afterAll, beforeAll, describe, expect, test } from 'vitest';
import { ___ComponentName___ } from './___ComponentName___.tsx';

describe(___ComponentName___, () => {
	const featureHandler = new FeatureHandler({
		FEATURE_V2: true,
	});

	// hooks
	beforeAll(() => {
		render(
			<FeatureProvider handler={featureHandler}>
				<___ComponentName___ title='sample' />
			</FeatureProvider>,
		);
	});

	afterAll(cleanup);

	// tests
	// V2 is lazy-loaded: wait for it with findBy*
	test('has heading level 1 with "sample" content', async () => {
		const heading = await screen.findByRole('heading', { level: 1 });

		expect(heading).toHaveTextContent('sample');
	});

	test('has span with component name content', async () => {
		const span = await screen.findByText('___ComponentName___V2');

		expect(span.tagName).toBe('SPAN');
	});
});
