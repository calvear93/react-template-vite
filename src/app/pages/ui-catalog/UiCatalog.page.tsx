import { useParams } from '#libs/router';
import {
	AppShell,
	type AppShellSection,
	Button,
	Page,
	PageHeader,
	SettingsDialog,
	Spinner,
} from '#libs/ui-core';
import { Suspense, useState } from 'react';
import logoUrl from '../../assets/logo.svg';
import { CATALOG_SECTIONS } from './catalog.sections.ts';
import { CatalogToolbar } from './components/catalog-toolbar/CatalogToolbar.tsx';

/**
 * The live catalog of the UI kit (#libs/ui-core): every component in the language,
 * the theme and the contrast chosen in its toolbar, inside the shell of the kit. A
 * sample: a project that does not want it deletes this folder and its route in
 * `app.routes.tsx`.
 *
 * @returns page
 */
export const UiCatalogPage = () => {
	const { section } = useParams();
	const [isSettingsOpen, setIsSettingsOpen] = useState(false);
	const current =
		CATALOG_SECTIONS.find(({ id }) => id === section) ??
		CATALOG_SECTIONS[0];
	const menu: readonly AppShellSection[] = [
		{
			title: 'Components',
			items: CATALOG_SECTIONS.map(({ id, icon, title }) => ({
				current: id === current.id,
				href: `/ui/${id}`,
				icon,
				label: title,
			})),
		},
		{
			title: 'Application',
			items: [
				{
					href: '/',
					icon: 'arrow-left',
					label: 'Back to the application',
				},
			],
		},
	];

	return (
		<>
			<title>{`${current.title} · UI catalog`}</title>

			<AppShell
				logo={<img alt='' src={logoUrl} />}
				menu={menu}
				pageKey={current.id}
				subtitle='#libs/ui-core'
				title='UI catalog'
				utilities={
					<Button
						icon='settings'
						iconOnly
						onClick={() => setIsSettingsOpen(true)}
						size='sm'
						variant='ghost'
					>
						Settings
					</Button>
				}
			>
				<Page>
					<PageHeader
						actions={<CatalogToolbar />}
						title={current.title}
					/>

					{/* the spinner says “Loading” in the language of the page */}
					<Suspense fallback={<Spinner block showLabel />}>
						<current.Component />
					</Suspense>
				</Page>
			</AppShell>

			<SettingsDialog
				onOpenChange={setIsSettingsOpen}
				open={isSettingsOpen}
			/>
		</>
	);
};

// lazy() route targets need a default export
export default UiCatalogPage;
