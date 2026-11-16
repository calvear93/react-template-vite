import { useLocation } from '#libs/router';
import {
	AppShell,
	type AppShellSection,
	Badge,
	Button,
	SettingsDialog,
} from '#libs/ui-core';
import { type PropsWithChildren, useState } from 'react';
import logoUrl from '../../assets/logo.svg';

/** The menu of the application: one section per group of pages. */
const MENU: readonly AppShellSection[] = [
	{
		title: 'Examples',
		items: [
			{ href: '/', icon: 'home', label: 'Home' },
			{ href: '/detail', icon: 'document', label: 'Detail' },
		],
	},
	{
		items: [{ href: '/ui', icon: 'list', label: 'UI catalog' }],
		title: 'UI kit',
	},
];

/**
 * App layout: the shell of the UI kit (header, menu and content) around every page, with the
 * name of the application, its environment and the settings of the person (theme, contrast,
 * motion, text size, language).
 *
 * @returns app layout
 */
export const AppLayout = ({ children }: AppLayoutProps) => {
	const { pathname } = useLocation();
	const [isSettingsOpen, setIsSettingsOpen] = useState(false);

	return (
		<>
			<AppShell
				logo={<img alt='' src={logoUrl} />}
				menu={MENU}
				pageKey={pathname}
				title={import.meta.env.APP_NAME}
				utilities={
					<>
						<Badge dot tone='warning'>
							{import.meta.env.APP_ENV}
						</Badge>
						<Button
							icon='settings'
							iconOnly
							onClick={() => setIsSettingsOpen(true)}
							size='sm'
							variant='ghost'
						>
							Settings
						</Button>
					</>
				}
			>
				{children}
			</AppShell>

			<SettingsDialog
				onOpenChange={setIsSettingsOpen}
				open={isSettingsOpen}
			/>
		</>
	);
};

export interface AppLayoutProps extends PropsWithChildren {}
