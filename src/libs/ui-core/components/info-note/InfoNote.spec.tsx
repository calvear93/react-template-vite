import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, test } from 'vitest';
import { InfoNote } from './InfoNote.tsx';

describe(InfoNote, () => {
	// hooks
	afterEach(cleanup);

	// tests
	test.each(['neutral', 'info', 'warning'] as const)(
		'shows its title and its text without announcing them (%s)',
		(tone) => {
			render(
				<InfoNote
					className='extra'
					data-testid='note'
					title='Plazo legal'
					tone={tone}
				>
					Dentro de las 24 horas siguientes.
				</InfoNote>,
			);

			const note = screen.getByTestId('note');

			expect(note).toHaveTextContent(
				'Plazo legalDentro de las 24 horas siguientes.',
			);
			expect(note).toHaveClass('extra');
			expect(note).not.toHaveAttribute('role');
		},
	);

	test('works with only its text and another icon', () => {
		render(
			<InfoNote data-testid='note' icon='clock'>
				Actualizado cada hora
			</InfoNote>,
		);

		expect(screen.getByTestId('note')).toHaveTextContent(
			/^Actualizado cada hora$/u,
		);
	});
});
