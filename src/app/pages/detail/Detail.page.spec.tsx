import { describe, expect, test } from 'vitest';
import { StoreProvider } from 'easy-peasy';
import { MemoryRouter } from '@router';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AppStore } from 'app/App.store';
import { DetailPage } from './Detail.page';

describe('Detail Page', () => {
	test('fetch data clicking button', async () => {
		render(
			<MemoryRouter>
				<StoreProvider store={AppStore}>
					<DetailPage />
				</StoreProvider>
			</MemoryRouter>
		);

		const button = screen.getByRole('button', { name: 'Fetch' });

		userEvent.click(button);

		const asyncMessage = await waitFor(
			() => screen.findByText('anyValue'),
			{
				timeout: 4000
			}
		);

		expect(asyncMessage).toBeInTheDocument();
	});
});
