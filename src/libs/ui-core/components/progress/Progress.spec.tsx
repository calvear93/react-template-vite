import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, test } from 'vitest';
import { Progress } from './Progress.tsx';

describe(Progress, () => {
	// hooks
	afterEach(cleanup);

	// tests
	test('is a progress bar named by its label, with its value in words', () => {
		render(
			<Progress
				className='extra'
				data-testid='progress'
				label='Documentos cargados'
				max={5}
				value={3}
			/>,
		);

		const bar = screen.getByRole('progressbar', {
			name: 'Documentos cargados',
		});

		expect(bar).toHaveValue(3);
		expect(bar).toHaveAttribute('aria-valuemin', '0');
		expect(bar).toHaveAttribute('aria-valuemax', '5');
		expect(screen.getByText('60%')).toBeInTheDocument();
		expect(screen.getByTestId('progress')).toHaveClass('extra');
	});

	test.each([
		{ percent: '100%', shown: 100, value: 250 },
		{ percent: '0%', shown: 0, value: -5 },
		{ percent: '33%', shown: 33, value: 33 },
	])(
		'keeps $value within its range: $percent',
		({ percent, shown, value }) => {
			render(<Progress label='Avance' tone='danger' value={value} />);

			expect(screen.getByRole('progressbar')).toHaveValue(shown);
			expect(screen.getByText(percent)).toBeInTheDocument();
		},
	);

	test.each([
		{ case: 'no value', props: {} },
		{ case: 'a value that is not a number', props: { value: Number.NaN } },
		{ case: 'a maximum of zero', props: { max: 0, value: 3 } },
	])('is indeterminate with $case: no value, no percentage', ({ props }) => {
		render(<Progress label='Enviando' {...props} />);

		const bar = screen.getByRole('progressbar', { name: 'Enviando' });

		expect(bar).not.toHaveAttribute('aria-valuenow');
		expect(bar).toHaveAttribute('data-indeterminate');
		expect(screen.queryByText(/%$/u)).not.toBeInTheDocument();
	});
});
