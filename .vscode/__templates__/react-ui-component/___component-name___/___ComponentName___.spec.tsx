import { cleanup, render, screen } from '@testing-library/react';
import { afterAll, beforeAll, describe, expect, test } from 'vitest';
import { ___ComponentName___ } from './___ComponentName___.tsx';

describe(___ComponentName___, () => {
	// hooks
	beforeAll(() => {
		render(
			<___ComponentName___ className='extra' role='group'>
				content
			</___ComponentName___>,
		);
	});

	afterAll(cleanup);

	// tests
	test('renders its content', () => {
		expect(screen.getByRole('group')).toHaveTextContent('content');
	});

	test('keeps the class given along with its own', () => {
		expect(screen.getByRole('group')).toHaveClass('extra');
	});
});
