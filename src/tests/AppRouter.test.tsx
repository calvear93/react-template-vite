import { beforeAll, describe, expect, test } from 'vitest';
import { Provider } from 'react-redux';
import { MemoryRouter } from '@router';
import {
    render,
    screen,
    waitFor
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AppRouter } from 'app/App.router';
import { AppStore } from 'app/App.store';

describe('App', () => {
    const env = import.meta.env.VITE_APP_ENV;

    beforeAll(async () => {
        render(
            <MemoryRouter>
                <Provider store={AppStore}>
                    <AppRouter />
                </Provider>
            </MemoryRouter>
        );

        // waits for lazy loading
        await waitFor(() => screen.findByText('Go To Detail'));
    });

    test('has header (banner role) with content "App"', () => {
        const header = screen.getByRole('banner');

        expect(header).toHaveTextContent('App');
    });

    test('has footer (contentinfo role) with content "Footer"', () => {
        const footer = screen.getByRole('contentinfo');

        expect(footer).toHaveTextContent('Footer');
    });

    test('navigates to detail page', async () => {
        const anchor = screen.getByRole('link', { name: 'Go To Detail' });

        userEvent.click(anchor);

        const asyncMessage = await waitFor(() => screen.findByText(env), {
            timeout: 1000
        });

        expect(asyncMessage.tagName).toBe('H2');
    });
});
