import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, test } from 'vitest';
import { Separator } from './Separator.tsx';

describe(Separator, () => {
	// hooks
	afterEach(cleanup);

	// tests
	test('is only a line by default: hidden from assistive technology', () => {
		render(<Separator className='extra' data-testid='line' />);

		const line = screen.getByTestId('line');

		expect(line).toHaveAttribute('aria-hidden', 'true');
		expect(line).toHaveClass('extra');
		expect(screen.queryByRole('separator')).not.toBeInTheDocument();
	});

	test.each(['horizontal', 'vertical'] as const)(
		'is a %s separator when it is not decorative',
		(orientation) => {
			render(<Separator decorative={false} orientation={orientation} />);

			expect(screen.getByRole('separator')).toHaveAttribute(
				'aria-orientation',
				orientation,
			);
		},
	);

	test('draws a decorative vertical line', () => {
		render(<Separator data-testid='line' orientation='vertical' />);

		expect(screen.getByTestId('line')).not.toHaveAttribute(
			'aria-orientation',
		);
	});
});
