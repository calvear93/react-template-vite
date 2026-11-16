import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, test } from 'vitest';
import { inChile } from '../../__mocks__/locale.mock.ts';
import { Spinner } from './Spinner.tsx';

inChile();

describe(Spinner, () => {
	// hooks
	afterEach(cleanup);

	// tests
	test('announces that something is loading', () => {
		render(<Spinner />);

		expect(screen.getByRole('status')).toHaveTextContent('Cargando');
	});

	test.each([
		{ showLabel: false },
		{ showLabel: true },
		{ block: true, showLabel: true },
	])('says the label given ($showLabel, $block)', (props) => {
		render(
			<Spinner className='extra' label='Cargando pedidos' {...props} />,
		);

		const spinner = screen.getByRole('status');

		expect(spinner).toHaveTextContent('Cargando pedidos');
		expect(spinner).toHaveClass('extra');
	});
});
