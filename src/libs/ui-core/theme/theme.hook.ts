import { useSyncExternalStore } from 'react';
import {
	getThemeSnapshot,
	setContrast,
	setMotion,
	setTextSize,
	setTheme,
	setUnderlineLinks,
	subscribeTheme,
} from './theme.store.ts';

/**
 * How the page looks and behaves for this person, and the functions that choose it:
 * the theme, the contrast, how much it moves, the size of its text and whether its
 * links are always underlined. Each choice applies at once and is remembered in the
 * browser; theme, contrast and motion follow the system until one is made (`system`
 * says what it asks for).
 *
 * @example
 * ```tsx
 * const { theme, resolvedTheme, setTheme } = useTheme();
 *
 * <button onClick={() => setTheme('dark')}>Dark</button>
 * ```
 *
 * @returns each preference, what is applied, what the system asks for, and the setters
 */
export const useTheme = () => {
	const {
		contrast,
		highContrast,
		motion,
		reducedMotion,
		resolvedTheme,
		system,
		textSize,
		theme,
		underlineLinks,
	} = useSyncExternalStore(subscribeTheme, getThemeSnapshot);

	return {
		contrast,
		highContrast,
		motion,
		reducedMotion,
		resolvedTheme,
		setContrast,
		setMotion,
		setTextSize,
		setTheme,
		setUnderlineLinks,
		system,
		textSize,
		theme,
		underlineLinks,
	};
};
