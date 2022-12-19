import { UserConfigExport } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import react from '@vitejs/plugin-react';
import css from 'vite-plugin-windicss';
import fonts from 'vite-plugin-webfont-dl';
import { checker } from 'vite-plugin-checker';
import svg from 'vite-plugin-svgr';
import stylelint from 'vite-plugin-stylelint';
import { VitePWA as pwa } from 'vite-plugin-pwa';
import { createHtmlPlugin as html } from 'vite-plugin-html';

const basePath = `${process.env.BASE_URL}/`.replace(/\/+/g, '/');
const fontFamily = process.env.FONT_FAMILY;
const fontWeight = process.env.FONT_WEIGHTS;

// https://vitejs.dev/config/
export default {
	base: basePath,
	server: {
		open: true,
		https: process.env.HTTPS === 'true',
		port: +process.env.PORT!
	},
	build: {
		sourcemap: process.env.GENERATE_SOURCEMAP === 'true',
		emptyOutDir: true,
		minify: true,
		target: process.env.TARGET,
		rollupOptions: {
			output: {
				manualChunks: {
					react: ['react', 'react-dom', 'react-router-dom'],
					store: ['redux', 'easy-peasy']
				}
			}
		}
	},
	plugins: [
		react(),
		css(),
		tsconfigPaths(),
		checker({
			typescript: true,
			enableBuild: true,
			eslint: {
				lintCommand: 'eslint src/**/*.{ts,tsx}',
				dev: { logLevel: ['error'] }
			}
		}),
		svg(),
		stylelint(),
		fonts([
			`https://fonts.googleapis.com/css2?family=${fontFamily}:wght@${fontWeight}&display=swap`
		]),
		html({
			inject: {
				data: process.env
			},
			minify: true
		}),
		pwa({
			devOptions: {
				enabled: false
			},
			manifest: false,
			registerType: 'autoUpdate',
			injectRegister: 'inline',
			workbox: {
				globPatterns: [
					'**/*.{html,js,css,ico,png,svg,woff2,webmanifest}'
				],
				cleanupOutdatedCaches: true,
				sourcemap: process.env.GENERATE_SOURCEMAP === 'true'
			}
		})
	]
} as UserConfigExport;
