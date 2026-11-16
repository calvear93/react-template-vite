import { type CSSProperties, useId } from 'react';
import { useLocale } from '../../format/locale.hook.ts';
import { type UiTexts } from '../../i18n/en.ts';
import { cx } from '../../internal/cx.ts';
import {
	type Accent,
	ACCENTS,
	type ThemePreference,
} from '../../theme/theme.constants.ts';
import { useTheme } from '../../theme/theme.hook.ts';
import { RadioGroup } from '../radio-group/RadioGroup.tsx';
import { SegmentedControl } from '../segmented-control/SegmentedControl.tsx';
import { Select } from '../select/Select.tsx';
import { Switch } from '../switch/Switch.tsx';
import { VisuallyHidden } from '../visually-hidden/VisuallyHidden.tsx';
import { SettingsGroup, SettingsRow } from './SettingsGroup.tsx';
import styles from './SettingsDialog.module.css';

type SettingsLabels = UiTexts['settings'];

/** A language a person can choose: its name, in that language, and its locale. */
export interface SettingsLanguage {
	label: string;
	/** A BCP 47 locale: `en`, `es-CL`. */
	value: string;
}

/** The languages the kit speaks, each named in itself. */
export const SETTINGS_LANGUAGES: readonly SettingsLanguage[] = [
	{ label: 'English', value: 'en' },
	{ label: 'Español', value: 'es' },
];

/** The language of a locale: `es` for `es-CL`. */
const languageOf = (locale: string) => new Intl.Locale(locale).language;

/** The name of each accent, among the texts of the settings. */
const ACCENT_NAMES = {
	graphite: 'accentGraphite',
	green: 'accentGreen',
	orange: 'accentOrange',
	pink: 'accentPink',
	purple: 'accentPurple',
} as const satisfies Record<Accent, keyof SettingsLabels>;

/**
 * The accents as colors to pick: one radio each, drawn as its color and named by it. The
 * first one is the color of the app.
 */
const AccentPicker = ({ texts }: { texts: SettingsLabels }) => {
	const name = useId();
	const { accent, setAccent } = useTheme();
	const options = [
		{ label: texts.accentDefault, token: 'default', value: null },
		...ACCENTS.map((value) => ({
			label: texts[ACCENT_NAMES[value]],
			token: value,
			value,
		})),
	];

	return (
		<div
			aria-label={texts.accent}
			className={styles.accents}
			role='radiogroup'
		>
			{options.map(({ label, token, value }) => (
				<label className={styles.accent} key={token} title={label}>
					<input
						checked={accent === value}
						className={styles.accentInput}
						name={name}
						onChange={() => setAccent(value)}
						type='radio'
					/>
					<span
						aria-hidden
						className={styles.swatch}
						style={
							{
								'--ui-swatch': `var(--ui-accent-${token})`,
							} as CSSProperties
						}
					/>
					<VisuallyHidden>{label}</VisuallyHidden>
				</label>
			))}
		</div>
	);
};

/** A small picture of the application in a theme. */
const Sample = ({ tone }: { tone: 'dark' | 'light' }) => (
	<span className={cx(styles.sample, styles[tone])}>
		<span className={styles.sampleBar} />
		<span className={styles.sampleBody}>
			<span className={styles.sampleSide} />
			<span className={styles.sampleCard} />
		</span>
	</span>
);

/** The card of a theme: its picture (both halves for the automatic one) over its name. */
const ThemeCard = ({
	name,
	theme,
}: {
	name: string;
	theme: ThemePreference;
}) => (
	<span className={styles.theme}>
		<span aria-hidden className={styles.picture}>
			{theme !== 'dark' && <Sample tone='light' />}
			{theme !== 'light' && <Sample tone='dark' />}
		</span>
		{name}
	</span>
);

/**
 * The category «Appearance» of a SettingsDialog: the theme and whether its dark is a pure
 * black, the accent, the size of the text and the language.
 *
 * @returns the options of the appearance
 */
export const AppearanceSettings = ({
	languages,
	texts,
}: {
	languages: readonly SettingsLanguage[];
	texts: SettingsLabels;
}) => {
	const { pureBlack, setPureBlack, setTextSize, setTheme, textSize, theme } =
		useTheme();
	const { locale, setLocale } = useLocale();
	// the language of the page among those offered: its locale, or one of its language
	const spoken =
		languages.find(({ value }) => value === locale) ??
		languages.find(({ value }) => languageOf(value) === languageOf(locale));

	return (
		<>
			<SettingsGroup>
				<RadioGroup
					className={styles.themes}
					legend={texts.theme}
					onValueChange={setTheme}
					options={[
						{
							description: texts.autoHint,
							label: <ThemeCard name={texts.auto} theme='auto' />,
							value: 'auto',
						},
						{
							value: 'light',
							label: (
								<ThemeCard name={texts.light} theme='light' />
							),
						},
						{
							label: <ThemeCard name={texts.dark} theme='dark' />,
							value: 'dark',
						},
					]}
					orientation='horizontal'
					value={theme}
					variant='cards'
				/>
				<SettingsRow hint={texts.pureBlackHint} label={texts.pureBlack}>
					<Switch
						checked={pureBlack}
						// a light theme has no black to choose
						disabled={theme === 'light'}
						onChange={(event) => setPureBlack(event.target.checked)}
					/>
				</SettingsRow>
				<SettingsRow group hint={texts.accentHint} label={texts.accent}>
					<AccentPicker texts={texts} />
				</SettingsRow>
			</SettingsGroup>

			<SettingsGroup title={texts.text}>
				<SettingsRow
					group
					hint={texts.textSizeHint}
					label={texts.textSize}
				>
					<SegmentedControl
						legend={texts.textSize}
						onValueChange={setTextSize}
						options={[
							{ label: texts.normal, value: 'normal' },
							{ label: texts.large, value: 'large' },
						]}
						size='sm'
						value={textSize}
					/>
				</SettingsRow>
			</SettingsGroup>

			{languages.length > 1 && (
				<SettingsGroup title={texts.language}>
					<SettingsRow
						hint={texts.languageHint}
						label={texts.language}
					>
						<Select
							onChange={(event) => setLocale(event.target.value)}
							options={
								spoken
									? languages
									: [
											{ label: locale, value: locale },
											...languages,
										]
							}
							size='sm'
							value={spoken?.value ?? locale}
						/>
					</SettingsRow>
				</SettingsGroup>
			)}
		</>
	);
};

/**
 * The category «Accessibility» of a SettingsDialog: contrast and underlined links
 * for reading, and how much the application moves. Contrast and motion follow the
 * system until the person chooses; their rows say what the system asks for.
 *
 * @returns the options of accessibility
 */
export const AccessibilitySettings = ({ texts }: { texts: SettingsLabels }) => {
	const {
		contrast,
		motion,
		setContrast,
		setMotion,
		setUnderlineLinks,
		system,
		underlineLinks,
	} = useTheme();

	return (
		<>
			<SettingsGroup title={texts.reading}>
				<SettingsRow
					group
					hint={
						<>
							{texts.contrastHint}
							{system.contrast && ` ${texts.systemContrast}`}
						</>
					}
					label={texts.contrast}
				>
					<SegmentedControl
						legend={texts.contrast}
						onValueChange={(value) =>
							setContrast(value === 'auto' ? null : value)
						}
						options={[
							{ label: texts.auto, value: 'auto' },
							{ label: texts.contrastNormal, value: 'normal' },
							{ label: texts.contrastMore, value: 'more' },
						]}
						size='sm'
						value={contrast ?? 'auto'}
					/>
				</SettingsRow>
				<SettingsRow
					hint={texts.underlineLinksHint}
					label={texts.underlineLinks}
				>
					<Switch
						checked={underlineLinks}
						onChange={(event) =>
							setUnderlineLinks(event.target.checked)
						}
					/>
				</SettingsRow>
			</SettingsGroup>

			<SettingsGroup title={texts.motion}>
				<SettingsRow
					group
					hint={
						<>
							{texts.animationsHint}
							{system.reducedMotion && ` ${texts.systemMotion}`}
						</>
					}
					label={texts.animations}
				>
					<SegmentedControl
						legend={texts.animations}
						onValueChange={(value) =>
							setMotion(value === 'auto' ? null : value)
						}
						options={[
							{ label: texts.auto, value: 'auto' },
							{ label: texts.motionReduce, value: 'reduce' },
							{ label: texts.motionFull, value: 'full' },
						]}
						size='sm'
						value={motion ?? 'auto'}
					/>
				</SettingsRow>
			</SettingsGroup>
		</>
	);
};
