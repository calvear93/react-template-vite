import { cleanup, render, screen } from '@testing-library/react';
import { afterAll, beforeAll, describe, expect, test } from 'vitest';
import { ___ComponentName___ } from './___ComponentName___.tsx';

describe(___ComponentName___, () => {
	// hooks
	beforeAll(() => {
		render(<___ComponentName___ />);
	});

	afterAll(cleanup);

	// tests
	test('has heading level 1 component name', () => {
		const heading = screen.getByRole('heading');

		expect(heading).toHaveTextContent('___ComponentName___');
	});
});
