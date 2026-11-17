import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import react from '@vitejs/plugin-react';
import {
	normalizePath,
	type PluginOption,
	type Rolldown,
	type UserConfigExport,
} from 'vite';
import { VitePWA as pwa } from 'vite-plugin-pwa';
import fonts from 'vite-plugin-webfont-dl';
import tsconfigJson from './tsconfig.json' with { type: 'json' };

// a JSON module only has a default export
const { compilerOptions: tsconfig } = tsconfigJson;
const FONT_FAMILY = process.env.FONT_FAMILY;
const FONT_WEIGHTS = process.env.FONT_WEIGHTS;
const BASE_PATH = normalizePath(`/${process.env.BASE_URL}`);

/**
 * Escapes a runtime string so it can be embedded in a RegExp literal.
 *
 * @param value - raw string, i.e. a path of the file system
 */
const escapeRegExp = (value: string): string =>
	value.replaceAll(/[$()*+.?[\\\]^{|}]/gu, String.raw`\$&`);

/** The modules of the UI kit (#libs/ui-core), its barrel and its stylesheets. */
const UI_KIT = /src\/libs\/ui-core\//u;
const UI_BARREL = normalizePath(
	resolve(import.meta.dirname, 'src/libs/ui-core/index.ts'),
);
const UI_STYLESHEET = /src\/libs\/ui-core\/.*\.css(?:\?|$)/u;

/** The helper Vite puts wherever something is imported on demand. */
const PRELOAD_HELPER = /vite\/preload-helper/u;

/** What a module takes from the kit, or hands on: the names between the braces. */
const UI_IMPORTS =
	/(?:export|import)\s*\{(?<names>[^}]*)\}\s*from\s*["']#libs\/ui-core["']/gu;

/**
 * The order of the cascade layers of the kit, as its global stylesheet declares
 * it: `@layer reset, ui.tokens, ui.base, ui.components;`.
 */
const UI_LAYERS = readLayers('src/libs/ui-core/styles/index.css');

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
						// what the entry needs of the UI kit (the shell, the providers
						// and what they import) is one chunk, by a rule: see kitShell.
						// Nothing a page alone uses can join it, whatever its size. The
						// rule already follows the imports: followed here too, they would
						// bring the whole kit through its barrel
						{
							includeDependenciesRecursively: false,
							priority: 26,
							name: (id, context) =>
								kitShell(context).has(id) ? 'ui-core' : null,
							test: (id) =>
								UI_KIT.test(id) || PRELOAD_HELPER.test(id),
						},
						// the rest of the kit goes with the pages: what two of them (or
						// more) use is one chunk, fetched with the first page that needs
						// it; what one page alone uses stays in that page's own chunk.
						// No component is a request of its own, and no size decides
						// where a module goes (joining small groups by size makes chunks
						// that import each other)
						{
							minShareCount: 2,
							name: 'ui-core-pages',
							priority: 25,
							test: UI_KIT,
						},
					],
				},
			},
			// the UI kit is imported through one barrel (#libs/ui-core), and each of its
			// components imports its stylesheet: taken as modules with side effects, the
			// whole kit and its CSS go before the first paint whatever the page uses.
			// Told that only the barrel and the stylesheets have them, a component ships
			// with the pages that use it. The first rule that matches wins
			treeshake: {
				moduleSideEffects: [
					{ sideEffects: true, test: /\.css(?:\?|$)/u },
					{
						sideEffects: true,
						test: new RegExp(`${escapeRegExp(UI_BARREL)}$`, 'u'),
					},
					{ sideEffects: false, test: UI_KIT },
				],
			},
		},
	},
	plugins: [
		kitLayers(),
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

/** The shell of the kit of each build: worked out once, with its first module. */
const KIT_SHELLS = new WeakMap<Rolldown.ChunkingContext, Set<string>>();

/**
 * The modules of the UI kit the entry needs, before any page: what the modules
 * loaded with the entry take from the barrel (`import { … } from '#libs/ui-core'`),
 * whatever those import (Vite's helper for what they load on demand too), and the
 * stylesheets of the barrel.
 *
 * The bundler cannot tell them apart by itself: the barrel imports the whole kit,
 * so every module of it is «imported by the entry». Telling by size (joining the
 * small groups of modules) puts half the kit in front of the first paint as soon
 * as one more module is shared, and the stylesheet that declares the cascade
 * layers after others.
 *
 * @param context - the module graph of the build
 *
 * @returns the ids of the modules of the shell
 */
function kitShell(context: Rolldown.ChunkingContext) {
	const known = KIT_SHELLS.get(context);

	if (known) return known;

	const shell = new Set([UI_BARREL]);
	const owners = new Map<string, string>();

	const add = (module: string | undefined) => {
		if (!module || shell.has(module)) return;
		if (!UI_KIT.test(module) && !PRELOAD_HELPER.test(module)) return;

		shell.add(module);

		for (const imported of context.getModuleInfo(module)?.importedIds ?? [])
			add(imported);
	};

	/** Loaded with the entry: reached from it by static imports alone. */
	const isEager = (module: string, seen = new Set<string>()): boolean => {
		const info = context.getModuleInfo(module);

		if (!info || seen.has(module)) return false;

		seen.add(module);

		return (
			info.isEntry ||
			info.importers.some((importer) => isEager(importer, seen))
		);
	};

	const { importedIds = [], importers = [] } =
		context.getModuleInfo(UI_BARREL) ?? {};

	for (const module of importedIds) {
		if (UI_STYLESHEET.test(module)) add(module);

		for (const name of context.getModuleInfo(module)?.exports ?? [])
			owners.set(name, module);
	}

	for (const importer of importers.filter((module) => isEager(module))) {
		const code = context.getModuleInfo(importer)?.code ?? '';

		for (const { groups } of code.matchAll(UI_IMPORTS)) {
			// «Button as Action» takes Button
			for (const name of groups!.names.split(','))
				add(owners.get(name.trim().split(/\s/u)[0]));
		}
	}

	KIT_SHELLS.set(context, shell);

	return shell;
}

/**
 * Says the order of the cascade layers at the top of every stylesheet of the UI
 * kit. The first stylesheet a browser reads decides that order, and which one is
 * first depends on how the build splits the kit: a stylesheet of components read
 * before the global one would put the layer of the components under the reset.
 * Said by each, the order is the same whatever comes first. It goes on the first
 * line: the names of a CSS Module carry the line of their rule.
 */
function kitLayers(): PluginOption {
	return {
		enforce: 'pre',
		name: 'kit-layers',
		transform: (code, id) =>
			UI_STYLESHEET.test(id) && !code.includes(UI_LAYERS)
				? { code: UI_LAYERS + code, map: null }
				: null,
	};
}

/**
 * Reads the statement that orders the cascade layers of a stylesheet.
 *
 * @param path - the stylesheet, from the folder of this file
 *
 * @returns the statement, `@layer …;`
 */
function readLayers(path: string) {
	const css = readFileSync(resolve(import.meta.dirname, path), 'utf8');
	const statement = /^@layer [^;{]+;/mu.exec(css);

	if (!statement)
		throw new Error(
			`${path} must declare the order of its cascade layers in one @layer statement`,
		);

	return statement[0];
}
