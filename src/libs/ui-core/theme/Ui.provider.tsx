import { type PropsWithChildren, useEffect, useLayoutEffect } from 'react';
import { DialogsProvider } from '../components/alert-dialog/Dialogs.provider.tsx';
import { Toaster } from '../components/toast/Toaster.tsx';
import { useLocale } from '../format/locale.hook.ts';
import { configureLocale } from '../format/locale.ts';
import { TextsContext } from '../i18n/texts.hook.ts';
import { mergeTexts, textsOf, type UiTextsOverride } from '../i18n/texts.ts';
import {
	type LinkComponent,
	LinkContext,
} from '../internal/anchor/link.context.ts';
import { startThemeSync } from './theme.store.ts';

/**
 * The root of an app that uses the kit: keeps the theme and the contrast of the page in step
 * with the person's choice and the system, says the language and the place the kit writes in,
 * gives the kit the app's link, and hosts what is one per app: the toasts of `toast()` and the
 * dialog of `useConfirm()`.
 *
 * `locale` is the language of the app (English without one): every date, number and text of
 * the kit follows it, and a person who chose another (`setLocale`, the settings dialog) keeps
 * theirs. `texts` puts some texts of the app over those of the language.
 *
 * @example
 * ```tsx
 * <UiProvider link={RouterLink} locale='es-CL' currency='CLP' timeZone='America/Santiago'>
 *   <AppRouter />
 * </UiProvider>
 * ```
 *
 * @returns provider
 */
export const UiProvider = ({
	children,
	currency,
	link = 'a',
	locale,
	texts,
	timeZone,
}: UiProviderProps) => {
	const current = useLocale();

	useEffect(() => startThemeSync(), []);

	// before the first paint: the page is drawn in the language of the app, not the kit's
	useLayoutEffect(() => {
		configureLocale({ currency, locale, timeZone });
	}, [currency, locale, timeZone]);

	// a page without its provider goes back to what the kit says by itself
	useLayoutEffect(() => () => configureLocale({}), []);

	return (
		<LinkContext value={link}>
			<TextsContext value={mergeTexts(textsOf(current.locale), texts)}>
				<DialogsProvider>{children}</DialogsProvider>
				<Toaster />
			</TextsContext>
		</LinkContext>
	);
};

export interface UiProviderProps extends PropsWithChildren {
	/** The currency of the amounts, as ISO 4217 (`USD`, `CLP`). Default: `USD`. */
	currency?: string;
	/** The component of an internal link: an adapter of the app's router. Default: an anchor. */
	link?: LinkComponent;
	/** The language and the region of the app, as BCP 47 (`en-GB`, `es-CL`). Default: `en`. */
	locale?: string;
	/** Texts of the app, by component, over those of the language. */
	texts?: UiTextsOverride;
	/** The time zone of the dates (`America/Santiago`). Default: the one of the browser. */
	timeZone?: string;
}
