import {
	type Accent,
	ACCENTS,
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

/** The accents a person can choose instead of the blue of the app, by their name. */
const ACCENT_NAMES = {
	graphite: 'Graphite',
	green: 'Green',
	orange: 'Orange',
	pink: 'Pink',
	purple: 'Purple',
} as const satisfies Record<Accent, string>;

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
	const accentId = useId();
	const { locale, setLocale } = useLocale();
	const {
		accent,
		highContrast,
		pureBlack,
		setAccent,
		setContrast,
		setPureBlack,
		setTheme,
		theme,
	} = useTheme();
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

			<span className={styles.field}>
				<label htmlFor={accentId}>Accent</label>
				<Select
					id={accentId}
					onChange={({ target }) =>
						setAccent(
							ACCENTS.find((name) => name === target.value) ??
								null,
						)
					}
					options={[
						{ label: 'Blue', value: '' },
						...ACCENTS.map((name) => ({
							label: ACCENT_NAMES[name],
							value: name,
						})),
					]}
					size='sm'
					value={accent ?? ''}
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

			<Checkbox
				checked={pureBlack}
				// of the dark theme: a light one has no black to choose
				disabled={theme === 'light'}
				onChange={({ target }) => setPureBlack(target.checked)}
			>
				Pure black (AMOLED)
			</Checkbox>
		</div>
	);
};
