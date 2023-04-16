import { beforeAll, describe, expect, test } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen, waitFor } from '@testing-library/react';
import { createRouter } from '@router';
import { DetailPage } from './Detail.page';

describe('Detail Page', () => {
	// hooks
	beforeAll(() => {
		const DetailPageRouter = createRouter({
			routes: [{ Component: DetailPage }],
			type: 'memory',
		});

		render(<DetailPageRouter />);
	});

	// tests
	test('fetch data clicking button', async () => {
		const button = screen.getByRole('button', { name: 'Fetch' });
		await userEvent.click(button);

		const asyncMessage = await waitFor(
			() => screen.findByText('anyValue'),
			{
				timeout: 3000,
				container: button,
			},
		);

		expect(asyncMessage).toBeInTheDocument();
	});
});
