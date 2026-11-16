import { cleanup, render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { afterEach, describe, expect, test } from 'vitest';
import { Page } from './Page.tsx';

describe(Page, () => {
	// hooks
	afterEach(cleanup);

	// tests
	test('holds the blocks of a page', () => {
		const ref = createRef<HTMLDivElement>();

		render(
			<Page
				aria-label='Órdenes'
				className='extra'
				ref={ref}
				role='region'
			>
				<h1>Órdenes</h1>
			</Page>,
		);

		const page = screen.getByRole('region', { name: 'Órdenes' });

		expect(page).toContainElement(screen.getByRole('heading'));
		expect(page).toHaveClass('extra');
		expect(ref.current).toBe(page);
	});

	test('can be narrow', () => {
		render(
			<>
				<Page aria-label='Ancha' role='region' />
				<Page aria-label='Angosta' narrow role='region' />
			</>,
		);

		expect(
			screen.getByRole('region', { name: 'Angosta' }).className,
		).not.toBe(screen.getByRole('region', { name: 'Ancha' }).className);
	});
});
