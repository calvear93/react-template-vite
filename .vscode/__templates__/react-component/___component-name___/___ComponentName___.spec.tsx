import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterAll, beforeAll, describe, expect, test } from 'vitest';
import { ___ComponentName___ } from './___ComponentName___.tsx';

describe(___ComponentName___, () => {
	// hooks
	beforeAll(() => {
		render(<___ComponentName___ title='sample' />);
	});

	afterAll(cleanup);

	// tests
	test('has heading level 1 with "sample" content', () => {
		const heading = screen.getByRole('heading');

		expect(heading).toHaveTextContent('sample');
	});

	test('has span with component name content', () => {
		const span = screen.getByText('___ComponentName___');

		expect(span.tagName).toBe('SPAN');
	});

	test('counts button clicks', async () => {
		await userEvent.click(screen.getByRole('button'));

		expect(screen.getByRole('button')).toHaveTextContent('clicks: 1');
	});
});
