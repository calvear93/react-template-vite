import { useSyncExternalStore } from 'react';
import { getLocaleSnapshot, setLocale, subscribeLocale } from './locale.ts';

/**
 * The language and the place the kit writes in, and the function that chooses the language.
 * A component gives `locale` to every format it calls: it is drawn again when the language
 * changes.
 *
 * @example
 * ```tsx
 * const { locale, setLocale } = useLocale();
 *
 * <p>{formatDate(order.date, locale)}</p>
 * <button onClick={() => setLocale('es-CL')}>Español</button>
 * ```
 *
 * @returns the locale, the time zone, the currency and the setter of the locale
 */
export const useLocale = () => {
	const { currency, locale, timeZone } = useSyncExternalStore(
		subscribeLocale,
		getLocaleSnapshot,
	);

	return { currency, locale, setLocale, timeZone };
};
