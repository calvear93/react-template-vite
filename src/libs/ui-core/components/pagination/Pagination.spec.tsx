import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, test, vi } from 'vitest';
import { inChile } from '../../__mocks__/locale.mock.ts';
import { Pagination } from './Pagination.tsx';

inChile();

const names = (role: 'button' | 'link') =>
	screen
		.getAllByRole(role)
		.map((control) => control.getAttribute('aria-label'));

const PREVIOUS = 'Página anterior';
const NEXT = 'Página siguiente';

describe(Pagination, () => {
	// hooks
	afterEach(cleanup);

	// tests
	test('is a named navigation with the window of pages around the current one', () => {
		render(
			<Pagination
				className='extra'
				onPageChange={vi.fn()}
				page={5}
				pages={9}
			/>,
		);

		expect(
			screen.getByRole('navigation', { name: 'Paginación' }),
		).toHaveClass('extra');
		expect(names('button')).toStrictEqual([
			PREVIOUS,
			'Página 1',
			'Página 4',
			'Página 5',
			'Página 6',
			'Página 9',
			NEXT,
		]);
		expect(
			screen.getByRole('button', { name: 'Página 5' }),
		).toHaveAttribute('aria-current', 'page');
	});

	test('tells the page chosen, and nothing for the current one', async () => {
		const onPageChange = vi.fn();

		render(<Pagination onPageChange={onPageChange} page={5} pages={9} />);

		await userEvent.click(screen.getByRole('button', { name: 'Página 6' }));
		await userEvent.click(screen.getByRole('button', { name: PREVIOUS }));
		await userEvent.click(screen.getByRole('button', { name: 'Página 5' }));

		expect(onPageChange.mock.calls).toStrictEqual([[6], [4]]);
	});

	test.each([
		{ disabled: [PREVIOUS, 'Primera página'], page: 1 },
		{ disabled: [NEXT, 'Última página'], page: 9 },
	])(
		'disables, never removes, the controls at the end (page $page)',
		({ disabled, page }) => {
			render(
				<Pagination
					edges
					onPageChange={vi.fn()}
					page={page}
					pages={9}
				/>,
			);

			for (const name of disabled)
				expect(screen.getByRole('button', { name })).toBeDisabled();
		},
	);

	test('goes to the first and the last page from its edges', async () => {
		const onPageChange = vi.fn();

		render(
			<Pagination edges onPageChange={onPageChange} page={5} pages={9} />,
		);

		await userEvent.click(
			screen.getByRole('button', { name: 'Primera página' }),
		);
		await userEvent.click(
			screen.getByRole('button', { name: 'Última página' }),
		);

		expect(onPageChange.mock.calls).toStrictEqual([[1], [9]]);
	});

	test('draws its controls as links to the pages when it has an href', () => {
		render(
			<Pagination
				href={(page) => `/reports?page=${page}`}
				page={2}
				pages={3}
			/>,
		);

		expect(
			screen
				.getAllByRole('link')
				.map((link) => link.getAttribute('href')),
		).toStrictEqual([
			'/reports?page=1',
			'/reports?page=1',
			'/reports?page=3',
			'/reports?page=3',
		]);
		// the current page is not a link: there is nowhere to go
		expect(names('button')).toStrictEqual(['Página 2']);
	});

	test('says the position in words when brief', () => {
		render(<Pagination brief onPageChange={vi.fn()} page={2} pages={9} />);

		expect(screen.getByText('Página 2 de 9')).toBeInTheDocument();
		expect(names('button')).toStrictEqual([PREVIOUS, NEXT]);
	});

	test.each([
		{ page: 0, pages: 0, shows: 'Página 1 de 1' },
		{ page: 99, pages: 4, shows: 'Página 4 de 4' },
		{ page: Number.NaN, pages: 3.9, shows: 'Página 1 de 3' },
	])('keeps page $page of $pages within range', ({ page, pages, shows }) => {
		render(<Pagination brief page={page} pages={pages} />);

		expect(screen.getByText(shows)).toBeInTheDocument();
	});

	test('takes the texts given', () => {
		render(
			<Pagination
				labels={{
					navigation: 'Páginas de denuncias',
					page: (n) => `Ir a ${n}`,
				}}
				onPageChange={vi.fn()}
				page={1}
				pages={2}
			/>,
		);

		expect(
			screen.getByRole('navigation', { name: 'Páginas de denuncias' }),
		).toBeInTheDocument();
		expect(screen.getByRole('button', { name: 'Ir a 2' })).toBeEnabled();
	});

	test('names its pages with its own text for one given as undefined', () => {
		render(
			<Pagination
				labels={{ next: undefined, page: undefined }}
				onPageChange={vi.fn()}
				page={5}
				pages={9}
			/>,
		);

		expect(screen.getByRole('button', { name: 'Página 5' })).toBeVisible();
		expect(screen.getByRole('button', { name: NEXT })).toBeVisible();
	});
});
