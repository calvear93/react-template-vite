import { afterAll, beforeEach } from 'vitest';
import { configureLocale, setLocale } from '../format/locale.ts';

/**
 * Runs the tests of a file as those of an app in Chile: Spanish texts, dates and numbers as
 * `es-CL` writes them, Chilean pesos and the time of Santiago. Called once, at the top of a
 * spec that reads Spanish texts or Chilean formats; the specs without it run as the kit is by
 * itself (English, US dollars).
 *
 * The language is set as the choice of a person, so a `UiProvider` rendered by a test (which
 * sets the language of its app) does not take it away.
 */
export const inChile = () => {
	beforeEach(() => {
		configureLocale({ currency: 'CLP', timeZone: 'America/Santiago' });
		setLocale('es-CL');
	});

	afterAll(() => {
		configureLocale({});
		setLocale(null);
	});
};
