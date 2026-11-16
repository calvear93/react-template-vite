import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, test } from 'vitest';
import { inChile } from '../../__mocks__/locale.mock.ts';
import { Stepper } from './Stepper.tsx';

inChile();

const STEPS = [
	{ state: 'done', title: 'Datos del trabajador' },
	{ description: 'Qué pasó y dónde', title: 'Descripción' },
	{ state: 'error', title: 'Documentos' },
	{ state: 'disabled', title: 'Envío' },
] as const;

describe(Stepper, () => {
	// hooks
	afterEach(cleanup);

	// tests
	test('says the progress in words', () => {
		render(
			<Stepper
				className='extra'
				current={1}
				data-testid='stepper'
				steps={STEPS}
			/>,
		);

		expect(
			screen.getByText('Paso 2 de 4: Descripción'),
		).toBeInTheDocument();
		expect(screen.getByTestId('stepper')).toHaveClass('extra');
	});

	test.each(['horizontal', 'vertical'] as const)(
		'lists its steps in order, each with its number or its glyph and its state in words (%s)',
		(orientation) => {
			render(
				<Stepper current={1} orientation={orientation} steps={STEPS} />,
			);

			expect(
				screen.getAllByRole('listitem').map((step) => step.textContent),
			).toStrictEqual([
				'Datos del trabajador (Completado)',
				'2DescripciónQué pasó y dónde',
				'Documentos (Con error)',
				'4Envío (No disponible)',
			]);
		},
	);

	test('marks only the step in progress as current', () => {
		render(<Stepper current={2} steps={STEPS} />);

		expect(
			screen
				.getAllByRole('listitem')
				.map((step) => step.getAttribute('aria-current')),
		).toStrictEqual([null, null, 'step', null]);
	});

	test('shows only the summary when compact', () => {
		render(<Stepper compact current={0} steps={STEPS} />);

		expect(
			screen.getByText('Paso 1 de 4: Datos del trabajador'),
		).toBeInTheDocument();
		expect(screen.queryByRole('list')).not.toBeInTheDocument();
	});

	test('says the progress and the states with the words given', () => {
		render(
			<Stepper
				current={0}
				labels={{ done: 'Listo' }}
				steps={STEPS}
				summary={(current, total) => `Etapa ${current}/${total}`}
			/>,
		);

		expect(screen.getByText('Etapa 1/4')).toBeInTheDocument();
		expect(screen.getAllByRole('listitem')[0]).toHaveTextContent(
			'Datos del trabajador (Listo)',
		);
	});

	test('keeps its summary even when the current step does not exist', () => {
		render(<Stepper current={9} steps={STEPS} />);

		expect(screen.getByText('Paso 10 de 4:')).toBeInTheDocument();
	});
});
