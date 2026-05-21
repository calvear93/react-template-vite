import { FeatureHandler, FeatureProvider } from '#libs/feature';
import { createRouter } from '#libs/router';
import {
	act,
	cleanup,
	fireEvent,
	render,
	screen,
} from '@testing-library/react';
import { afterAll, beforeAll, describe, expect, test, vi } from 'vitest';
import { InversionOfControlProvider } from '../../app.ioc.ts';
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

		// mock IoC container dependencies
		const mockIoCValues = new Map();
		mockIoCValues.set('injectionToken', { example: 'mocked-demo-value' });

		render(
			<InversionOfControlProvider values={mockIoCValues}>
				<FeatureProvider handler={features}>
					<DetailPageRouter />
				</FeatureProvider>
			</InversionOfControlProvider>,
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

	test('should display injected data from IoC container', () => {
		const injectedDataElement = screen.getByTestId('injected-data');

		expect(injectedDataElement).toBeInTheDocument();
		expect(injectedDataElement).toHaveTextContent(
			'Injected example data: mocked-demo-value',
		);
	});

	describe('with route id param', () => {
		// hooks
		beforeAll(() => {
			cleanup();

			const DetailPageRouter = createRouter({
				options: { initialEntries: ['/detail/42'] },
				routes: [{ Component: DetailPage, path: '/detail/:id?' }],
				type: 'memory',
			});

			const features = new FeatureHandler({
				FEATURE_FETCHBOX_V2ALPHA: true,
			});
			const mockIoCValues = new Map();
			mockIoCValues.set('injectionToken', {
				example: 'mocked-demo-value',
			});

			render(
				<InversionOfControlProvider values={mockIoCValues}>
					<FeatureProvider handler={features}>
						<DetailPageRouter />
					</FeatureProvider>
				</InversionOfControlProvider>,
			);
		});

		// tests
		test('renders heading with the id from the URL', () => {
			screen.getByRole('heading', { name: 'ID: 42' });
		});
	});
});
