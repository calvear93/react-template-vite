import {
	Checkbox,
	Select,
	type ThemePreference,
	THEMES,
	useLocale,
	useTheme,
} from '#libs/ui-core';
import { useId } from 'react';
import styles from './CatalogToolbar.module.css';

const THEME_NAMES = {
	auto: 'Automatic',
	dark: 'Dark',
	light: 'Light',
} as const satisfies Record<ThemePreference, string>;

/** The languages of the catalog, each named in itself, by the locale it sets. */
const LANGUAGES = [
	{ label: 'English', value: 'en' },
	{ label: 'Español', value: 'es-CL' },
] as const;

/** The language of a locale: `es` for `es-CL`. */
const languageOf = (locale: string) => new Intl.Locale(locale).language;

/**
 * The appearance of the catalog: the language, the theme and the contrast every
 * example is drawn in. They change the whole page, as in any app of the kit. The
 * language is the one of the kit (its texts, its dates, its numbers): what the
 * catalog itself says stays in English.
 *
 * @returns toolbar
 */
export const CatalogToolbar = () => {
	const languageId = useId();
	const themeId = useId();
	const { locale, setLocale } = useLocale();
	const { highContrast, setContrast, setTheme, theme } = useTheme();
	// a locale chosen elsewhere (the settings dialog) shows as its language here
	const language =
		LANGUAGES.find(({ value }) => languageOf(value) === languageOf(locale))
			?.value ?? LANGUAGES[0].value;

	return (
		<div
			aria-label='Appearance and language'
			className={styles.toolbar}
			role='group'
		>
			<span className={styles.field}>
				<label htmlFor={languageId}>Language</label>
				<Select
					id={languageId}
					onChange={({ target }) => {
						const chosen = LANGUAGES.find(
							({ value }) => value === target.value,
						);

						if (chosen) setLocale(chosen.value);
					}}
					options={LANGUAGES}
					size='sm'
					value={language}
				/>
			</span>

			<span className={styles.field}>
				<label htmlFor={themeId}>Theme</label>
				<Select
					id={themeId}
					onChange={({ target }) => {
						const chosen = THEMES.find(
							(name) => name === target.value,
						);

						if (chosen) setTheme(chosen);
					}}
					options={THEMES.map((name) => ({
						label: THEME_NAMES[name],
						value: name,
					}))}
					size='sm'
					value={theme}
				/>
			</span>

			<Checkbox
				checked={highContrast}
				onChange={({ target }) =>
					setContrast(target.checked ? 'more' : 'normal')
				}
			>
				Increase contrast
			</Checkbox>
		</div>
	);
};
