import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, test } from 'vitest';
import { GroupHeader } from './GroupHeader.tsx';

describe(GroupHeader, () => {
	// hooks
	afterEach(cleanup);

	// tests
	test('titles its group with a heading of level 3, its context and its action', () => {
		render(
			<GroupHeader
				action={<button type='button'>Ver todos</button>}
				className='extra'
				context='3 de 5'
				data-testid='header'
				icon='document'
				title='Documentos'
			/>,
		);

		expect(
			screen.getByRole('heading', { level: 3, name: 'Documentos' }),
		).toBeInTheDocument();
		expect(screen.getByText('3 de 5')).toBeInTheDocument();
		expect(
			screen.getByRole('button', { name: 'Ver todos' }),
		).toBeInTheDocument();
		expect(screen.getByTestId('header')).toHaveClass('extra');
	});

	test('takes another heading level, highlighted', () => {
		render(<GroupHeader headingLevel={2} highlighted title='Resumen' />);

		expect(
			screen.getByRole('heading', { level: 2, name: 'Resumen' }),
		).toBeInTheDocument();
	});
});
