import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, test } from 'vitest';
import { Avatar } from './Avatar.tsx';

describe(Avatar, () => {
	// hooks
	afterEach(cleanup);

	// tests
	test.each([
		['Ana Pérez Soto', 'AP'],
		['Juan de la Cruz', 'JC'],
		[null, '?'],
	])('draws the initials of %j: %s', (name, initials) => {
		render(<Avatar data-testid='avatar' name={name} />);

		expect(screen.getByTestId('avatar')).toHaveTextContent(initials);
	});

	test('is decorative: the name next to it is what is read', () => {
		render(
			<Avatar className='extra' data-testid='avatar' name='Ana Pérez' />,
		);

		const avatar = screen.getByTestId('avatar');

		expect(avatar).toHaveAttribute('aria-hidden', 'true');
		expect(avatar).toHaveClass('extra');
	});

	test.each(['sm', 'md', 'lg'] as const)(
		'puts the photo over the initials, which stay underneath (%s)',
		(size) => {
			render(
				<Avatar
					data-testid='avatar'
					name='Ana Pérez'
					size={size}
					src='/photos/ana.jpg'
				/>,
			);

			expect(screen.getByTestId('avatar')).toHaveTextContent('AP');
			expect(
				screen.getByRole('presentation', { hidden: true }),
			).toHaveAttribute('src', '/photos/ana.jpg');
		},
	);
});
