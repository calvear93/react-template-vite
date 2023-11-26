import { afterAll, beforeAll, describe, test, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { createRouter } from '@router';
import { DetailPage } from './Detail.page.tsx';

describe(DetailPage, () => {
	// hooks
	beforeAll(() => {
		vi.useFakeTimers();

		const DetailPageRouter = createRouter({
			routes: [{ Component: DetailPage }],
			type: 'memory',
		});

		render(<DetailPageRouter />);
	});

	afterAll(() => {
		vi.useRealTimers();
	});

	// tests
	test('fetch data clicking button', async () => {
		const button = screen.getByRole('button', { name: 'Fetch' });
		button.click();
		await vi.advanceTimersToNextTimerAsync();

		screen.getByRole('heading', { name: 'anyValue' });
	});
});
