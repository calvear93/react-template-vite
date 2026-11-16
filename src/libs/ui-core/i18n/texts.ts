import { defined } from '../internal/defined.ts';
import { UI_TEXTS_EN, type UiTexts } from './en.ts';
import { UI_TEXTS_ES } from './es.ts';

/** Some texts of some components, to put over those of the language. */
export type UiTextsOverride = {
	readonly [Component in keyof UiTexts]?: Partial<UiTexts[Component]>;
};

/** The languages the kit speaks, by the language of a locale. */
const LANGUAGES: Partial<Record<string, UiTexts>> = {
	en: UI_TEXTS_EN,
	es: UI_TEXTS_ES,
};

/**
 * The texts of the kit for a locale: those of its language (`es-CL` reads the Spanish
 * ones), or the English ones for a language the kit does not speak.
 *
 * @param locale - a BCP 47 locale
 *
 * @returns the texts, by component
 */
export const textsOf = (locale: string): UiTexts =>
	LANGUAGES[new Intl.Locale(locale).language] ?? UI_TEXTS_EN;

/**
 * The texts of a language with some of an app over them. A text given as `undefined` is a
 * text not given: the one of the language stays.
 *
 * @example
 * ```ts
 * mergeTexts(UI_TEXTS_EN, { dialog: { submit: 'Apply' } }).dialog.close; // 'Close'
 * ```
 *
 * @param texts - the texts of the language
 * @param override - the texts of the app, by component
 *
 * @returns every text, those of the app first
 */
export const mergeTexts = (
	texts: UiTexts,
	override: UiTextsOverride | undefined,
): UiTexts => {
	if (!override) return texts;

	return Object.fromEntries(
		Object.entries(texts).map(([component, group]) => [
			component,
			{ ...group, ...defined(override[component as keyof UiTexts]) },
		]),
	) as UiTexts;
};
