import { createContext, use } from 'react';
import { useLocale } from '../format/locale.hook.ts';
import { type UiTexts } from './en.ts';
import { textsOf } from './texts.ts';

/** The texts `UiProvider` settled on: those of the language, with the app's over them. */
export const TextsContext = createContext<UiTexts | undefined>(undefined);

/**
 * The texts of the kit in the language of the page, by component. A component puts over them
 * the ones it is given: `{ ...useTexts().dialog, ...defined(labels) }`.
 *
 * @example
 * ```tsx
 * const { close } = useTexts().dialog;
 * ```
 *
 * @returns every text of the kit
 */
export const useTexts = (): UiTexts => {
	const { locale } = useLocale();

	return use(TextsContext) ?? textsOf(locale);
};
