import { act, cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, test, vi } from 'vitest';
import { inChile } from '../../__mocks__/locale.mock.ts';
import { mockResizeObserver } from '../../__mocks__/resize-observer.mock.ts';
import {
	DataTable,
	type DataTableColumn,
	type DataTableProps,
} from './DataTable.tsx';

inChile();

interface Report {
	id: number;
	amount: number;
	folio: string;
	isLate: boolean;
	worker: string;
}

const REPORTS: Report[] = [
	{
		id: 1,
		amount: 1200,
		folio: 'ACH-001',
		isLate: false,
		worker: 'Ana Pérez',
	},
	{ id: 2, amount: 80, folio: 'ACH-002', isLate: true, worker: 'Juan Soto' },
];

const COLUMNS: DataTableColumn<Report>[] = [
	{
		id: 'folio',
		header: 'Folio',
		sortable: true,
		cell: (report) => report.folio,
	},
	{ id: 'worker', header: 'Trabajador', cell: (report) => report.worker },
	{
		id: 'amount',
		header: <abbr title='Monto en pesos'>Monto</abbr>,
		numeric: true,
		sortable: true,
		cell: (report) => report.amount,
	},
	{
		id: 'actions',
		header: 'Acciones',
		kind: 'actions',
		cell: (report) => (
			<button type='button'>Descargar {report.folio}</button>
		),
	},
];

const getId = (report: Report) => report.id;

const renderTable = (props: Partial<DataTableProps<Report>> = {}) =>
	render(
		<DataTable
			caption='Denuncias'
			columns={COLUMNS}
			getRowId={(report) => report.id}
			rows={REPORTS}
			{...props}
		/>,
	);

const header = (name: string) => screen.getByRole('columnheader', { name });

describe(DataTable, () => {
	// hooks
	afterEach(() => {
		cleanup();
		// the spies a test puts on a prototype, taken away even when it fails
		vi.restoreAllMocks();
	});

	// tests
	test('is a table named by its caption, with a header per column and a row per item', () => {
		renderTable({ 'data-testid': 'surface', className: 'extra' } as never);

		const table = screen.getByRole('table', { name: 'Denuncias' });

		expect(
			within(table)
				.getAllByRole('columnheader')
				.map((cell) => cell.textContent),
		).toStrictEqual(['Folio', 'Trabajador', 'Monto', 'Acciones']);
		expect(within(table).getAllByRole('row')).toHaveLength(3);
		expect(screen.getByTestId('surface')).toHaveClass('extra');
	});

	test('labels each cell with its column, for the card view only', () => {
		renderTable();

		const cells = within(screen.getAllByRole('row')[1]).getAllByRole(
			'cell',
		);

		// the label is hidden from assistive technology: the header already names the cell
		expect(cells.map((cell) => cell.textContent)).toStrictEqual([
			'FolioACH-001',
			'TrabajadorAna Pérez',
			'Monto1200',
			'AccionesDescargar ACH-001',
		]);
		expect(
			screen.getByRole('cell', { name: 'ACH-001' }),
		).toBeInTheDocument();
	});

	test.each([
		{ direction: 'asc', says: 'ascending' },
		{ direction: 'desc', says: 'descending' },
	] as const)(
		'says the order only on the active column ($direction)',
		({ direction, says }) => {
			renderTable({ sort: { column: 'folio', direction } });

			expect(header('Folio')).toHaveAttribute('aria-sort', says);
			expect(header('Monto')).not.toHaveAttribute('aria-sort');
			expect(header('Trabajador')).not.toHaveAttribute('aria-sort');
		},
	);

	test('asks to sort by a column from its header button', async () => {
		const onSortChange = vi.fn();

		renderTable({ onSortChange });

		const button = within(header('Folio')).getByRole('button', {
			name: 'Folio',
		});

		await userEvent.click(button);
		await userEvent.click(within(header('Monto')).getByRole('button'));

		expect(onSortChange.mock.calls).toStrictEqual([['folio'], ['amount']]);
		expect(button).toHaveAttribute('title', 'Ordenar por folio');
	});

	test('draws its sortable headers as links when it has a sort href', () => {
		renderTable({
			sortHref: (column) => `/reports?sort=${column}`,
			sortLabel: (title) => `Orden: ${title}`,
		});

		const link = within(header('Folio')).getByRole('link', {
			name: 'Folio',
		});

		expect(link).toHaveAttribute('href', '/reports?sort=folio');
		expect(link).toHaveAttribute('title', 'Orden: Folio');
	});

	test('opens a row from the button of its first column', async () => {
		const onRowOpen = vi.fn();

		renderTable({ onRowOpen });

		await userEvent.tab();
		await userEvent.tab();
		await userEvent.tab();

		expect(screen.getByRole('button', { name: 'ACH-001' })).toHaveFocus();

		await userEvent.keyboard('{Enter}');

		expect(onRowOpen).toHaveBeenCalledExactlyOnceWith(REPORTS[0]);
	});

	test('opens a row from a click anywhere on it, except on its own controls', async () => {
		const onRowOpen = vi.fn();

		renderTable({ onRowOpen });

		await userEvent.click(screen.getByRole('cell', { name: 'Juan Soto' }));

		expect(onRowOpen).toHaveBeenCalledExactlyOnceWith(REPORTS[1]);

		await userEvent.click(
			screen.getByRole('button', { name: 'Descargar ACH-002' }),
		);

		expect(onRowOpen).toHaveBeenCalledOnce();
	});

	test('has no row buttons and ignores clicks without a way to open', async () => {
		renderTable();

		await userEvent.click(screen.getByRole('cell', { name: 'Juan Soto' }));

		expect(
			screen.queryByRole('button', { name: 'ACH-001' }),
		).not.toBeInTheDocument();
	});

	test('marks a row that needs work and says it in words', () => {
		renderTable({
			attentionLabel: 'Fuera de plazo',
			isRowAttention: (report) => report.isLate,
		});

		const [, onTime, late] = screen.getAllByRole('row');

		expect(late).toHaveAttribute('data-attention');
		expect(onTime).not.toHaveAttribute('data-attention');
		expect(
			within(late).getByRole('cell', { name: 'Fuera de plazo ACH-002' }),
		).toBeInTheDocument();
		// a sign of its own, not a tint alone
		expect(
			within(late).getByRole('img', { name: 'Fuera de plazo' }),
		).toBeInTheDocument();
		expect(within(onTime).queryByRole('img')).not.toBeInTheDocument();
	});

	test('introduces its sortable headers, the bar that sorts its cards', () => {
		renderTable({ sortByLabel: 'Orden' });

		const [titles] = screen.getAllByRole('row');

		expect(titles).toHaveAttribute('data-label', 'Orden');
		expect(
			within(header('Folio')).getByRole('button', { name: 'Folio' }),
		).toHaveAttribute('title', 'Orden folio');
	});

	test('is a region that takes the focus while its table scrolls sideways', () => {
		const sizes = mockResizeObserver();

		renderTable();

		expect(screen.queryByRole('region')).not.toBeInTheDocument();

		vi.spyOn(HTMLElement.prototype, 'scrollWidth', 'get').mockReturnValue(
			900,
		);
		vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(
			640,
		);
		act(() => sizes.resize());

		const scroller = screen.getByRole('region', { name: 'Denuncias' });

		expect(scroller).toHaveAttribute('tabindex', '0');
		expect(scroller).toContainElement(
			screen.getByRole('table', { name: 'Denuncias' }),
		);
	});

	test('shows its empty state instead of the table when it has no rows', () => {
		renderTable({ empty: <p>Aún no hay denuncias</p>, rows: [] });

		expect(screen.getByText('Aún no hay denuncias')).toBeInTheDocument();
		expect(screen.queryByRole('table')).not.toBeInTheDocument();
	});

	test('keeps the table, with only its header, when it has no rows and no empty state', () => {
		renderTable({ density: 'compact', embedded: true, rows: [] });

		expect(screen.getAllByRole('row')).toHaveLength(1);
	});

	test('shows its toolbar above and its footer below', () => {
		renderTable({
			footer: <span>2 resultados</span>,
			toolbar: <button type='button'>Exportar</button>,
		});

		expect(
			screen.getByRole('button', { name: 'Exportar' }),
		).toBeInTheDocument();
		expect(screen.getByText('2 resultados')).toBeInTheDocument();
	});

	test('opens a row from anywhere on it once its rows arrive, when it started empty', async () => {
		const onRowOpen = vi.fn();
		const table = (rows: Report[]) => (
			<DataTable
				caption='Denuncias'
				columns={COLUMNS}
				empty={<p>Aún no hay denuncias</p>}
				getRowId={getId}
				onRowOpen={onRowOpen}
				rows={rows}
			/>
		);
		const { rerender } = render(table([]));

		expect(screen.getByText('Aún no hay denuncias')).toBeInTheDocument();

		// the same handler, and now a body to listen on
		rerender(table(REPORTS));
		await userEvent.click(screen.getByText('Ana Pérez'));

		expect(onRowOpen).toHaveBeenCalledExactlyOnceWith(REPORTS[0]);
	});

	test('draws again only the row that changed, whatever else it is given', () => {
		const cell = vi.fn((report: Report) => report.folio);
		const columns: DataTableColumn<Report>[] = [
			{ id: 'folio', cell, header: 'Folio', sortable: true },
		];
		const getRowId = (report: Report) => report.id;
		const onRowOpen = vi.fn();
		const table = (rows: Report[], column: string) => (
			<DataTable
				caption='Denuncias'
				columns={columns}
				getRowId={getRowId}
				onRowOpen={onRowOpen}
				rows={rows}
				sort={{ column, direction: 'asc' }}
			/>
		);
		const { rerender } = render(table(REPORTS, 'folio'));

		expect(cell).toHaveBeenCalledTimes(2);

		// another order of the same rows: none is drawn again
		cell.mockClear();
		rerender(table(REPORTS.toReversed(), 'amount'));

		expect(cell).not.toHaveBeenCalled();
		expect(
			within(screen.getAllByRole('row')[1] as HTMLElement).getByRole(
				'button',
			),
		).toHaveTextContent('ACH-002');

		// one row is another: only that one is drawn
		const [first, second] = REPORTS as [Report, Report];

		rerender(table([{ ...second, folio: 'ACH-900' }, first], 'amount'));

		expect(cell).toHaveBeenCalledExactlyOnceWith(
			expect.objectContaining({ folio: 'ACH-900' }),
		);
	});

	test('draws again the row that starts or stops needing work', () => {
		const cell = vi.fn((report: Report) => report.folio);
		const columns: DataTableColumn<Report>[] = [
			{ id: 'folio', cell, header: 'Folio' },
		];
		const getRowId = (report: Report) => report.id;
		const table = (late: number) => (
			<DataTable
				caption='Denuncias'
				columns={columns}
				getRowId={getRowId}
				isRowAttention={(report) => report.id === late}
				rows={REPORTS}
			/>
		);
		const { rerender } = render(table(1));

		cell.mockClear();
		rerender(table(2));

		expect(cell).toHaveBeenCalledTimes(2);
		expect(screen.getAllByRole('row')[2]).toHaveAttribute('data-attention');
		expect(screen.getAllByRole('row')[1]).not.toHaveAttribute(
			'data-attention',
		);
	});
});
