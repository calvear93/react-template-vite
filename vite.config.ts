import tsconfigPaths from 'vite-tsconfig-paths';
import fonts from 'vite-plugin-webfont-dl';
import { VitePWA as pwa } from 'vite-plugin-pwa';
import { checker } from 'vite-plugin-checker';
import { normalizePath, type UserConfigExport } from 'vite';
import css from 'unocss/vite';
import react from '@vitejs/plugin-react-swc';
import { compilerOptions } from './tsconfig.json';

const FONT_FAMILY = process.env.FONT_FAMILY;
const FONT_WEIGHTS = process.env.FONT_WEIGHTS;
const BASE_PATH = normalizePath(`/${process.env.BASE_URL}`);

export default {
	base: BASE_PATH,
	build: {
		minify: true,
		rollupOptions: {
			output: {
				manualChunks: {
					react: ['react', 'react-dom'],
					router: ['react-router-dom'],
					store: ['jotai'],
				},
				sourcemap: compilerOptions.sourceMap,
			},
		},
		sourcemap: process.env.SOURCEMAP === 'true',
		target: process.env.TARGET,
	},
	clearScreen: false,
	plugins: [
		checker({
			enableBuild: true,
			eslint: {
				dev: { logLevel: ['error'] },
				lintCommand: 'eslint --cache src/**/*.{ts,cts,mts,tsx}',
			},
			terminal: false,
			typescript: true,
		}),
		react(),
		css(),
		tsconfigPaths(),
		fonts(
			[
				`https://fonts.googleapis.com/css2?family=${FONT_FAMILY}:wght@${FONT_WEIGHTS}&display=swap`,
			],
			{ injectAsStyleTag: false },
		),
		pwa({
			devOptions: {
				enabled: false,
			},
			disable: process.env.SERVICE_WORKER === 'false',
			injectRegister: 'inline',
			manifest: false,
			registerType: 'autoUpdate',
			workbox: {
				cleanupOutdatedCaches: true,
				globPatterns: ['**/*.{html,js,css,ico,png,svg,woff2}'],
				sourcemap: process.env.SOURCEMAP === 'true',
			},
		}),
	],
	preview: {
		cors: true,
		open: true,
	},
	server: {
		open: true,
		port: +process.env.PORT!,
	},
} satisfies UserConfigExport;
