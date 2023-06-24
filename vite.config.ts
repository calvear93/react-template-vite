import tsconfigPaths from 'vite-tsconfig-paths';
import fonts from 'vite-plugin-webfont-dl';
import svg from 'vite-plugin-svgr';
import { VitePWA as pwa } from 'vite-plugin-pwa';
import { createHtmlPlugin as html } from 'vite-plugin-html';
import { checker } from 'vite-plugin-checker';
import { normalizePath, type UserConfigExport } from 'vite';
import css from 'unocss/vite';
import react from '@vitejs/plugin-react-swc';

const FONT_FAMILY = process.env.FONT_FAMILY;
const FONT_WEIGHTS = process.env.FONT_WEIGHTS;
const BASE_PATH = normalizePath(`/${process.env.BASE_URL}`);

export default {
	base: BASE_PATH,
	clearScreen: false,
	server: {
		open: true,
		port: +process.env.PORT!,
		https: process.env.HTTPS === 'true',
	},
	preview: {
		open: true,
		https: process.env.HTTPS === 'true',
		cors: true,
	},
	build: {
		sourcemap: process.env.SOURCEMAP === 'true',
		minify: true,
		target: process.env.TARGET,
		rollupOptions: {
			output: {
				manualChunks: {
					react: ['react', 'react-dom'],
					router: ['react-router-dom'],
					store: ['jotai'],
					http: ['ky'],
				},
			},
		},
	},
	plugins: [
		checker({
			typescript: true,
			enableBuild: true,
			terminal: false,
			eslint: {
				lintCommand: 'eslint --cache src/**/*.{ts,cts,mts,tsx}',
				dev: { logLevel: ['error'] },
			},
			stylelint: {
				lintCommand: 'stylelint --cache src/**/*.{css,scss,sass}',
				dev: { logLevel: ['error'] },
			},
		}),
		react(),
		css(),
		svg(),
		tsconfigPaths(),
		fonts(
			[
				`https://fonts.googleapis.com/css2?family=${FONT_FAMILY}:wght@${FONT_WEIGHTS}&display=swap`,
			],
			{ injectAsStyleTag: false },
		),
		html({
			inject: {
				data: process.env,
			},
			minify: true,
		}),
		pwa({
			devOptions: {
				enabled: false,
			},
			disable: process.env.SERVICE_WORKER === 'false',
			manifest: false,
			registerType: 'autoUpdate',
			injectRegister: 'inline',
			workbox: {
				globPatterns: ['**/*.{html,js,css,ico,png,svg,woff2}'],
				cleanupOutdatedCaches: true,
				sourcemap: process.env.SOURCEMAP === 'true',
			},
		}),
	],
} satisfies UserConfigExport;
