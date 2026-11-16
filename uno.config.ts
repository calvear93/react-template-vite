import {
	transformerDirectives,
	transformerVariantGroup,
	type UserConfig,
} from 'unocss';
import icons from 'unocss/preset-icons';
import typography from 'unocss/preset-typography';
import wind from 'unocss/preset-wind4';

const FONT_FAMILY = process.env.FONT_FAMILY;

export default {
	presets: [typography(), wind({ preflights: { reset: false } }), icons()],
	transformers: [transformerDirectives(), transformerVariantGroup()],
	theme: {
		// the colors of the UI kit (#libs/ui-core): a utility follows the theme of the page
		// (light, dark, high contrast) and the color of the app, as every component does
		colors: {
			background: 'var(--ui-color-background)',
			border: 'var(--ui-color-border)',
			card: 'var(--ui-color-card)',
			destructive: 'var(--ui-color-destructive-fill)',
			foreground: 'var(--ui-color-foreground)',
			muted: 'var(--ui-color-muted)',
			'muted-foreground': 'var(--ui-color-muted-foreground)',
			page: 'var(--ui-color-page)',
			primary: 'var(--ui-color-primary-fill)',
			'primary-foreground': 'var(--ui-color-primary-foreground)',
			secondary: 'var(--ui-color-secondary)',
			'secondary-foreground': 'var(--ui-color-secondary-foreground)',
		},
		font: {
			sans: [FONT_FAMILY, 'sans-serif'],
			serif: [FONT_FAMILY, 'serif'],
		},
	},
} satisfies UserConfig;
