import {
	type ComponentProps,
	memo,
	type ReactNode,
	useEffect,
	useRef,
} from 'react';
import { useTexts } from '../../i18n/texts.hook.ts';
import { Icon } from '../../icon/Icon.tsx';
import { Anchor } from '../../internal/anchor/Anchor.tsx';
import { cx } from '../../internal/cx.ts';
import { ScrollArea } from '../../internal/scroll-area/ScrollArea.tsx';
import { VisuallyHidden } from '../visually-hidden/VisuallyHidden.tsx';
import table from '../table/Table.module.css';
import styles from './DataTable.module.css';

const CONTROLS = 'a, button, input, select, textarea, label, summary';

const SortHeader = <Row,>({
	column,
	onSortChange,
	sort,
	sortHref,
	sortLabel,
}: Pick<
	DataTableProps<Row>,
	'onSortChange' | 'sort' | 'sortHref' | 'sortLabel'
> & { column: DataTableColumn<Row> }) => {
	const isActive = sort?.column === column.id;
	const title =
		typeof column.header === 'string'
			? sortLabel?.(column.header)
			: undefined;
	const content = (
		<>
			{column.header}
			<Icon name={isActive ? 'arrow-up' : 'sort'} size='xs' />
		</>
	);
	let direction: 'ascending' | 'descending' | undefined;

	if (isActive)
		direction = sort.direction === 'desc' ? 'descending' : 'ascending';

	return (
		<th
			aria-sort={direction}
			className={cx(
				table.header,
				styles.sortable,
				column.numeric && styles.numeric,
			)}
			scope='col'
		>
			{sortHref ? (
				<Anchor
					className={styles.sort}
					href={sortHref(column.id)}
					title={title}
				>
					{content}
				</Anchor>
			) : (
				<button
					className={styles.sort}
					onClick={() => onSortChange?.(column.id)}
					title={title}
					type='button'
				>
					{content}
				</button>
			)}
		</th>
	);
};

const BodyRow = <Row,>({
	attentionLabel,
	columns,
	needsWork,
	onRowOpen,
	opener,
	row,
}: {
	attentionLabel: string;
	columns: readonly DataTableColumn<Row>[];
	needsWork: boolean;
	/** The place of the column that opens the row. */
	opener: number;
	row: Row;
	onRowOpen?: (row: Row) => void;
}) => (
	<tr
		className={cx(table.row, styles.row, onRowOpen && styles.opens)}
		data-attention={needsWork || undefined}
		data-row
	>
		{columns.map((column, index) => (
			<td
				className={cx(
					table.cell,
					styles.cell,
					column.numeric && styles.numeric,
				)}
				data-kind={column.kind}
				key={column.id}
			>
				<span aria-hidden className={styles.label}>
					{column.header}
				</span>
				<div className={styles.content}>
					{needsWork && index === opener && (
						<Icon
							className={styles.attention}
							label={attentionLabel}
							name='alert-triangle'
							size='xs'
						/>
					)}
					{onRowOpen && index === opener ? (
						<button
							className={styles.open}
							data-open
							onClick={() => onRowOpen(row)}
							type='button'
						>
							{column.cell(row)}
						</button>
					) : (
						column.cell(row)
					)}
				</div>
			</td>
		))}
	</tr>
);

/**
 * A row of the table. Memoized by hand, the one exception to the React Compiler
 * doing it: it keeps a `.map` as a whole, not each of its elements, and a new
 * order or one row that changes would draw every row again. It holds while
 * `columns` and `onRowOpen` are the same ones between renders.
 */
const DataTableRow = memo(BodyRow) as typeof BodyRow;

/**
 * A list of items: one surface with an optional toolbar, the table and its foot
 * (usually a Pager). Sortable headers say the order the data came in (only the
 * active column carries `aria-sort`); below 640px of its own width each row
 * becomes a card with its labels, so the table never scrolls the page sideways,
 * and its sortable headers become the bar that sorts the cards.
 *
 * With `onRowOpen` the row opens its item: the first column becomes its button
 * (keep that cell plain text), and a click anywhere on the row does the same.
 * `isRowAttention` marks a row that needs work: a tint, an icon and its words.
 *
 * Filters go in their own Card above it (a FilterBar); the `toolbar` is for
 * actions on the rows.
 *
 * @example
 * ```tsx
 * <DataTable
 *   caption='Reports'
 *   rows={reports}
 *   getRowId={(report) => report.id}
 *   columns={[
 *     { id: 'folio', header: 'Folio', cell: (report) => report.folio, sortable: true },
 *     { id: 'worker', header: 'Worker', cell: (report) => report.worker },
 *     { id: 'state', header: 'Status', kind: 'state', cell: (report) => <Badge>…</Badge> },
 *   ]}
 *   sort={sort} onSortChange={toggleSort}
 *   onRowOpen={(report) => navigate(`/reports/${report.id}`)}
 *   footer={<Pager … />}
 *   empty={<EmptyState title='No reports yet' />}
 * />
 * ```
 *
 * @returns data table
 */
export const DataTable = <Row,>({
	getRowId,
	attentionLabel,
	caption,
	className,
	columns,
	density = 'comfortable',
	embedded = false,
	empty,
	footer,
	isRowAttention,
	onRowOpen,
	onSortChange,
	rows,
	sort,
	sortByLabel,
	sortHref,
	sortLabel,
	toolbar,
	...props
}: DataTableProps<Row>) => {
	const texts = useTexts().dataTable;
	const attention = attentionLabel ?? texts.attention;
	const sortBy = sortByLabel ?? texts.sortBy;
	const sortName =
		sortLabel ?? ((header: string) => `${sortBy} ${header.toLowerCase()}`);
	const body = useRef<HTMLTableSectionElement>(null);
	const opener = columns.findIndex((column) => column.kind !== 'actions');
	const isSortable = columns.some((column) => column.sortable);
	// the body is not there while the empty state takes its place
	const hasBody = rows.length > 0 || !empty;

	// a click anywhere on a row opens it, like its button; a control inside does its own thing.
	// Wired again when the body appears: a table that started empty had none to listen on
	useEffect(() => {
		const node = body.current;

		if (!node || !hasBody || !onRowOpen) return;

		const handleClick = (event: MouseEvent) => {
			const target = event.target as Element;
			const row = target.closest<HTMLElement>('tr[data-row]');

			if (!row || target.closest(CONTROLS)) return;

			row.querySelector<HTMLElement>('[data-open]')?.click();
		};

		node.addEventListener('click', handleClick);

		return () => node.removeEventListener('click', handleClick);
	}, [hasBody, onRowOpen]);

	return (
		<div
			className={cx(styles.root, embedded && styles.embedded, className)}
			{...props}
		>
			{toolbar && <div className={styles.toolbar}>{toolbar}</div>}

			{rows.length === 0 && empty ? (
				<div className={styles.empty}>{empty}</div>
			) : (
				<ScrollArea
					aria-label={caption}
					className={cx(table.root, table[density], styles.scroller)}
				>
					<table className={table.table}>
						<caption>
							<VisuallyHidden>{caption}</VisuallyHidden>
						</caption>
						<thead
							className={cx(
								styles.head,
								isSortable && styles.sorts,
							)}
						>
							<tr data-label={sortBy}>
								{columns.map((column) =>
									column.sortable ? (
										<SortHeader
											column={column}
											key={column.id}
											onSortChange={onSortChange}
											sort={sort}
											sortHref={sortHref}
											sortLabel={sortName}
										/>
									) : (
										<th
											className={cx(
												table.header,
												column.numeric &&
													styles.numeric,
											)}
											key={column.id}
											scope='col'
										>
											{column.header}
										</th>
									),
								)}
							</tr>
						</thead>
						<tbody ref={body}>
							{rows.map((row) => (
								<DataTableRow
									attentionLabel={attention}
									columns={columns}
									key={getRowId(row)}
									needsWork={isRowAttention?.(row) ?? false}
									onRowOpen={onRowOpen}
									opener={opener}
									row={row}
								/>
							))}
						</tbody>
					</table>
				</ScrollArea>
			)}

			{footer && <div className={styles.footer}>{footer}</div>}
		</div>
	);
};

export interface DataTableColumn<Row> {
	/** Identifies the column, and what it sorts by. */
	id: string;
	/** The title of the column: also the label of its cells in the card view. */
	header: ReactNode;
	/** `state`: a badge that may wrap; `actions`: row buttons, without a label in the card view. */
	kind?: 'actions' | 'state';
	/** Figures and dates: tabular numbers, no wrap, aligned to the end. */
	numeric?: boolean;
	/** The header sorts by this column. */
	sortable?: boolean;
	/** The content of the cell of a row. */
	cell: (row: Row) => ReactNode;
}

/** The order the rows came in. */
export interface DataTableSort {
	column: string;
	direction: 'asc' | 'desc';
}

export interface DataTableProps<Row> extends Omit<
	ComponentProps<'div'>,
	'children'
> {
	/** A stable key for each row. */
	getRowId: (row: Row) => number | string;
	/** Names the table for assistive technology. */
	caption: string;
	columns: readonly DataTableColumn<Row>[];
	rows: readonly Row[];
	/** What the icon of a row that needs work reads as, before its first cell. */
	attentionLabel?: string;
	/** `compact`: tighter cells, for a list of many columns. */
	density?: 'comfortable' | 'compact';
	/** No surface of its own: inside a Card, a tab or a Drawer. */
	embedded?: boolean;
	/** Shown instead of the table when there are no rows: why, and what to do. */
	empty?: ReactNode;
	/** Below the table: usually a Pager. */
	footer?: ReactNode;
	/** The order the rows came in: the active column and its direction. */
	sort?: DataTableSort;
	/** What introduces the sortable headers in the card view, and their tooltip. */
	sortByLabel?: string;
	/** Above the table, inside the surface: actions on the rows. */
	toolbar?: ReactNode;
	/** A row that needs work: marked, and said in words. */
	isRowAttention?: (row: Row) => boolean;
	/** Makes each row open its item. */
	onRowOpen?: (row: Row) => void;
	/** A sortable header was chosen: the parent decides the new order. */
	onSortChange?: (column: string) => void;
	/** Makes sortable headers links: the URL that sorts by a column. */
	sortHref?: (column: string) => string;
	/** The tooltip of a sortable header. */
	sortLabel?: (header: string) => string;
}
