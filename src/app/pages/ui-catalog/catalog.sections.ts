import { type IconName } from '#libs/ui-core';
import { type ComponentType, lazy } from 'react';

/**
 * The sections of the UI catalog (`/ui/<id>`), one per family of components of
 * #libs/ui-core. Each one loads only when it is opened.
 */
export const CATALOG_SECTIONS: readonly CatalogSection[] = [
	{
		id: 'foundations',
		icon: 'eye',
		title: 'Foundations',
		Component: lazy(async () => {
			const { FoundationsSection } =
				await import('./sections/foundations.section.tsx');

			return { default: FoundationsSection };
		}),
	},
	{
		id: 'actions',
		icon: 'activity',
		title: 'Actions and status',
		Component: lazy(async () => {
			const { ActionsSection } =
				await import('./sections/actions.section.tsx');

			return { default: ActionsSection };
		}),
	},
	{
		id: 'fields',
		icon: 'edit',
		title: 'Fields',
		Component: lazy(async () => {
			const { FieldsSection } =
				await import('./sections/fields.section.tsx');

			return { default: FieldsSection };
		}),
	},
	{
		id: 'pickers',
		icon: 'calendar',
		title: 'Pickers',
		Component: lazy(async () => {
			const { PickersSection } =
				await import('./sections/pickers.section.tsx');

			return { default: PickersSection };
		}),
	},
	{
		id: 'content',
		icon: 'document',
		title: 'Content and messages',
		Component: lazy(async () => {
			const { ContentSection } =
				await import('./sections/content.section.tsx');

			return { default: ContentSection };
		}),
	},
	{
		id: 'overlays',
		icon: 'copy',
		title: 'Dialogs and toasts',
		Component: lazy(async () => {
			const { OverlaysSection } =
				await import('./sections/overlays.section.tsx');

			return { default: OverlaysSection };
		}),
	},
	{
		id: 'menus',
		icon: 'more',
		title: 'Menus and tabs',
		Component: lazy(async () => {
			const { MenusSection } =
				await import('./sections/menus.section.tsx');

			return { default: MenusSection };
		}),
	},
	{
		id: 'navigation',
		icon: 'list',
		title: 'Navigation and tables',
		Component: lazy(async () => {
			const { NavigationSection } =
				await import('./sections/navigation.section.tsx');

			return { default: NavigationSection };
		}),
	},
	{
		id: 'shell',
		icon: 'panel-left',
		title: 'Page and shell',
		Component: lazy(async () => {
			const { ShellSection } =
				await import('./sections/shell.section.tsx');

			return { default: ShellSection };
		}),
	},
];

export interface CatalogSection {
	id: string;
	Component: ComponentType;
	icon: IconName;
	title: string;
}
