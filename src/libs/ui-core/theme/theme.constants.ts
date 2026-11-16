/** Storage key of the theme the person chose (absent: it follows the system). */
export const THEME_STORAGE_KEY = 'ui.theme';

/** Storage key of the contrast the person chose (absent: it follows the system). */
export const CONTRAST_STORAGE_KEY = 'ui.contrast';

/** Storage key of the motion the person chose (absent: it follows the system). */
export const MOTION_STORAGE_KEY = 'ui.motion';

/** Storage key of the text size the person chose (absent: the normal one). */
export const TEXT_STORAGE_KEY = 'ui.text';

/** Storage key of the links the person wants always underlined (absent: as each one is drawn). */
export const LINKS_STORAGE_KEY = 'ui.links';

/** Storage key of the accent the person chose (absent: the color of the app). */
export const ACCENT_STORAGE_KEY = 'ui.accent';

/** Storage key of the pure black the person wants for the dark theme (absent: its dark gray). */
export const BLACK_STORAGE_KEY = 'ui.black';

/** The theme choices: auto follows the system's light or dark. */
export const THEMES = ['auto', 'light', 'dark'] as const;

/** The accents a person can choose instead of the color of the app. */
export const ACCENTS = [
	'purple',
	'pink',
	'orange',
	'green',
	'graphite',
] as const;

export type Accent = (typeof ACCENTS)[number];

export type ContrastPreference = 'more' | 'normal' | null;

/** Less motion, all of it, or what the system asks (`null`). */
export type MotionPreference = 'full' | 'reduce' | null;

export type TextSize = 'large' | 'normal';

export type ResolvedTheme = 'dark' | 'light';

export type ThemePreference = (typeof THEMES)[number];
