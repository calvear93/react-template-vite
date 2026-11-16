import {
	Avatar,
	Badge,
	Button,
	ButtonGroup,
	Chip,
	Progress,
	SegmentedControl,
	Separator,
	Skeleton,
	Spinner,
	StatusDot,
} from '#libs/ui-core';
import { useState } from 'react';
import { Example } from '../components/example/Example.tsx';
import styles from './actions.section.module.css';

const PEOPLE = ['Anna Schmidt', 'John Carter', 'Mary Jane Wilson'];

const ViewExample = () => {
	const [view, setView] = useState<'cards' | 'table'>('table');

	return (
		<Example
			note='Two to four options as joined buttons, one always chosen: the view of a list, a period. They are native radios: the arrows move and choose.'
			title='SegmentedControl'
		>
			<SegmentedControl
				legend='View of the list'
				onValueChange={setView}
				options={[
					{ icon: 'list', label: 'Table', value: 'table' },
					{ icon: 'document', label: 'Cards', value: 'cards' },
				]}
				value={view}
			/>
			<SegmentedControl
				defaultValue='quarter'
				legend='Period'
				options={[
					{ label: 'Month', value: 'month' },
					{ label: 'Quarter', value: 'quarter' },
					{ label: 'Year', value: 'year' },
				]}
				size='sm'
			/>
			<span role='status'>
				{view === 'table' ? 'Shown as a table' : 'Shown as cards'}
			</span>
		</Example>
	);
};

/**
 * Actions and status atoms of the kit: buttons, badges, chips, avatars and what
 * says that something is loading.
 *
 * @returns section
 */
export const ActionsSection = () => {
	const [isSaving, setIsSaving] = useState(false);
	const [team, setTeam] = useState(PEOPLE);

	return (
		<>
			<Example
				note='A single main action (solid) per area. outlined or filled for the secondary ones, ghost for the way out, destructive for what removes.'
				title='Button: variants'
			>
				<Button>Save changes</Button>
				<Button variant='filled'>Add person</Button>
				<Button variant='outlined'>Export</Button>
				<Button variant='ghost'>Cancel</Button>
				<Button variant='destructive'>Remove access</Button>
				<Button variant='link'>View details</Button>
			</Example>

			<Example
				note='The icon goes with the text; alone (iconOnly), the content becomes its accessible name and its tooltip.'
				title='Button: sizes and icons'
			>
				<Button size='sm'>Small</Button>
				<Button>Medium</Button>
				<Button size='lg'>Large</Button>
				<Button icon='download' variant='outlined'>
					Download
				</Button>
				<Button iconEnd='arrow-right' variant='filled'>
					Continue
				</Button>
				<Button icon='edit' iconOnly variant='ghost'>
					Edit record
				</Button>
				<Button icon='trash' iconOnly variant='destructive'>
					Remove record
				</Button>
			</Example>

			<Example
				note='loading keeps the width, says it is busy and ignores clicks. With href it is a link that navigates through the router of the app.'
				title='Button: states and links'
			>
				<Button
					loading={isSaving}
					onClick={() => {
						setIsSaving(true);
						setTimeout(() => setIsSaving(false), 1500);
					}}
				>
					Record attempt
				</Button>
				<Button loading variant='outlined'>
					Sending
				</Button>
				<Button disabled>Disabled</Button>
				<Button
					href='/ui/foundations'
					icon='arrow-left'
					variant='outlined'
				>
					Go to Foundations
				</Button>
				<Button disabled href='/ui/foundations' variant='outlined'>
					Disabled link
				</Button>
				<div className={styles.brandSurface}>
					<Button variant='inverse'>On the primary color</Button>
				</div>
			</Example>

			<Example
				layout='stack'
				note='Options of one decision, joined. block takes the width of its container.'
				title='ButtonGroup and block'
			>
				<ButtonGroup label='View'>
					<Button icon='list' variant='outlined'>
						List
					</Button>
					<Button icon='calendar' variant='outlined'>
						Calendar
					</Button>
					<Button icon='activity' variant='outlined'>
						Activity
					</Button>
				</ButtonGroup>
				<Button block>Submit report</Button>
			</Example>

			<Example
				note='A short state or category, always with its word. neutral is for what is not a state; primary, for a count.'
				title='Badge'
			>
				<Badge>Administrator</Badge>
				<Badge tone='brand'>Premium plan</Badge>
				<Badge dot tone='success'>
					Active
				</Badge>
				<Badge dot tone='warning'>
					Expiring soon
				</Badge>
				<Badge dot tone='danger'>
					Expired
				</Badge>
				<Badge dot tone='info'>
					In review
				</Badge>
				<Badge tone='primary'>12</Badge>
				<Badge size='sm' tone='success'>
					Small
				</Badge>
				<Badge size='lg' tone='info'>
					Large
				</Badge>
			</Example>

			<Example
				note='A choice already made. With onRemove it has a button that says what it removes.'
				title='Chip'
			>
				<Chip count={12}>Pending</Chip>
				<Chip>Read only</Chip>
				{team.map((person) => (
					<Chip
						key={person}
						onRemove={() =>
							setTeam(team.filter((name) => name !== person))
						}
					>
						{person}
					</Chip>
				))}
				<Chip size='sm'>Label</Chip>
				<Chip onRemove={() => setTeam(PEOPLE)} size='sm'>
					Reset
				</Chip>
			</Example>

			<Example
				note='The initials are always underneath; the photo goes over them when there is one. The status dot goes next to its text, or alone with a label.'
				title='Avatar and StatusDot'
			>
				<Avatar name='Anna Schmidt' size='sm' />
				<Avatar name='John Carter' />
				<Avatar name='Mary Jane Wilson' size='lg' />
				<Separator orientation='vertical' />
				<span className={styles.inline}>
					<StatusDot /> Online
				</span>
				<span className={styles.inline}>
					<StatusDot pulse tone='warning' /> Syncing
				</span>
				<span className={styles.inline}>
					<StatusDot tone='danger' /> Offline
				</span>
				<span className={styles.inline}>
					<StatusDot tone='neutral' /> Inactive
				</span>
			</Example>

			<ViewExample />

			<Example
				layout='stack'
				note='Spinner for a short wait, Skeleton for content of a known shape, Progress when it is known how much is left.'
				title='Waiting: Spinner, Skeleton and Progress'
			>
				<div className={styles.inline}>
					<Spinner />
					<Spinner label='Loading orders' showLabel />
				</div>
				<Separator />
				<div className={styles.skeleton}>
					<Skeleton height='48px' width='48px' />
					<div className={styles.lines}>
						<Skeleton width='40%' />
						<Skeleton width='75%' />
					</div>
				</div>
				<Separator />
				<Progress label='Documents uploaded' max={5} value={3} />
				<Progress label='Upload failed' tone='danger' value={40} />
				<Progress label='Sending' />
			</Example>
		</>
	);
};
