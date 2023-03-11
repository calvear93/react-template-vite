import { describe, expect, test } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from '@router';
import { DetailPage } from './Detail.page';

describe('Detail Page', () => {
	// tests
	test('fetch data clicking button', async () => {
		render(
			<MemoryRouter>
				<DetailPage />
			</MemoryRouter>
		);

		const button = screen.getByRole('button', { name: 'Fetch' });

		await userEvent.click(button);

		const asyncMessage = await waitFor(
			() => screen.findByText('anyValue'),
			{
				timeout: 4000,
			}
		);

		expect(asyncMessage).toBeInTheDocument();
	});
});
