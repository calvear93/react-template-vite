import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, test, vi } from 'vitest';
import { inChile } from '../../__mocks__/locale.mock.ts';
import { Pager } from './Pager.tsx';

inChile();

describe(Pager, () => {
	// hooks
	afterEach(cleanup);

	// tests
	test.each([
		{
			props: { page: 2, pages: 121, size: 25, total: 3021 },
			says: 'Mostrando 26–50 de 3.021 casos',
		},
		{
			props: { page: 121, pages: 121, size: 25, total: 3021 },
			says: 'Mostrando 3.001–3.021 de 3.021 casos',
		},
		{
			props: { page: 1, pages: 1, size: 25, total: 1 },
			says: 'Mostrando 1–1 de 1 caso',
		},
		{
			props: { page: 2, pages: 9, total: 210 },
			says: '210 casos · página 2 de 9',
		},
		{ props: { page: 1, pages: 0, size: 25, total: 0 }, says: '0 casos' },
	])('says what is shown: «$says»', ({ props, says }) => {
		render(<Pager className='extra' noun={['caso', 'casos']} {...props} />);

		expect(screen.getByRole('status')).toHaveTextContent(says);
	});

	test('has no page controls with a single page', () => {
		render(<Pager onPageChange={vi.fn()} page={1} pages={1} total={8} />);

		expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
		expect(screen.getByRole('status')).toHaveTextContent(
			'8 resultados · página 1 de 1',
		);
	});

	test('moves between pages with its pagination, with edges on request', async () => {
		const onPageChange = vi.fn();

		render(
			<Pager
				edges
				onPageChange={onPageChange}
				page={2}
				pages={9}
				total={210}
			/>,
		);

		await userEvent.click(
			screen.getByRole('button', { name: 'Página siguiente' }),
		);
		await userEvent.click(
			screen.getByRole('button', { name: 'Última página' }),
		);

		expect(onPageChange.mock.calls).toStrictEqual([[3], [9]]);
	});

	test('offers the rows per page, including the current one, and tells the choice', async () => {
		const onSizeChange = vi.fn();

		render(
			<Pager
				onSizeChange={onSizeChange}
				page={1}
				pages={4}
				size={40}
				sizes={[25, 50, 100]}
				total={150}
			/>,
		);

		const select = screen.getByRole('combobox', {
			name: 'Filas por página',
		});

		expect(select).toHaveValue('40');
		expect(
			screen.getAllByRole('option').map((option) => option.textContent),
		).toStrictEqual(['25', '40', '50', '100']);

		await userEvent.selectOptions(select, '100');

		expect(onSizeChange).toHaveBeenCalledExactlyOnceWith(100);
	});

	test('goes to the page typed, and refuses one out of range saying why', async () => {
		const onPageChange = vi.fn();

		render(
			<Pager
				jump
				onPageChange={onPageChange}
				page={2}
				pages={1200}
				total={30_000}
			/>,
		);

		const field = screen.getByRole<HTMLInputElement>('spinbutton', {
			name: 'Ir a página',
		});

		await userEvent.type(field, '5000');
		await userEvent.click(screen.getByRole('button', { name: 'Ir' }));

		expect(onPageChange).not.toHaveBeenCalled();
		expect(field.validationMessage).toBe('Entre 1 y 1.200');

		await userEvent.clear(field);
		await userEvent.type(field, '37{Enter}');

		expect(field.validationMessage).toBe('');
		expect(onPageChange).toHaveBeenCalledExactlyOnceWith(37);
		expect(field).toHaveValue(null);
	});

	test.each([
		{ case: 'only two pages', props: { pages: 2 } },
		{ case: 'no listener', props: { onPageChange: undefined, pages: 9 } },
	])('hides the jump with $case', ({ props }) => {
		render(
			<Pager
				jump
				onPageChange={vi.fn()}
				page={1}
				total={50}
				{...props}
			/>,
		);

		expect(screen.queryByRole('spinbutton')).not.toBeInTheDocument();
	});

	test('takes the texts given', () => {
		render(
			<Pager
				labels={{ pageOf: (page, pages) => `hoja ${page}/${pages}` }}
				page={3}
				pages={7}
				total={2}
			/>,
		);

		expect(screen.getByRole('status')).toHaveTextContent(
			'2 resultados · hoja 3/7',
		);
	});

	test('says its own text for one given as undefined', () => {
		render(
			<Pager
				labels={{ pageOf: undefined, range: undefined }}
				page={3}
				pages={7}
				total={2}
			/>,
		);

		expect(screen.getByRole('status')).toHaveTextContent(
			'2 resultados · página 3 de 7',
		);
	});
});
