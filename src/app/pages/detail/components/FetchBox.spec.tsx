import { FeatureHandler, FeatureProvider } from '#libs/feature';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, test } from 'vitest';
import { FetchBox } from './FetchBox.tsx';

const LOGO = 'logo.svg';

describe('FetchBox', () => {
	// hooks
	afterEach(() => {
		cleanup();
	});

	// tests
	test('renders v1 lazy variant when FEATURE_FETCHBOX_V1 is enabled', async () => {
		const handler = new FeatureHandler({
			FEATURE_FETCHBOX_V1: true,
		});

		render(
			<FeatureProvider handler={handler}>
				<FetchBox logoSrc={LOGO} />
			</FeatureProvider>,
		);

		const logo = await screen.findByRole('img', { name: 'logo' });

		expect(logo).toHaveAttribute('src', LOGO);
	});

	test('renders v2a variant when FEATURE_FETCHBOX_V2ALPHA is enabled', () => {
		const handler = new FeatureHandler({
			FEATURE_FETCHBOX_V2ALPHA: true,
		});

		render(
			<FeatureProvider handler={handler}>
				<FetchBox logoSrc={LOGO} />
			</FeatureProvider>,
		);

		screen.getByRole('button', { name: 'Fetch' });
	});

	test('renders fallback when no feature is enabled', () => {
		const handler = new FeatureHandler();

		render(
			<FeatureProvider handler={handler}>
				<FetchBox logoSrc={LOGO} />
			</FeatureProvider>,
		);

		screen.getByRole('heading', { name: 'No Features Enabled' });
	});
});
