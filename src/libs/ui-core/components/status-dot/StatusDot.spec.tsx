import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, test } from 'vitest';
import { StatusDot } from './StatusDot.tsx';

describe(StatusDot, () => {
	// hooks
	afterEach(cleanup);

	// tests
	test('decorates next to a text: hidden from assistive technology', () => {
		render(<StatusDot data-testid='dot' />);

		expect(screen.getByTestId('dot')).toHaveAttribute(
			'aria-hidden',
			'true',
		);
		expect(screen.queryByRole('img')).not.toBeInTheDocument();
	});

	test.each(['success', 'warning', 'danger', 'neutral'] as const)(
		'says its state in words when it stands alone (%s)',
		(tone) => {
			render(
				<StatusDot
					className='extra'
					label='Sin conexión'
					pulse
					tone={tone}
				/>,
			);

			const dot = screen.getByRole('img', { name: 'Sin conexión' });

			expect(dot).not.toHaveAttribute('aria-hidden');
			expect(dot).toHaveClass('extra');
		},
	);
});
