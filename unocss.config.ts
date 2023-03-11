import tailwind from 'unocss/preset-wind';
import icons from 'unocss/preset-icons';
import { transformerDirectives, transformerVariantGroup } from 'unocss';
import type { UserConfig } from 'unocss';

const fontFamily = process.env.FONT_FAMILY;

export default {
	presets: [tailwind({ preflight: true }), icons({ prefix: '' })],
	transformers: [transformerDirectives(), transformerVariantGroup()],
	theme: {
		fontFamily: {
			sans: [fontFamily, 'sans-serif'],
			serif: [fontFamily, 'serif'],
		},
	},
} as UserConfig;
