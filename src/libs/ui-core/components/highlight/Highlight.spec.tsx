import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, test } from 'vitest';
import { Highlight } from './Highlight.tsx';

describe(Highlight, () => {
	// hooks
	afterEach(cleanup);

	// tests
	test('marks the words searched, accents and case aside', () => {
		render(
			<p>
				<Highlight query='ana perez' text='Pérez Soto, Ana' />
			</p>,
		);

		expect(screen.getByRole('paragraph')).toHaveTextContent(
			'Pérez Soto, Ana',
		);
		expect(
			screen.getAllByRole('mark').map((mark) => mark.textContent),
		).toStrictEqual(['Pérez', 'Ana']);
	});

	test('leaves the text as it is when nothing matches', () => {
		render(
			<p>
				<Highlight query='' text='Ana Pérez' />
			</p>,
		);

		expect(screen.getByRole('paragraph')).toHaveTextContent('Ana Pérez');
		expect(screen.queryByRole('mark')).not.toBeInTheDocument();
	});
});
