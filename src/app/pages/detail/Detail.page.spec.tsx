import { Provider } from 'react-redux';
import { MemoryRouter } from '@router';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AppStore } from 'app/App.store';
import { DetailPage } from './Detail.page';

describe('Detail Page', () => {
    test('fetch data clicking button', async () => {
        render(
            <MemoryRouter>
                <Provider store={AppStore}>
                    <DetailPage />
                </Provider>
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
