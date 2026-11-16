import {
	Accordion,
	AccordionItem,
	Alert,
	Badge,
	Button,
	Card,
	Collapsible,
	DataGrid,
	EmptyState,
	ErrorAlert,
	FilterChips,
	formatDate,
	formatNumber,
	GroupHeader,
	InfoNote,
	KpiRow,
	Timeline,
	useLocale,
} from '#libs/ui-core';
import { useState } from 'react';
import { Example } from '../components/example/Example.tsx';

const REPORTS = [
	{ id: 'INC-001482', state: 'open', worker: 'Anna Schmidt' },
	{ id: 'INC-001479', state: 'open', worker: 'John Carter' },
	{ id: 'INC-001466', state: 'closed', worker: 'Mary Jane Wilson' },
];

/**
 * Content and feedback of the kit: the surfaces that group an area, the record
 * of an item, figures, what happened in order, and the messages a screen gives.
 *
 * @returns section
 */
export const ContentSection = () => {
	const { locale } = useLocale();
	const [isWarningOpen, setIsWarningOpen] = useState(true);
	const [state, setState] = useState('');
	const reports = REPORTS.filter(
		(report) => !state || report.state === state,
	);

	return (
		<>
			<Example
				layout='stack'
				note='What must be read before going on, with its icon and its title: never by color alone. The danger one is announced at once.'
				title='Alert'
			>
				<Alert title='Your report is in review'>
					We will let you know by email when there is a decision.
				</Alert>
				<Alert title='Certificate issued' tone='success'>
					You can download it from your history now.
				</Alert>
				{isWarningOpen ? (
					<Alert
						actions={
							<Button size='sm' variant='outlined'>
								Upload documents
							</Button>
						}
						onClose={() => setIsWarningOpen(false)}
						title='2 documents are missing'
						tone='warning'
					>
						You can send them until November 30.
					</Alert>
				) : (
					<Button
						onClick={() => setIsWarningOpen(true)}
						size='sm'
						variant='ghost'
					>
						Show the warning again
					</Button>
				)}
				<Alert title='Scheduled maintenance' tone='neutral'>
					The site will not be available on Saturday from 22:00 to
					23:00.
				</Alert>
				<ErrorAlert
					error={{
						correlationId: '7f3a-91c2-4e0b',
						title: 'The employee was not created',
						message:
							'That email is already registered in another company. Check it or contact support.',
					}}
				/>
			</Example>

			<Example
				layout='stack'
				note='A note goes with the content and asks for nothing. An empty state is an answer: why it is empty and what to do.'
				title='InfoNote and EmptyState'
			>
				<InfoNote title='Deadline'>
					A report must be submitted within 24 hours of the incident.
				</InfoNote>
				<InfoNote icon='clock' tone='info'>
					The figures are updated every hour.
				</InfoNote>
				<InfoNote tone='warning'>
					The changes of this form are not saved by themselves.
				</InfoNote>
				<EmptyState
					action={<Button icon='plus'>Submit a report</Button>}
					title='No reports yet'
				>
					Once you submit one, it will show here with its status.
				</EmptyState>
			</Example>

			<Example
				layout='stack'
				note='The figures that guide. With href or onClick the whole figure leads to its details, and says so.'
				title='KpiRow'
			>
				<KpiRow
					items={[
						{
							href: '/ui/content',
							label: 'Open reports',
							sub: '3 due this week',
							value: 12,
						},
						{
							badge: 'Record',
							badgeTone: 'success',
							label: 'Days without incidents',
							value: 148,
						},
						{
							badge: 'Attention',
							badgeTone: 'warning',
							label: 'Pending documents',
							value: 5,
						},
						{
							label: 'Employees covered',
							value: formatNumber(1204, locale),
						},
					]}
				/>
			</Example>

			<Example
				layout='columns'
				note='A card groups an area: its title names it. DataGrid is the record of an item: an empty value shows a dash, a boolean “Yes” or “No”.'
				title='Card and DataGrid'
			>
				<Card
					actions={
						<Button icon='edit' size='sm' variant='outlined'>
							Edit
						</Button>
					}
					description='As written in the contract'
					headingLevel={4}
					label='Employee'
					title='Anna Schmidt'
				>
					<DataGrid
						entries={[
							{ label: 'Employee ID', value: 'E-10482' },
							{
								label: 'Email',
								value: 'anna.schmidt@example.com',
							},
							{ label: 'Phone', value: null },
							{ label: 'Active contract', value: true },
							{
								label: 'Notes',
								value: 'Night shift at the main warehouse.',
								wide: true,
							},
						]}
					/>
				</Card>
				<Card
					elevation='md'
					footer={
						<Button size='sm' variant='link'>
							View the whole history
						</Button>
					}
					headingLevel={4}
					title='Follow-up'
				>
					<Timeline
						items={[
							{
								date: `${formatDate('2026-11-02', locale)} 09:14`,
								state: 'done',
								title: 'Report received',
							},
							{
								date: `Since ${formatDate('2026-11-03', locale)}`,
								detail: 'The medical team is reviewing the case.',
								state: 'current',
								title: (
									<>
										Under evaluation{' '}
										<Badge tone='warning'>Ongoing</Badge>
									</>
								),
							},
							{ title: 'Decision' },
						]}
					/>
				</Card>
			</Example>

			<Example
				layout='stack'
				note='What happened, in order: each milestone with its state said in words too.'
				title='Timeline'
			>
				<Timeline
					items={[
						{
							date: formatDate('2026-10-28', locale),
							state: 'done',
							title: 'Admission to the clinic',
						},
						{
							date: formatDate('2026-10-29', locale),
							icon: 'health',
							state: 'done',
							title: 'Emergency care',
						},
						{
							date: 'Today',
							state: 'current',
							title: 'Medical leave',
						},
						{
							icon: 'certificate',
							title: 'Discharge and certificate',
						},
					]}
				/>
			</Example>

			<Example
				layout='stack'
				note='GroupHeader titles a group inside an area; FilterChips filters by a dimension in sight; Collapsible keeps what few people need.'
				title='GroupHeader, FilterChips and Collapsible'
			>
				<GroupHeader
					action={
						<Button size='sm' variant='link'>
							View all
						</Button>
					}
					context={`${reports.length} of ${REPORTS.length}`}
					icon='document'
					title='Reports'
				/>
				<FilterChips
					label='Status of the report'
					onValueChange={setState}
					options={[
						{ count: 2, label: 'Open', value: 'open' },
						{ count: 1, label: 'Closed', value: 'closed' },
					]}
					value={state}
				/>
				<ul aria-label='Filtered reports'>
					{reports.map((report) => (
						<li key={report.id}>
							{report.id} · {report.worker}
						</li>
					))}
				</ul>
				<Collapsible
					summary='2 documents'
					title='Records of the incident'
				>
					The statement of the employee and the attendance record of
					the day of the incident.
				</Collapsible>
				<GroupHeader highlighted title='Highlighted title' />
			</Example>

			<Example
				layout='stack'
				note='Sections that open in place, one under the other. Opening one closes the others; with type="multiple" each one goes its own way.'
				title='Accordion'
			>
				<Accordion defaultValue={['coverage']}>
					<AccordionItem
						title='What does the insurance cover?'
						value='coverage'
					>
						Accidents at work, accidents on the way to work and
						occupational diseases.
					</AccordionItem>
					<AccordionItem
						summary='3 steps'
						title='How do I report an incident?'
						value='report'
					>
						Tell your employer, go to the nearest clinic and fill in
						the incident report.
					</AccordionItem>
					<AccordionItem
						title='When is the benefit paid?'
						value='payment'
					>
						Every thirty days, for as long as the medical leave
						lasts.
					</AccordionItem>
				</Accordion>
			</Example>
		</>
	);
};
