import { act, fireEvent, render, screen } from '@testing-library/react';
import { FeatureHandler, FeatureProvider } from '#libs/feature';
import { createRouter } from '#libs/router';
import { afterAll, beforeAll, describe, test, vi } from 'vitest';
import { DetailPage } from './Detail.page.tsx';

describe(DetailPage, () => {
	// hooks
	beforeAll(() => {
		vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });

		const DetailPageRouter = createRouter({
			routes: [{ Component: DetailPage }],
			type: 'memory',
		});

		const features = new FeatureHandler({
			FEATURE_FETCHBOX_V2ALPHA: true,
		});

		render(
			<FeatureProvider handler={features}>
				<DetailPageRouter />
			</FeatureProvider>,
		);
	});

	afterAll(() => {
		vi.useRealTimers();
	});

	// tests
	test('fetch data clicking button', async () => {
		const button = screen.getByRole('button', { name: 'Fetch' });

		fireEvent.click(button);
		await act(async () => {
			await vi.advanceTimersToNextTimerAsync();
		});

		screen.getByRole('heading', { name: 'anyValue' });
	});
});
