/** A language a person can choose: its name, in that language, and its locale. */
export interface SettingsLanguage {
	label: string;
	/** A BCP 47 locale: `en`, `es-CL`. */
	value: string;
}

/**
 * The languages the kit speaks, each named in itself. A module of its own: an app
 * reads it on its first screen, and the panes of the settings are loaded on demand.
 */
export const SETTINGS_LANGUAGES: readonly SettingsLanguage[] = [
	{ label: 'English', value: 'en' },
	{ label: 'Español', value: 'es' },
];
