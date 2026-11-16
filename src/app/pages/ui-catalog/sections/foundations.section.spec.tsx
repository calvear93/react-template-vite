import { ICON_NAMES } from '#libs/ui-core';
import { cleanup, render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test } from 'vitest';
import { FoundationsSection } from './foundations.section.tsx';

describe(FoundationsSection, () => {
	// hooks
	beforeEach(() => {
		render(<FoundationsSection />);
	});

	afterEach(cleanup);

	// tests
	test.each([
		'Primary',
		'Surfaces and lines',
		'Inks',
		'Status',
		'Typography',
		'Spacing',
		'Radii and shadows',
		'Motion',
	])('has the example “%s”, named by its title', (title) => {
		expect(screen.getByRole('region', { name: title })).toBeInTheDocument();
	});

	test('shows each color with the name of its token', () => {
		const primary = screen.getByRole('region', { name: 'Primary' });

		expect(
			within(primary).getByText('--ui-color-primary-fill'),
		).toBeInTheDocument();
		expect(screen.getByText('--ui-color-danger-text')).toBeInTheDocument();
	});

	test('lists every icon of the kit by its name', () => {
		const icons = screen.getByRole('region', {
			name: `Icons (${ICON_NAMES.length})`,
		});

		expect(within(icons).getAllByRole('figure')).toHaveLength(
			ICON_NAMES.length,
		);
		expect(within(icons).getByText('alert-triangle')).toBeInTheDocument();
	});

	test('shows the headings and a line of text in each size of the scale', () => {
		const type = within(screen.getByRole('region', { name: 'Typography' }));

		expect(
			type.getByRole('heading', { level: 1, name: 'Module title' }),
		).toBeInTheDocument();
		expect(
			type.getAllByRole('listitem').map((line) => line.textContent),
		).toStrictEqual(
			[12, 13, 14, 16, 18, 20, 24, 28, 32, 36, 40].map(
				(size) => `${size}The quick brown fox jumps over the lazy dog`,
			),
		);
	});
});
