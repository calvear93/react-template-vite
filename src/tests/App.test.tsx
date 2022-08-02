import {
    render,
    screen,
    waitForElementToBeRemoved
} from '@testing-library/react';
import { App } from 'app/App';

describe('App', () => {
    beforeAll(async () => {
        render(<App />);

        // waits for lazy loading
        await waitForElementToBeRemoved(() => screen.queryByText('Loading'));
    });

    test('has header (banner role) with content "HEADER BASE"', () => {
        const header = screen.getByRole('banner');

        expect(header).toHaveTextContent('HEADER BASE');
    });
});
