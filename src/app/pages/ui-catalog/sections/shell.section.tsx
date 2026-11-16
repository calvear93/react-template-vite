import {
	Badge,
	Button,
	DropdownMenuItem,
	DropdownMenuSeparator,
	formatDate,
	InfoNote,
	Page,
	PageHeader,
	Select,
	SettingsDialog,
	SettingsGroup,
	SettingsRow,
	Switch,
	toast,
	useLocale,
	UserMenu,
} from '#libs/ui-core';
import { useState } from 'react';
import { Example } from '../components/example/Example.tsx';

/**
 * The frame of a page: the shell, the header of a page, the user's menu and the
 * settings of the appearance and the language.
 *
 * @returns section
 */
export const ShellSection = () => {
	const { locale } = useLocale();
	const [isSettingsOpen, setIsSettingsOpen] = useState(false);

	return (
		<>
			<Example
				layout='stack'
				note='The frame of the application: the header, the side menu by sections and the content, the only part that scrolls. The menu folds to its icons and, under 900 px, becomes a panel over the page.'
				title='AppShell'
			>
				<InfoNote title='This catalog is built on AppShell'>
					Try folding the menu with the button at the foot of the
					sidebar, narrowing the window to see the panel, and the Tab
					key when the page loads: the first link skips to the
					content.
				</InfoNote>
			</Example>

			<Example
				layout='stack'
				note='The header of a page: the trail that leads to it, its title (the h1), a line under it and its actions. Page stacks the blocks of the page with the same space.'
				title='PageHeader'
			>
				<Page>
					<PageHeader
						actions={
							<>
								<Button icon='download' variant='outlined'>
									Export
								</Button>
								<Button icon='edit'>Edit</Button>
							</>
						}
						breadcrumb={[
							{ href: '/ui/navigation', label: 'Reports' },
							{ label: 'INC-2026-001482' },
						]}
						meta={
							<>
								Submitted on {formatDate('2026-11-05', locale)}{' '}
								· <Badge tone='warning'>In review</Badge>
							</>
						}
						title='Report INC-2026-001482'
					/>
				</Page>
			</Example>

			<Example
				note='The person signed in, at the end of the header: the short name, the role and the avatar in a single button that opens their menu. On narrow screens only the avatar is left.'
				title='UserMenu'
			>
				<UserMenu
					detail='anna.schmidt@example.com'
					name='Schmidt, Anna Marie'
					roleLabel='Administrator'
				>
					<DropdownMenuItem
						icon='settings'
						onSelect={() => setIsSettingsOpen(true)}
					>
						Settings
					</DropdownMenuItem>
					<DropdownMenuSeparator />
					<DropdownMenuItem
						icon='logout'
						onSelect={() => toast('Signed out (example)')}
						tone='danger'
					>
						Sign out
					</DropdownMenuItem>
				</UserMenu>
			</Example>

			<Example
				note='The settings window: the categories on one side and their options in rows. It comes with Appearance (theme, text size, language) and Accessibility (contrast, links, motion); the application adds its own. Each change applies at once and is remembered in the browser.'
				title='SettingsDialog'
			>
				<Button
					icon='settings'
					onClick={() => setIsSettingsOpen(true)}
					variant='outlined'
				>
					Open the settings
				</Button>
				<SettingsDialog
					onOpenChange={setIsSettingsOpen}
					open={isSettingsOpen}
					sections={[
						{
							id: 'notifications',
							description: 'Which notices you get, and how.',
							icon: 'mail',
							label: 'Notifications',
							content: (
								<SettingsGroup title='Email'>
									<SettingsRow
										hint='A summary of your reports every Monday'
										label='Weekly summary'
									>
										<Switch defaultChecked />
									</SettingsRow>
									<SettingsRow
										hint='When to tell you of a change of status'
										label='Changes of status'
									>
										<Select
											defaultValue='now'
											options={[
												{
													label: 'At once',
													value: 'now',
												},
												{
													label: 'Once a day',
													value: 'daily',
												},
												{
													label: 'Never',
													value: 'never',
												},
											]}
											size='sm'
										/>
									</SettingsRow>
								</SettingsGroup>
							),
						},
					]}
				/>
			</Example>
		</>
	);
};
