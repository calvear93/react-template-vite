import { type ReactNode } from 'react';
import { type UiTexts } from '../../i18n/en.ts';
import { type IconName } from '../../icon/icon.registry.ts';
import { useSettingsWindow } from './settings-dialog.hook.ts';
import { type SettingsLanguage } from './settings.languages.ts';

/**
 * The window where a person sets how the application looks and behaves: its
 * categories in a side bar, the options of the chosen one beside it, in groups of
 * rows. It brings two categories of its own, «Appearance» (theme, text size) and
 * «Accessibility» (contrast, underlined links, motion); `sections` adds the app's
 * after them, built with SettingsGroup and SettingsRow so they look the same.
 *
 * Every change applies at once and is remembered in the browser: there is nothing
 * to save. The categories are tabs: the arrows move through them and choose;
 * below 640px they become a row above the options.
 *
 * Its window is loaded on demand: when it first opens, or ahead once the browser
 * is idle. `defaultSection` is read at that first opening.
 *
 * @example
 * ```tsx
 * <SettingsDialog
 *   open={isOpen}
 *   onOpenChange={setIsOpen}
 *   sections={[
 *     {
 *       id: 'notifications',
 *       label: 'Notifications',
 *       icon: 'mail',
 *       description: 'Which notices you get, and where.',
 *       content: (
 *         <SettingsGroup>
 *           <SettingsRow label='Weekly email' hint='A summary every Monday'>
 *             <Switch checked={weekly} onChange={toggleWeekly} />
 *           </SettingsRow>
 *         </SettingsGroup>
 *       ),
 *     },
 *   ]}
 * />
 * ```
 *
 * @returns settings dialog
 */
export const SettingsDialog = (props: SettingsDialogProps) => {
	const loaded = useSettingsWindow(props.open, props.onOpenChange);

	return loaded ? <loaded.SettingsWindow {...props} /> : null;
};

/** A category of a SettingsDialog. */
export interface SettingsSection {
	/** Identifies the category (`defaultSection`). */
	id: string;
	/** The options of the category: SettingsGroup and SettingsRow. */
	content: ReactNode;
	icon: IconName;
	/** The name of the category, in the side bar and over its options. */
	label: string;
	/** One line under the name: what the category is about. */
	description?: string;
}

export interface SettingsDialogProps {
	open: boolean;
	className?: string;
	/** The category it opens on: `appearance`, `accessibility` or one of `sections`. */
	defaultSection?: string;
	labels?: Partial<UiTexts['settings']>;
	/**
	 * The languages a person can choose, each named in itself. Default: English and Spanish;
	 * with one alone, or none, the dialog offers no choice of language.
	 */
	languages?: readonly SettingsLanguage[];
	/** The categories of the app, after «Appearance» and «Accessibility». */
	sections?: readonly SettingsSection[];
	onOpenChange: (open: boolean) => void;
}
