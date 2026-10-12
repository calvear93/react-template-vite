import { createRouter } from '#libs/router';
import { render, screen } from '@testing-library/react';
import { beforeAll, describe, expect, test } from 'vitest';
import { ___PageName___Page } from './___PageName___.page.tsx';

describe(___PageName___Page, () => {
	// hooks
	beforeAll(() => {
		const Router = createRouter({
			routes: [{ Component: ___PageName___Page }],
			type: 'memory',
		});

		render(<Router />);
	});

	// tests
	test('has heading level 1 page name', () => {
		const heading = screen.getByRole('heading');

		expect(heading).toHaveTextContent('___PageName___Page');
	});
});
