import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, test } from 'vitest';
import { Skeleton } from './Skeleton.tsx';

describe(Skeleton, () => {
	// hooks
	afterEach(cleanup);

	// tests
	test('is a decorative line of text by default', () => {
		render(<Skeleton className='extra' data-testid='skeleton' />);

		const skeleton = screen.getByTestId('skeleton');

		expect(skeleton).toHaveAttribute('aria-hidden', 'true');
		expect(skeleton).toHaveClass('extra');
		expect(skeleton).toHaveStyle({ blockSize: '1rem', inlineSize: '100%' });
	});

	test('takes the size given, and other styles along with it', () => {
		render(
			<Skeleton
				data-testid='skeleton'
				height='96px'
				style={{ opacity: 0.5 }}
				width='12rem'
			/>,
		);

		expect(screen.getByTestId('skeleton')).toHaveStyle({
			blockSize: '96px',
			inlineSize: '12rem',
			opacity: '0.5',
		});
	});
});
