import { type IconName } from '../icon/icon.registry.ts';

/** The tones of a message: what it is about, never said by color alone. */
export type Tone = 'danger' | 'info' | 'neutral' | 'success' | 'warning';

/** The icon that goes with each tone. */
export const TONE_ICONS = {
	danger: 'x-circle',
	info: 'info',
	neutral: 'info',
	success: 'check-circle',
	warning: 'alert-triangle',
} as const satisfies Record<Tone, IconName>;
