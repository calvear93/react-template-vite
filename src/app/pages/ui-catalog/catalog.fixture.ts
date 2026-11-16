/** Demo data of the UI catalog: nothing here comes from an API. */

export interface DemoReport {
	id: number;
	date: string;
	days: number;
	folio: string;
	state: 'closed' | 'open' | 'review';
	worker: string;
}

const WORKERS = [
	'Anna Schmidt',
	'John Carter',
	'Mary Jane Wilson',
	'Peter Novak',
	'Camille Laurent',
	'Luis Costa',
	'Sofia Rossi',
];

const STATES = ['open', 'review', 'closed'] as const;

/** 57 reports, the same on every load. */
export const DEMO_REPORTS: readonly DemoReport[] = Array.from(
	{ length: 57 },
	(_, index) => ({
		id: index + 1,
		date: `2026-${String(1 + (index % 11)).padStart(2, '0')}-${String(1 + ((index * 7) % 28)).padStart(2, '0')}`,
		days: (index * 13) % 46,
		folio: `INC-2026-${String(1482 - index).padStart(6, '0')}`,
		state: STATES[index % STATES.length],
		worker: WORKERS[index % WORKERS.length],
	}),
);

export const REPORT_STATES = {
	closed: { label: 'Closed', tone: 'neutral' },
	open: { label: 'Open', tone: 'success' },
	review: { label: 'In review', tone: 'warning' },
} as const;

export interface DemoCity {
	code: string;
	name: string;
}

/** Cities of three regions: a code starts with the one of its region. */
export const DEMO_CITIES: readonly DemoCity[] = [
	{ code: 'AM-NYC', name: 'New York' },
	{ code: 'AM-SFO', name: 'San Francisco' },
	{ code: 'AM-SAN', name: 'San Diego' },
	{ code: 'AM-SAT', name: 'San Antonio' },
	{ code: 'AM-SAO', name: 'São Paulo' },
	{ code: 'AM-YTO', name: 'Toronto' },
	{ code: 'AM-MEX', name: 'Mexico City' },
	{ code: 'EU-LON', name: 'London' },
	{ code: 'EU-PAR', name: 'Paris' },
	{ code: 'EU-ZRH', name: 'Zürich' },
	{ code: 'EU-MMA', name: 'Malmö' },
	{ code: 'AP-TYO', name: 'Tokyo' },
	{ code: 'AP-SYD', name: 'Sydney' },
];

export interface DemoPerson {
	email: string;
	name: string;
	detail?: string;
}

export const DEMO_PEOPLE: readonly DemoPerson[] = [
	{
		detail: 'Finance',
		email: 'anna.schmidt@example.com',
		name: 'Schmidt, Anna Marie',
	},
	{
		detail: 'Operations',
		email: 'john.carter@example.com',
		name: 'Carter, John Paul',
	},
	{ email: 'mj.wilson@example.com', name: 'Wilson, Mary Jane' },
	{
		detail: 'Contractor',
		email: 'peter.novak@example.org',
		name: 'Novak, Peter',
	},
	{ email: 'camille.laurent@example.com', name: 'Laurent, Camille' },
	{
		detail: 'Legal',
		email: 'sofia.rossi@example.com',
		name: 'Rossi, Sofia',
	},
	{ email: 'annalisa.wilson@example.org', name: 'Wilson, Annalisa' },
];
