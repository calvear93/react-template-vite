import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, test } from 'vitest';
import { inChile } from '../../__mocks__/locale.mock.ts';
import { Timeline } from './Timeline.tsx';

inChile();

const ITEMS = [
	{ date: '02-11-2026 09:14', state: 'done', title: 'Denuncia recibida' },
	{
		detail: 'Dr. Soto revisa los antecedentes',
		icon: 'health',
		state: 'current',
		title: 'En evaluación médica',
	},
	{ title: 'Resolución' },
] as const;

describe(Timeline, () => {
	// hooks
	afterEach(cleanup);

	// tests
	test('lists its milestones in order, each with its state in words', () => {
		render(<Timeline className='extra' items={ITEMS} />);

		expect(screen.getByRole('list')).toHaveClass('extra');
		expect(
			screen.getAllByRole('listitem').map((item) => item.textContent),
		).toStrictEqual([
			'Denuncia recibida (Completado)02-11-2026 09:14',
			'En evaluación médica (En curso)Dr. Soto revisa los antecedentes',
			'Resolución (Pendiente)',
		]);
	});

	test('marks only the milestone in course as the current step', () => {
		render(<Timeline items={ITEMS} />);

		expect(
			screen
				.getAllByRole('listitem')
				.map((item) => item.getAttribute('aria-current')),
		).toStrictEqual([null, 'step', null]);
	});

	test('says the states with the words given', () => {
		render(
			<Timeline
				items={[{ title: 'Paso' }]}
				labels={{ pending: 'Aún no ocurre' }}
			/>,
		);

		expect(screen.getByRole('listitem')).toHaveTextContent(
			'Paso (Aún no ocurre)',
		);
	});
});
