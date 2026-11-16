import {
	Button,
	Checkbox,
	Field,
	formatAmount,
	formatRut,
	Input,
	InputAmount,
	InputPhone,
	InputRut,
	RadioGroup,
	type RutStatus,
	Select,
	Switch,
	Textarea,
	useLocale,
} from '#libs/ui-core';
import { useState } from 'react';
import { Example } from '../components/example/Example.tsx';
import styles from './fields.section.module.css';

const SELECT_PLACEHOLDER = 'Select…';

const CITIES = [
	{
		label: 'Europe',
		options: [
			{ label: 'London', value: 'EU-LON' },
			{ label: 'Paris', value: 'EU-PAR' },
			{ label: 'Zürich', value: 'EU-ZRH' },
		],
	},
	{
		label: 'Americas',
		options: [
			{ label: 'New York', value: 'AM-NYC' },
			{ label: 'Toronto', value: 'AM-YTO' },
		],
	},
];

const REGIONS = [
	{ label: 'North America', value: 'NA' },
	{ label: 'Latin America', value: 'LA' },
	{ label: 'Europe', value: 'EU' },
	{ label: 'Asia-Pacific', value: 'AP' },
	{ disabled: true, label: 'Antarctica (no coverage)', value: 'AQ' },
];

const ROLES = [
	{
		description: 'Sees the records of their company',
		label: 'Viewer',
		value: 'reader',
	},
	{
		description: 'Creates and corrects records',
		label: 'Editor',
		value: 'editor',
	},
	{
		description: 'Also manages the users',
		label: 'Administrator',
		value: 'admin',
	},
] as const;

const RUT_STATUS = {
	invalid: 'not valid',
	valid: 'valid',
	empty: 'empty',
	incomplete: 'incomplete',
	text: 'not a RUT',
} as const satisfies Record<RutStatus, string>;

/** The limits of the amount of the demo, in the currency of the app. */
const INCOME = { max: 5_000_000, min: 1000 } as const;

const DemoForm = () => {
	const [sent, setSent] = useState<string>();

	return (
		<form
			className={styles.form}
			onSubmit={(event) => {
				event.preventDefault();

				const data = new FormData(event.currentTarget);

				setSent(
					[...data.entries()]
						.map(([key, value]) => `${key}=${String(value)}`)
						.join(' · '),
				);
			}}
		>
			<Field label='Name' required>
				<Input name='name' />
			</Field>
			<Field label='Budget'>
				<InputAmount name='budget' />
			</Field>
			<Checkbox name='accept' value='yes'>
				I accept the terms
			</Checkbox>
			<Button type='submit'>Send data</Button>
			<p className={styles.status} role='status'>
				{sent ? `Sent: ${sent}` : 'Not sent yet'}
			</p>
		</form>
	);
};

/**
 * Form controls of the kit: the labelled field and every control that goes
 * inside it, with their sizes, hints, errors and domain inputs (amount, phone,
 * Chilean RUT).
 *
 * @returns section
 */
export const FieldsSection = () => {
	const { currency, locale } = useLocale();
	const [email, setEmail] = useState('anna@');
	const [rut, setRut] = useState<{ status: RutStatus; value: string }>({
		status: 'empty',
		value: '',
	});
	const [role, setRole] = useState<(typeof ROLES)[number]['value']>('editor');

	return (
		<>
			<Example
				layout='columns'
				note='Every control has its label. The requirement goes in the hint, before the attempt; the error says what happened and the way out, and stays tied to the field.'
				title='Field and Input'
			>
				<Field label='Name' required>
					<Input autoComplete='given-name' name='name' />
				</Field>
				<Field
					hint='We will write to you only about this request'
					label='Email'
					optional
				>
					<Input name='email' placeholder='name@example.com' />
				</Field>
				<Field
					error={
						email.includes('@') && email.includes('.')
							? undefined
							: 'Type the whole email, like name@example.com'
					}
					label='Contact email'
				>
					<Input
						onChange={(event) => setEmail(event.target.value)}
						type='email'
						value={email}
					/>
				</Field>
				<Field label='Reference (read only)'>
					<Input defaultValue='INC-2026-001482' disabled />
				</Field>
			</Example>

			<Example
				layout='columns'
				note='One height per size, the same for Input, Select and the domain fields.'
				title='Sizes'
			>
				<Field label='Small (36 px)'>
					<Input placeholder='sm' size='sm' />
				</Field>
				<Field label='Medium (42 px)'>
					<Input placeholder='md' />
				</Field>
				<Field label='Large (48 px)'>
					<Input placeholder='lg' size='lg' />
				</Field>
			</Example>

			<Example
				layout='columns'
				note='The native select: its keyboard and its mobile picker; where the browser allows it, the kit draws the open list.'
				title='Select and Textarea'
			>
				<Field label='Region' required>
					<Select
						name='region'
						options={REGIONS}
						placeholder={SELECT_PLACEHOLDER}
					/>
				</Field>
				<Field
					error='Choose the type of incident'
					label='Type of incident'
				>
					<Select defaultValue='' placeholder={SELECT_PLACEHOLDER}>
						<option value='work'>At work</option>
						<option value='commute'>On the way to work</option>
					</Select>
				</Field>
				<Field
					className={styles.wide}
					hint='What happened, where and when'
					label='Description of the incident'
				>
					<Textarea autoGrow name='description' />
				</Field>
			</Example>

			<Example
				layout='columns'
				note='The options of a select can go in groups: a group is only a heading, it cannot be chosen. The amount gets its thousands separators while it is typed, takes the decimals of its currency and sends the clean number.'
				title='Select with groups and InputAmount'
			>
				<Field label='City'>
					<Select
						name='city'
						options={CITIES}
						placeholder={SELECT_PLACEHOLDER}
					/>
				</Field>
				<Field
					hint={`Between ${formatAmount(INCOME.min, currency, locale)} and ${formatAmount(INCOME.max, currency, locale)}`}
					label='Annual income'
				>
					<InputAmount
						max={INCOME.max}
						min={INCOME.min}
						name='income'
					/>
				</Field>
			</Example>

			<Example
				layout='columns'
				note='The prefix of a phone is shown and never typed. InputRut is the field of a Chilean national ID (RUT), for the apps that need one: it is formatted while it is typed, without refusing keys, and checked when the field is left.'
				title='Domain fields: InputPhone and InputRut'
			>
				<Field hint='10 digits, without the +1' label='Mobile'>
					<InputPhone maxLength={10} name='mobile' prefix='+1' />
				</Field>
				<Field hint='With its country code' label='Phone'>
					<InputPhone name='phone' />
				</Field>
				<Field
					hint={`Value: ${formatRut(rut.value)}`}
					label='Chilean ID (RUT)'
					required
				>
					<InputRut
						name='rut'
						onValueChange={(value, status) =>
							setRut({ status, value })
						}
					/>
				</Field>
				<p className={styles.status} role='status'>
					Status of the RUT: <strong>{RUT_STATUS[rut.status]}</strong>
				</p>
			</Example>

			<Example
				layout='stack'
				note='The whole row toggles the box. The text is its name; the description describes it.'
				title='Checkbox'
			>
				<Checkbox
					defaultChecked
					description='You can withdraw it whenever you want'
					name='terms'
				>
					I allow the use of my data for this request
				</Checkbox>
				<Checkbox name='copy'>Send me a copy by email</Checkbox>
				<Checkbox disabled>Not available for your company</Checkbox>
				<Checkbox size='sm'>Small</Checkbox>
			</Example>

			<Example
				layout='stack'
				note='One of a few options, all in sight. As cards when each option needs its description.'
				title='RadioGroup'
			>
				<RadioGroup
					defaultValue='work'
					hint='You can correct it later'
					legend='Type of incident'
					name='kind'
					options={[
						{ label: 'At work', value: 'work' },
						{ label: 'On the way to work', value: 'commute' },
						{
							disabled: true,
							label: 'Occupational disease',
							value: 'ill',
						},
					]}
					orientation='horizontal'
				/>
				<RadioGroup
					legend='Role of the user'
					name='role'
					onValueChange={setRole}
					options={ROLES}
					required
					value={role}
					variant='cards'
				/>
				<RadioGroup
					error='Choose how you want to get the certificate'
					legend='Delivery of the certificate'
					options={[
						{ label: 'By email', value: 'mail' },
						{ label: 'Pick up at a branch', value: 'branch' },
					]}
				/>
			</Example>

			<Example
				layout='stack'
				note='An on/off with an immediate effect. In a form that is sent later, use a Checkbox.'
				title='Switch'
			>
				<Switch
					defaultChecked
					description='An email for every change of status'
					stateLabels={['On', 'Off']}
				>
					Email notifications
				</Switch>
				<Switch stateLabels={['Yes', 'No']}>Maintenance mode</Switch>
				<Switch disabled size='sm'>
					Automatic sync (not available)
				</Switch>
			</Example>

			<Example
				note='The controls work without state inside a native form: here it is read with FormData on submit.'
				title='In a form'
			>
				<DemoForm />
			</Example>
		</>
	);
};
