import react from '@vitejs/plugin-react-swc';
import unocss from 'unocss/vite';
import { normalizePath, type UserConfigExport } from 'vite';
import { checker } from 'vite-plugin-checker';
import { VitePWA as pwa } from 'vite-plugin-pwa';
import fonts from 'vite-plugin-webfont-dl';
import { compilerOptions as tsconfig } from './tsconfig.json';

const FONT_FAMILY = process.env.FONT_FAMILY;
const FONT_WEIGHTS = process.env.FONT_WEIGHTS;
const BASE_PATH = normalizePath(`/${process.env.BASE_URL}`);

export default {
	base: BASE_PATH,
	clearScreen: false,
	envPrefix: 'APP_',
	build: {
		minify: true,
		sourcemap: tsconfig.sourceMap,
		target: 'baseline-widely-available',
		rollupOptions: {
			output: {
				manualChunks: {
					/* elements order is important because chunks
					may import previously generated/grouped chunks */
					react: ['react', 'react-dom'],
					router: ['react-router'],
					store: ['jotai'],
					'lib-feature': ['./src/libs/feature/index.ts'],
					'lib-router': ['./src/libs/router/index.ts'],
				},
			},
		},
	},
	plugins: [
		checker({
			enableBuild: true,
			terminal: true,
			typescript: true,
			eslint: {
				dev: { logLevel: ['error'] },
				lintCommand: 'eslint --cache',
				useFlatConfig: true,
			},
		}),
		react(),
		unocss(),
		fonts(
			[
				`https://fonts.googleapis.com/css2?family=${FONT_FAMILY}:wght@${FONT_WEIGHTS}&display=swap`,
			],
			{
				injectAsStyleTag: false,
				minifyCss: true,
			},
		),
		pwa({
			disable: process.env.SERVICE_WORKER === 'false',
			injectRegister: 'inline',
			manifest: false,
			registerType: 'autoUpdate',
			devOptions: {
				enabled: false,
			},
			workbox: {
				cleanupOutdatedCaches: true,
				sourcemap: tsconfig.sourceMap,
				globPatterns: [
					'**/*.{html,js,css,ico,png,svg,webp,avif,woff2}',
				],
			},
		}),
	],
	preview: {
		cors: true,
		open: false,
	},
	server: {
		cors: true,
		open: false,
		port: +process.env.PORT!,
	},
} satisfies UserConfigExport;
