/*
 * What a person chose for this browser (a theme, a language), kept in `localStorage`. The
 * choices of this page too: with a blocked storage they hold until the page is left.
 */

const memory = new Map<string, string | null>();

/**
 * A choice that was remembered.
 *
 * @param key - the storage key of the choice
 *
 * @returns the choice, or null when none was made
 */
export const readPreference = (key: string): string | null => {
	if (memory.has(key)) return memory.get(key) ?? null;

	try {
		return localStorage.getItem(key);
	} catch {
		return null;
	}
};

/**
 * Remembers a choice, or forgets it.
 *
 * @param key - the storage key of the choice
 * @param value - the choice; null to forget it
 */
export const writePreference = (key: string, value: string | null) => {
	memory.set(key, value);

	try {
		if (value === null) localStorage.removeItem(key);
		else localStorage.setItem(key, value);
	} catch {
		// storage blocked: the choice holds in memory until the page is left
	}
};
