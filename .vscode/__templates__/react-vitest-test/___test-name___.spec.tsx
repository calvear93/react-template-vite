import { cleanup, render } from '@testing-library/react';
import { afterAll, beforeAll, describe, expect, test } from 'vitest';

describe('___TestName___', () => {
	// hooks
	beforeAll(() => {
		render(<h1>Hello World</h1>);
	});

	afterAll(cleanup); // auto-cleanup is off: render once, clean up at the end

	// tests
	test('1 to be 1', () => {
		expect(1).toBe(1);
	});
});
