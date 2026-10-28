import react from '@vitejs/plugin-react';
import uno from 'unocss/vite';
import { normalizePath, type UserConfigExport } from 'vite';
import { VitePWA as pwa } from 'vite-plugin-pwa';
import fonts from 'vite-plugin-webfont-dl';
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
						{
							name: 'libs-router',
							priority: 20,
							test: /src\/libs\/router/u,
						},
						{
							name: 'libs-ioc',
							priority: 20,
							test: /src\/libs\/ioc/u,
						},
						{
							name: 'libs-feature',
							priority: 20,
							test: /src\/libs\/feature/u,
						},
					],
				},
			},
		},
	},
	plugins: [
		react({ compiler: true }),
		uno(),
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
