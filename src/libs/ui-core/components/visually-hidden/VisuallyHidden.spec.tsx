import { cleanup, render, screen } from '@testing-library/react';
import { afterAll, beforeAll, describe, expect, test } from 'vitest';
import { VisuallyHidden } from './VisuallyHidden.tsx';

describe(VisuallyHidden, () => {
	// hooks
	beforeAll(() => {
		render(
			<VisuallyHidden className='extra' role='status'>
				3 resultados
			</VisuallyHidden>,
		);
	});

	afterAll(cleanup);

	// tests
	test('keeps its text reachable by role', () => {
		expect(screen.getByRole('status')).toHaveTextContent('3 resultados');
	});

	test('keeps the class given', () => {
		expect(screen.getByRole('status')).toHaveClass('extra');
	});
});
