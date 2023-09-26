import tailwind from 'unocss/preset-wind';
import icons from 'unocss/preset-icons';
import {
	transformerDirectives,
	transformerVariantGroup,
	type UserConfig,
} from 'unocss';

const FONT_FAMILY = process.env.FONT_FAMILY;

export default {
	presets: [tailwind({ preflight: true }), icons({ prefix: '' })],
	theme: {
		fontFamily: {
			sans: [FONT_FAMILY, 'sans-serif'],
			serif: [FONT_FAMILY, 'serif'],
		},
	},
	transformers: [transformerDirectives(), transformerVariantGroup()],
} satisfies UserConfig;
