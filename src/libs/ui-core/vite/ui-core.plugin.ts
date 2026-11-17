import { readFileSync } from 'node:fs';
import { type Plugin, type PluginOption, type UserConfig } from 'vite';
import { kitShell } from './kit-shell.ts';
import {
	PRELOAD_HELPER,
	UI_BARREL,
	UI_KIT,
	UI_LAYERS_SHEET,
	UI_STYLESHEET,
} from './kit.paths.ts';
import { UI_ON_DEMAND } from './on-demand.modules.ts';

/**
 * Escapes a string so it can be embedded in a RegExp.
 *
 * @param value - raw string, i.e. a path of the file system
 */
const escapeRegExp = (value: string): string =>
	value.replaceAll(/[$()*+.?[\\\]^{|}]/gu, String.raw`\$&`);

/**
 * Reads the statement that orders the cascade layers of a stylesheet.
 *
 * @param path - the stylesheet
 *
 * @returns the statement, `@layer …;`
 */
export const readLayers = (path: string) => {
	const statement = /^@layer [^;{]+;/mu.exec(readFileSync(path, 'utf8'));

	if (!statement)
		throw new Error(
			`${path} must declare the order of its cascade layers in one @layer statement`,
		);

	return statement[0];
};

/**
 * Where the build puts the kit, by rule and with no size, and what of it has side
 * effects. Its groups join those of the app's config; their priorities decide.
 *
 * @returns the plugin
 */
export const kitChunks = (): Plugin => ({
	name: 'kit-chunks',
	config: () =>
		({
			build: {
				rolldownOptions: {
					output: {
						codeSplitting: {
							groups: [
								// what the kit loads on demand (`onDemand()`: the dialogs of
								// useDialogs() and the window of SettingsDialog) is a chunk of
								// its own, which no page waits for. Only the modules named: what
								// they import stays with the pages that use it too
								{
									includeDependenciesRecursively: false,
									name: 'ui-core-on-demand',
									priority: 30,
									test: UI_ON_DEMAND,
								},
								// what the entry needs of the kit (the shell, the providers and
								// what they import) is one chunk, by a rule: see kitShell. The
								// rule already follows the imports: followed here too, they
								// would bring the whole kit through its barrel
								{
									includeDependenciesRecursively: false,
									priority: 26,
									name: (id, context) => {
										const shell = kitShell(context);

										if (shell)
											return shell.has(id)
												? 'ui-core'
												: null;
										if (!UI_KIT.test(id)) return null;

										throw new Error(
											`the barrel of the UI kit (${UI_BARREL}) is not in the build`,
										);
									},
									test: (id) =>
										UI_KIT.test(id) ||
										PRELOAD_HELPER.test(id),
								},
								// the rest goes with the pages: what two of them (or more) use is
								// one chunk, fetched with the first page that needs it; what one
								// page alone uses stays in that page's own chunk
								{
									minShareCount: 2,
									name: 'ui-core-pages',
									priority: 25,
									test: UI_KIT,
								},
							],
						},
					},
					// imported through one barrel whose components import their stylesheets,
					// the whole kit would be kept wherever one component is used. Told that
					// only the barrel and the stylesheets have side effects, a component
					// ships with the pages that use it. The first rule that matches wins
					treeshake: {
						moduleSideEffects: [
							{ sideEffects: true, test: /\.css(?:\?|$)/u },
							{
								sideEffects: true,
								test: new RegExp(
									`${escapeRegExp(UI_BARREL)}$`,
									'u',
								),
							},
							{ sideEffects: false, test: UI_KIT },
						],
					},
				},
			},
		}) satisfies UserConfig,
});

/**
 * Says the order of the cascade layers at the top of every stylesheet of the kit.
 * The first stylesheet a browser reads decides that order, and which one is first
 * depends on how the build splits the kit. Said by each, the order is the same
 * whatever comes first. It goes on the first line: the names of a CSS Module carry
 * the line of their rule.
 *
 * @param layers - the statement, `@layer …;`
 *
 * @returns the plugin
 */
export const kitLayers = (layers = readLayers(UI_LAYERS_SHEET)): Plugin => ({
	enforce: 'pre',
	name: 'kit-layers',
	transform: (code, id) =>
		UI_STYLESHEET.test(id) && !code.includes(layers)
			? { code: layers + code, map: null }
			: null,
});

/**
 * Checks `UI_ON_DEMAND` against the module graph, and fails the build when it
 * misses a module: a part loaded with `onDemand()` (imported on demand from the
 * kit), or a module that the modules of those parts alone import. Left out of the
 * list, either would go in a chunk the pages wait for, and nothing would say so.
 *
 * @returns the plugin
 */
export const kitOnDemand = (): Plugin => ({
	apply: 'build',
	name: 'kit-on-demand',
	buildEnd(error) {
		if (error) return;

		const missing = [...this.getModuleIds()].filter((id) => {
			if (!UI_KIT.test(id) || UI_ON_DEMAND.test(id)) return false;

			const { dynamicImporters = [], importers = [] } =
				this.getModuleInfo(id) ?? {};

			return (
				dynamicImporters.some((importer) => UI_KIT.test(importer)) ||
				(importers.length > 0 &&
					importers.every((importer) => UI_ON_DEMAND.test(importer)))
			);
		});

		if (missing.length > 0)
			this.error(
				`loaded on demand but not in UI_ON_DEMAND (src/libs/ui-core/vite/on-demand.modules.ts): ${missing
					.map((id) => id.replace(/^.*src\/libs\/ui-core\//u, ''))
					.join(
						', ',
					)}. Add them to it: left out, they go in a chunk the pages wait for`,
			);
	},
});

/**
 * The build rules of the UI kit, for `vite.config.ts`: where its modules go
 * (`kitChunks`), the order of its cascade layers in every stylesheet
 * (`kitLayers`), and the check of what it loads on demand (`kitOnDemand`).
 *
 * @example
 * ```ts
 * // vite.config.ts
 * plugins: [uiCore(), react({ compiler: true })],
 * ```
 *
 * @returns the plugins
 */
export const uiCore = (): PluginOption[] => [
	kitChunks(),
	kitLayers(),
	kitOnDemand(),
];
