import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, test } from 'vitest';
import { ICON_NAMES, ICONS } from './icon.registry.ts';
import { Icon } from './Icon.tsx';

describe(Icon, () => {
	// hooks
	afterEach(cleanup);

	// tests
	test('decorates by default: hidden from assistive technology', () => {
		render(<Icon data-testid='icon' name='search' />);

		const icon = screen.getByTestId('icon');

		expect(icon).toHaveAttribute('aria-hidden', 'true');
		expect(icon).toHaveAttribute('focusable', 'false');
		expect(screen.queryByRole('img')).not.toBeInTheDocument();
	});

	test('becomes an image with a name when it has a label', () => {
		render(<Icon label='Requiere gestión' name='alert-triangle' />);

		const icon = screen.getByRole('img', { name: 'Requiere gestión' });

		expect(icon).not.toHaveAttribute('aria-hidden');
		expect(icon).toHaveAttribute('viewBox', '0 0 24 24');
		expect(icon).toHaveAttribute('stroke', 'currentColor');
	});

	test('draws every shape of the icon without a fill', () => {
		render(<Icon label='Calendario' name='calendar' />);

		const markup = screen.getByRole('img').innerHTML;

		expect(markup.match(/<(?:path|rect) /gu)).toHaveLength(
			ICONS.calendar.length,
		);
		expect(markup.match(/ fill="none"/gu)).toHaveLength(
			ICONS.calendar.length,
		);
	});

	test.each(['xs', 'sm', 'md', 'lg'] as const)(
		'accepts the size %s and keeps the class given',
		(size) => {
			render(
				<Icon
					className='extra'
					label='Buscar'
					name='search'
					size={size}
				/>,
			);

			expect(screen.getByRole('img')).toHaveClass('extra');
		},
	);

	test('lists its names sorted, each with shapes', () => {
		expect(ICON_NAMES).toStrictEqual(ICON_NAMES.toSorted());
		expect(ICON_NAMES.every((name) => ICONS[name].length > 0)).toBe(true);
	});
});
