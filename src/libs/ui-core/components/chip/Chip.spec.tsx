import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, test, vi } from 'vitest';
import { inChile } from '../../__mocks__/locale.mock.ts';
import { Chip } from './Chip.tsx';

inChile();

describe(Chip, () => {
	// hooks
	afterEach(cleanup);

	// tests
	test('shows its label and its count, with nothing to press', () => {
		render(
			<Chip className='extra' count={0} data-testid='chip'>
				Pendientes
			</Chip>,
		);

		const chip = screen.getByTestId('chip');

		expect(chip).toHaveTextContent('Pendientes0');
		expect(chip).toHaveClass('extra');
		expect(screen.queryByRole('button')).not.toBeInTheDocument();
	});

	test.each(['md', 'sm'] as const)(
		'has a button that says what it removes (%s)',
		async (size) => {
			const onRemove = vi.fn();

			render(
				<Chip onRemove={onRemove} size={size}>
					Ana Pérez
				</Chip>,
			);

			await userEvent.click(
				screen.getByRole('button', { name: 'Quitar Ana Pérez' }),
			);

			expect(onRemove).toHaveBeenCalledOnce();
		},
	);

	test('names its remove button with the label given', () => {
		render(
			<Chip onRemove={vi.fn()} removeLabel='Quitar a Ana del equipo'>
				Ana
			</Chip>,
		);

		expect(
			screen.getByRole('button', { name: 'Quitar a Ana del equipo' }),
		).toBeInTheDocument();
	});

	test('falls back to a plain name when its content is not a text', () => {
		render(
			<Chip onRemove={vi.fn()}>
				<strong>Ana</strong>
			</Chip>,
		);

		expect(
			screen.getByRole('button', { name: 'Quitar' }),
		).toBeInTheDocument();
	});
});
