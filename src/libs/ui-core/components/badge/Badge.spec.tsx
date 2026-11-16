import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, test } from 'vitest';
import { Badge } from './Badge.tsx';

describe(Badge, () => {
	// hooks
	afterEach(cleanup);

	// tests
	test.each([
		'neutral',
		'primary',
		'brand',
		'info',
		'success',
		'warning',
		'danger',
	] as const)('says its word in the tone %s', (tone) => {
		render(<Badge tone={tone}>Vigente</Badge>);

		expect(screen.getByText('Vigente')).toBeInTheDocument();
	});

	test.each(['sm', 'md', 'lg'] as const)(
		'keeps only its word as text with a dot, at size %s',
		(size) => {
			render(
				<Badge className='extra' data-testid='badge' dot size={size}>
					En curso
				</Badge>,
			);

			const badge = screen.getByTestId('badge');

			expect(badge).toHaveTextContent(/^En curso$/u);
			expect(badge).toHaveClass('extra');
		},
	);
});
