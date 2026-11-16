import {
	Badge,
	Breadcrumb,
	Button,
	Card,
	DataTable,
	type DataTableSort,
	EmptyState,
	Field,
	FilterBar,
	formatAmount,
	formatDate,
	Input,
	monthNames,
	Pager,
	Pagination,
	Select,
	Stepper,
	Table,
	toast,
	useLocale,
} from '#libs/ui-core';
import { useState } from 'react';
import {
	DEMO_REPORTS,
	type DemoReport,
	REPORT_STATES,
} from '../catalog.fixture.ts';
import { Example } from '../components/example/Example.tsx';

const STEPS = [
	{ state: 'done', title: 'Details of the employee' },
	{ description: 'What happened, where and when', title: 'Description' },
	{ title: 'Documents' },
	{ title: 'Review and submit' },
] as const;

const compare = (
	a: DemoReport,
	b: DemoReport,
	column: string,
	byText: Intl.Collator,
) => {
	if (column === 'days') return a.days - b.days;

	const key = column === 'date' ? 'date' : 'folio';

	return byText.compare(a[key], b[key]);
};

const ReportList = () => {
	const { locale } = useLocale();
	// the order of two texts as the language of the page sorts them, whatever the browser's
	const byText = new Intl.Collator(locale);
	const [filters, setFilters] = useState({ q: '', state: '' });
	const [sort, setSort] = useState<DataTableSort>({
		column: 'folio',
		direction: 'desc',
	});
	const [page, setPage] = useState(1);
	const [size, setSize] = useState(10);
	const query = filters.q.toLowerCase();
	const found = DEMO_REPORTS.filter(
		(report) =>
			(!filters.state || report.state === filters.state) &&
			(report.folio.toLowerCase().includes(query) ||
				report.worker.toLowerCase().includes(query)),
	).toSorted(
		(a, b) =>
			compare(a, b, sort.column, byText) *
			(sort.direction === 'asc' ? 1 : -1),
	);
	const pages = Math.max(1, Math.ceil(found.length / size));
	const current = Math.min(page, pages);

	return (
		<>
			<Card>
				<FilterBar
					aria-label='Filters of the reports'
					autoSubmit
					onSubmit={(data) => {
						setFilters({
							q: String(data.get('q') ?? ''),
							state: String(data.get('state') ?? ''),
						});
						setPage(1);
					}}
				>
					<Field label='Search'>
						<Input
							name='q'
							placeholder='Reference or employee'
							type='search'
						/>
					</Field>
					<Field label='Status'>
						<Select
							name='state'
							options={Object.entries(REPORT_STATES).map(
								([value, { label }]) => ({ label, value }),
							)}
							placeholder='All'
						/>
					</Field>
					<Button size='sm' type='reset' variant='ghost'>
						Clear
					</Button>
				</FilterBar>
			</Card>

			<DataTable
				caption='Reports'
				columns={[
					{
						id: 'folio',
						header: 'Reference',
						sortable: true,
						cell: (report) => report.folio,
					},
					{
						id: 'worker',
						header: 'Employee',
						cell: (report) => report.worker,
					},
					{
						id: 'date',
						header: 'Date',
						numeric: true,
						sortable: true,
						cell: (report) => formatDate(report.date, locale),
					},
					{
						id: 'days',
						header: 'Days off work',
						numeric: true,
						sortable: true,
						cell: (report) => report.days,
					},
					{
						id: 'state',
						header: 'Status',
						kind: 'state',
						cell: (report) => (
							<Badge dot tone={REPORT_STATES[report.state].tone}>
								{REPORT_STATES[report.state].label}
							</Badge>
						),
					},
					{
						id: 'actions',
						header: 'Actions',
						kind: 'actions',
						cell: (report) => (
							<Button
								icon='download'
								onClick={() =>
									toast(`Downloading ${report.folio}`)
								}
								size='sm'
								variant='outlined'
							>
								Download
							</Button>
						),
					},
				]}
				empty={
					<EmptyState
						icon='search'
						title='No reports for these filters'
					>
						Try another reference, or clear the filters.
					</EmptyState>
				}
				footer={
					<Pager
						jump
						noun={['report', 'reports']}
						onPageChange={setPage}
						onSizeChange={(next) => {
							setSize(next);
							setPage(1);
						}}
						page={current}
						pages={pages}
						size={size}
						sizes={[10, 25, 50]}
						total={found.length}
					/>
				}
				getRowId={(report) => report.id}
				isRowAttention={(report) =>
					report.state === 'review' && report.days > 30
				}
				onRowOpen={(report) => toast(`Open ${report.folio}`)}
				onSortChange={(column) => {
					setSort({
						column,
						direction:
							sort.column === column && sort.direction === 'asc'
								? 'desc'
								: 'asc',
					});
					setPage(1);
				}}
				rows={found.slice((current - 1) * size, current * size)}
				sort={sort}
			/>
		</>
	);
};

/**
 * Navigation and tables of the kit: Breadcrumb, Stepper, Pagination, and a whole
 * list (FilterBar, DataTable and Pager) over demo data.
 *
 * @returns section
 */
export const NavigationSection = () => {
	const { currency, locale } = useLocale();
	const months = monthNames(locale);
	const [page, setPage] = useState(5);

	return (
		<>
			<Example
				note='The way back: each level links to its own; the last one is the current page.'
				title='Breadcrumb'
			>
				<Breadcrumb
					items={[
						{ href: '/', label: 'Home' },
						{ href: '/ui', label: 'UI catalog' },
						{ label: 'Navigation and tables' },
					]}
				/>
			</Example>

			<Example
				layout='stack'
				note='The steps of a process. The progress is said in words, not only by color or position.'
				title='Stepper'
			>
				<Stepper current={1} steps={STEPS} />
				<Stepper compact current={2} steps={STEPS} />
				<Stepper current={1} orientation='vertical' steps={STEPS} />
			</Example>

			<Example
				layout='stack'
				note='At the ends the controls are disabled, they never go away. brief says the position in words; edges adds the first and the last page.'
				title='Pagination'
			>
				<Pagination onPageChange={setPage} page={page} pages={9} />
				<Pagination
					edges
					onPageChange={setPage}
					page={page}
					pages={9}
				/>
				<Pagination
					brief
					onPageChange={setPage}
					page={page}
					pages={9}
				/>
			</Example>

			<Example
				layout='stack'
				note='A whole list: the filters in their card, the table in the next one and the Pager at its foot. Under 640 px wide each row becomes a card.'
				title='FilterBar, DataTable and Pager'
			>
				<ReportList />
			</Example>

			<Example
				note='A simple table, for a few rows that need no sorting and no pages.'
				title='Table'
			>
				<Table
					caption='Payments of the period'
					headers={['Month', 'Employees', 'Amount']}
					rows={[
						[months[8], 41, formatAmount(11_900, currency, locale)],
						[months[9], 42, formatAmount(12_500, currency, locale)],
						[
							months[10],
							44,
							formatAmount(13_100.5, currency, locale),
						],
					]}
				/>
			</Example>
		</>
	);
};
