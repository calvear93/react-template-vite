import {
	addDays,
	Button,
	Calendar,
	Chip,
	Combobox,
	DatePicker,
	Field,
	FileUpload,
	FilterBar,
	Input,
	MultiSelect,
	PeoplePicker,
	SearchSelect,
	shortName,
	spokenDate,
	TimePicker,
	todayIso,
	useLocale,
} from '#libs/ui-core';
import { useState } from 'react';
import {
	DEMO_CITIES,
	DEMO_PEOPLE,
	type DemoCity,
	type DemoPerson,
} from '../catalog.fixture.ts';
import { Example } from '../components/example/Example.tsx';
import styles from './pickers.section.module.css';

/** A text without accents, in lower case: what a search compares. */
const fold = (text: string) =>
	text.normalize('NFD').replaceAll(/\p{M}/gu, '').toLowerCase();

const findCities = (query: string) => {
	const sought = fold(query);

	return DEMO_CITIES.filter((city) => fold(city.name).includes(sought));
};

/** A search that takes its time, as a real one does; “error” fails. */
const findPeople = async (query: string, signal: AbortSignal) => {
	const wait = Promise.withResolvers<undefined>();
	const timer = setTimeout(() => wait.resolve(undefined), 350);
	const sought = fold(query);

	signal.addEventListener(
		'abort',
		() => {
			clearTimeout(timer);
			wait.resolve(undefined);
		},
		{ once: true },
	);
	await wait.promise;

	if (sought === 'error') throw new Error('Demo: the search failed');

	return DEMO_PEOPLE.filter((person) =>
		fold(`${person.name} ${person.email}`).includes(sought),
	);
};

/** The cities of the demo under their region: what a grouped list takes. */
const CITY_GROUPS = [
	{ label: 'Americas', prefix: 'AM' },
	{ label: 'Europe', prefix: 'EU' },
	{ label: 'Asia-Pacific', prefix: 'AP' },
].map(({ label, prefix }) => ({
	label,
	options: DEMO_CITIES.filter(({ code }) => code.startsWith(prefix)).map(
		({ code, name }) => ({ label: name, value: code }),
	),
}));

const STATES = [
	{
		label: 'In progress',
		options: [
			{ label: 'Open', value: 'open' },
			{ label: 'In review', value: 'review' },
			{ label: 'Waiting for documents', value: 'pending' },
		],
	},
	{
		label: 'Finished',
		options: [
			{ label: 'Closed', value: 'closed' },
			{ disabled: true, label: 'Voided', value: 'void' },
		],
	},
];

const SelectsExample = () => {
	const [city, setCity] = useState('');
	const [cities, setCities] = useState<readonly string[]>([]);

	return (
		<>
			<Example
				layout='columns'
				note='One option of a long list the application already has: the field opens its list with a search box, accents aside. The groups are only headings.'
				title='SearchSelect'
			>
				<Field hint='Type to filter the list' label='City'>
					<SearchSelect
						clearable
						name='city'
						onValueChange={setCity}
						options={CITY_GROUPS}
						value={city}
					/>
				</Field>
				<Field label='Status of the report'>
					<SearchSelect
						defaultValue='review'
						name='state'
						options={STATES}
					/>
				</Field>
				<p className={styles.status} role='status'>
					{city ? `Code of the city: ${city}` : 'No city chosen'}
				</p>
			</Example>

			<Example
				layout='columns'
				note='Several options at once. Closed, it says what was chosen in one line and how many they are: the field does not grow. A group does not select its options. With searchable it adds a search box.'
				title='MultiSelect'
			>
				<Field label='Statuses'>
					<MultiSelect
						defaultValue={['open', 'review']}
						name='states'
						options={STATES}
					/>
				</Field>
				<Field hint='With a search box' label='Cities'>
					<MultiSelect
						name='cities'
						onValueChange={setCities}
						options={CITY_GROUPS}
						placeholder='All the cities'
						searchable
						value={cities}
					/>
				</Field>
				<p className={styles.status} role='status'>
					{cities.length === 0
						? 'No cities chosen'
						: `Cities chosen: ${cities.length}`}
				</p>
			</Example>
		</>
	);
};

const TimeExample = () => {
	const [time, setTime] = useState('');

	return (
		<Example
			layout='columns'
			note='A time typed (hh:mm in 24 hours: the colon is added as the digits come) or picked in its panel, which can be columns, a list of times or a clock. The step of the minutes can be set; typing takes any minute.'
			title='TimePicker'
		>
			<Field
				hint='Columns of hours and minutes'
				label='Time of the incident'
			>
				<TimePicker name='time' onValueChange={setTime} value={time} />
			</Field>
			<Field
				hint='A list every 30 minutes, from 08:00 to 18:00'
				label='Time of the appointment'
			>
				<TimePicker
					interval={30}
					max='18:00'
					min='08:00'
					name='slot'
					picker='list'
				/>
			</Field>
			<Field hint='A clock, minute by minute' label='Time of the visit'>
				<TimePicker
					defaultValue='14:35'
					minuteStep={1}
					name='seen'
					picker='clock'
				/>
			</Field>
			<p className={styles.status} role='status'>
				{time ? `Time of the incident: ${time}` : 'No time chosen'}
			</p>
		</Example>
	);
};

const CalendarExample = () => {
	const { locale } = useLocale();
	const today = todayIso();
	const [day, setDay] = useState('');

	return (
		<>
			<div className={styles.stack}>
				<Calendar onValueChange={setDay} value={day} />
				<p className={styles.status} role='status'>
					{day
						? `Chosen: ${spokenDate(day, locale)}`
						: 'No day chosen'}
				</p>
			</div>
			<div className={styles.stack}>
				<Calendar
					defaultValue={addDays(today, 3)}
					max={addDays(today, 30)}
					min={today}
				/>
				<p className={styles.status}>Only the next 30 days</p>
			</div>
		</>
	);
};

const FiltersExample = () => {
	const [applied, setApplied] = useState('No filters applied');

	return (
		<div className={styles.wide}>
			<FilterBar
				aria-label='Filters of the reports'
				autoSubmit
				onSubmit={(data) =>
					setApplied(
						`Applied: “${String(data.get('q'))}” from ${String(data.get('from')) || 'any date'}`,
					)
				}
			>
				<Field label='Search'>
					<Input name='q' type='search' />
				</Field>
				<Field label='From'>
					<DatePicker max={todayIso()} name='from' />
				</Field>
				<Button size='sm' type='reset' variant='ghost'>
					Clear
				</Button>
			</FilterBar>
			<p className={styles.status} role='status'>
				{applied}
			</p>
		</div>
	);
};

const PeopleExample = () => {
	const { locale } = useLocale();
	const [owner, setOwner] = useState<DemoPerson | null>(null);
	const [team, setTeam] = useState<readonly DemoPerson[]>([]);

	return (
		<>
			<div className={styles.stack}>
				<Field
					hint='At least 3 letters of the name or the email. Try “error”.'
					label='Person in charge'
					required
				>
					<PeoplePicker
						name='owner'
						onValueChange={setOwner}
						search={findPeople}
					/>
				</Field>
				<p className={styles.status} role='status'>
					{owner ? `In charge: ${owner.email}` : 'Nobody in charge'}
				</p>
			</div>

			<div className={styles.stack}>
				<Field
					hint='Each person picked is added to the list'
					label='Add to the team'
				>
					<PeoplePicker
						clearOnPick
						onValueChange={(person) => {
							if (person && !team.includes(person))
								setTeam([...team, person]);
						}}
						search={findPeople}
					/>
				</Field>
				<ul aria-label='Team' className={styles.team}>
					{team.map((person) => (
						<li key={person.email}>
							<Chip
								onRemove={() =>
									setTeam(
										team.filter(
											(other) => other !== person,
										),
									)
								}
							>
								{shortName(person.name, {}, locale)}
							</Chip>
						</li>
					))}
				</ul>
			</div>
		</>
	);
};

/**
 * The pickers of the kit: dates, times, searches that find one of many, and files.
 *
 * @returns section
 */
export const PickersSection = () => {
	const today = todayIso();
	const [city, setCity] = useState<DemoCity | null>(null);

	return (
		<>
			<Example
				note='A month to pick a day from. A single Tab stop: the arrows move by day and by week, Home and End to the ends of the week, Page Up and Page Down by month (with Shift, by year).'
				title='Calendar'
			>
				<CalendarExample />
			</Example>

			<Example
				layout='columns'
				note='The date is typed as the language of the page writes it (its separators are added as the digits come) or picked: the button or Alt + ↓ open the calendar, Escape closes it. What is wrong is said when the field is left.'
				title='DatePicker'
			>
				<Field
					hint='From today on'
					label='Date of the appointment'
					required
				>
					<DatePicker min={today} name='appointment' />
				</Field>
				<Field label='Date of birth'>
					<DatePicker
						autoComplete='bday'
						defaultValue='1990-05-17'
						max={today}
						name='birth'
					/>
				</Field>
				<Field label='Compact'>
					<DatePicker size='sm' />
				</Field>
				<Field label='Disabled'>
					<DatePicker defaultValue={today} disabled />
				</Field>
			</Example>

			<Example
				note='In a FilterBar that applies by itself: the text waits until the typing stops; the date applies as soon as it is valid or picked.'
				title='DatePicker in filters'
			>
				<FiltersExample />
			</Example>

			<Example
				layout='columns'
				note='Searches among many options while it is typed in. The focus never leaves the box: the arrows go through the list, Enter picks, Escape closes only the list.'
				title='Combobox'
			>
				<div className={styles.stack}>
					<Field hint='At least 2 letters' label='City'>
						<Combobox
							getKey={(item) => item.code}
							getLabel={(item) => item.name}
							name='city'
							onValueChange={setCity}
							search={findCities}
						/>
					</Field>
					<p className={styles.status} role='status'>
						{city ? `City code: ${city.code}` : 'No city picked'}
					</p>
				</div>
			</Example>

			<Example
				layout='columns'
				note='A Combobox of people: the initials, the name with what was searched standing out, the email and a detail (a team, an ID). It keeps who is picked, or with clearOnPick adds people to a list.'
				title='PeoplePicker'
			>
				<PeopleExample />
			</Example>

			<TimeExample />

			<SelectsExample />

			<Example
				layout='stack'
				note='A file that was asked for: it says which document and what it must be before the attempt. Dropping the file on it is a shortcut; the button does it all.'
				title='FileUpload'
			>
				<FileUpload
					accept='.pdf,image/*'
					label='Medical certificate'
					name='license'
					required
					requirements='A PDF or an image, up to 5 MB'
				/>
				<FileUpload
					accept='.csv'
					label='List of branches'
					name='branches'
					requirements='Optional. A CSV with one branch per row'
				/>
				<FileUpload
					error='The file is larger than 5 MB. Upload a smaller one.'
					label='Proof of payment'
					name='certificate'
					requirements='A PDF, up to 5 MB'
				/>
			</Example>
		</>
	);
};
