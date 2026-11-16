import {
	Badge,
	Button,
	DataGrid,
	DropdownMenu,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuSeparator,
	EmptyState,
	Field,
	Input,
	Popover,
	Tab,
	Tabs,
	TabsList,
	TabsPanel,
	toast,
	Tooltip,
} from '#libs/ui-core';
import { useState } from 'react';
import { Example } from '../components/example/Example.tsx';

/**
 * Menus, tooltips and tabs of the kit.
 *
 * @returns section
 */
export const MenusSection = () => {
	const [view, setView] = useState('data');

	return (
		<>
			<Example
				note='Secondary actions behind a button. The arrows move through the items, Escape closes and gives the focus back; a disabled item stays in sight.'
				title='DropdownMenu'
			>
				<DropdownMenu label='Actions' variant='outlined'>
					<DropdownMenuItem
						icon='edit'
						onSelect={() => toast('Edit record')}
					>
						Edit
					</DropdownMenuItem>
					<DropdownMenuItem
						icon='copy'
						onSelect={() => toast('Duplicated')}
					>
						Duplicate
					</DropdownMenuItem>
					<DropdownMenuItem disabled icon='send'>
						Send to review
					</DropdownMenuItem>
					<DropdownMenuSeparator />
					<DropdownMenuItem
						icon='trash'
						onSelect={() =>
							toast('Access removed', { tone: 'warning' })
						}
						tone='danger'
					>
						Remove access
					</DropdownMenuItem>
				</DropdownMenu>

				<DropdownMenu icon='more' label='More actions of the record'>
					<DropdownMenuItem href='/ui/foundations' icon='arrow-right'>
						Go to Foundations
					</DropdownMenuItem>
					<DropdownMenuItem
						href='https://example.com'
						icon='external-link'
						rel='noreferrer'
						target='_blank'
					>
						Example site
					</DropdownMenuItem>
				</DropdownMenu>

				<DropdownMenu
					align='end'
					header={
						<>
							<strong>Anna Schmidt</strong>
							<br />
							anna.schmidt@example.com
						</>
					}
					label='Account of Anna Schmidt'
					renderTrigger={(props) => (
						<Button
							{...props}
							iconEnd='chevron-down'
							variant='filled'
						>
							Anna Schmidt
						</Button>
					)}
				>
					<DropdownMenuGroup label='Preferences'>
						<DropdownMenuItem icon='settings'>
							Settings
						</DropdownMenuItem>
						<DropdownMenuItem icon='help'>Help</DropdownMenuItem>
					</DropdownMenuGroup>
					<DropdownMenuSeparator />
					<DropdownMenuItem icon='logout' tone='danger'>
						Sign out
					</DropdownMenuItem>
				</DropdownMenu>
			</Example>

			<Example
				note='A panel with free content that hangs from a button: some filters, the detail of a figure. It is not modal: Escape, a click outside or leaving with Tab close it.'
				title='Popover'
			>
				<Popover icon='filter' label='Filters'>
					<Field label='Reference'>
						<Input name='folio' placeholder='INC-2026-…' />
					</Field>
					<Button size='sm'>Apply</Button>
				</Popover>
				<Popover
					align='end'
					label='How is it calculated?'
					variant='ghost'
				>
					The average of the monthly income of the last six months
					with contributions.
				</Popover>
			</Example>

			<Example
				note='A hint on hover or on focus. It describes the control; it is never the only place of something needed.'
				title='Tooltip'
			>
				<Tooltip content='It downloads as a PDF'>
					<Button icon='download' iconOnly variant='outlined'>
						Download certificate
					</Button>
				</Tooltip>
				<Tooltip content='Below' side='bottom'>
					<Button variant='ghost'>Bottom</Button>
				</Tooltip>
				<Tooltip content='To the right of the control' side='right'>
					<Button variant='ghost'>Right</Button>
				</Tooltip>
				<Tooltip content='To the left' side='left'>
					<Button variant='ghost'>Left</Button>
				</Tooltip>
			</Example>

			<Example
				layout='stack'
				note='Views of one same thing. The list is a single Tab stop: the arrows move and choose.'
				title='Tabs'
			>
				<Tabs onValueChange={setView} value={view}>
					<TabsList label='Record of the employee'>
						<Tab value='data'>Details</Tab>
						<Tab attention count={3} value='reports'>
							Reports
						</Tab>
						<Tab count={12} value='documents'>
							Documents
						</Tab>
						<Tab disabled value='history'>
							History
						</Tab>
					</TabsList>
					<TabsPanel value='data'>
						<DataGrid
							entries={[
								{ label: 'Name', value: 'Anna Schmidt' },
								{
									label: 'Position',
									value: 'Warehouse operator',
								},
							]}
						/>
					</TabsPanel>
					<TabsPanel value='reports'>
						Three reports, <Badge tone='warning'>1 due soon</Badge>
					</TabsPanel>
					<TabsPanel value='documents'>
						<EmptyState compact title='No documents yet' />
					</TabsPanel>
				</Tabs>
			</Example>

			<Example
				layout='stack'
				note='box: a compact change of view inside a surface. vertical: the tabs on one side, with the up and down arrows.'
				title='Tabs: variants'
			>
				<Tabs defaultValue='list' variant='box'>
					<TabsList label='View of the list'>
						<Tab value='list'>List</Tab>
						<Tab value='cards'>Cards</Tab>
						<Tab value='calendar'>Calendar</Tab>
					</TabsList>
					<TabsPanel value='list'>List view</TabsPanel>
					<TabsPanel value='cards'>Card view</TabsPanel>
					<TabsPanel value='calendar'>Calendar view</TabsPanel>
				</Tabs>

				<Tabs defaultValue='profile' orientation='vertical'>
					<TabsList label='Settings'>
						<Tab value='profile'>Profile</Tab>
						<Tab value='notifications'>Notifications</Tab>
						<Tab value='security'>Security</Tab>
					</TabsList>
					<TabsPanel value='profile'>
						Details of the profile
					</TabsPanel>
					<TabsPanel value='notifications'>
						Which notices you get
					</TabsPanel>
					<TabsPanel value='security'>Sessions and access</TabsPanel>
				</Tabs>
			</Example>
		</>
	);
};
