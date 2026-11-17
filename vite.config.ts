import react from '@vitejs/plugin-react';
import { normalizePath, type UserConfigExport } from 'vite';
import { VitePWA as pwa } from 'vite-plugin-pwa';
import fonts from 'vite-plugin-webfont-dl';
import { uiCore } from './src/libs/ui-core/vite/ui-core.plugin.ts';
import tsconfigJson from './tsconfig.json' with { type: 'json' };

// a JSON module only has a default export
const { compilerOptions: tsconfig } = tsconfigJson;
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
		rolldownOptions: {
			output: {
				// the chunks of the UI kit come from uiCore(), with lower priorities
				codeSplitting: {
					groups: [
						{
							name: 'react',
							priority: 100,
							test: /(?:^|\/)(?:react|react-dom)(?:$|\/)/u,
						},
						{
							name: 'router',
							priority: 100,
							test: /node_modules\/react-router/u,
						},
						{
							name: 'store',
							priority: 100,
							test: /node_modules\/jotai/u,
						},
					],
				},
			},
		},
	},
	plugins: [
		// the build rules of the UI kit: its chunks, the order of its cascade layers,
		// the check of what it loads on demand (src/libs/ui-core/vite/)
		uiCore(),
		react({ compiler: true }),
		fonts(
			[
				`https://fonts.googleapis.com/css2?family=${FONT_FAMILY}:wght@${FONT_WEIGHTS}&display=swap`,
			],
			{
				// async loading uses an inline onload handler, which the
				// nginx.conf CSP (script-src 'self') blocks: fonts never apply
				async: false,
				injectAsStyleTag: false,
				minifyCss: true,
			},
		),
		pwa({
			disable: process.env.SERVICE_WORKER === 'false',
			// an external registerSW.js: an inline registration script would
			// be blocked by the nginx.conf CSP (script-src 'self')
			injectRegister: 'script',
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
		open: false,
	},
	server: {
		open: false,
		port: +process.env.PORT!,
	},
} satisfies UserConfigExport;
