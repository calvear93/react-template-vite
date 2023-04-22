import { beforeAll, describe, expect, test, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { createRouter } from '@router';
import { DetailPage } from './Detail.page';

describe('Detail Page', () => {
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

		const asyncMessage = screen.getByRole('heading', { name: 'anyValue' });

		expect(asyncMessage).toBeInTheDocument();
	});
});
