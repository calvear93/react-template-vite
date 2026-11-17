import { type Rolldown } from 'vite';
import {
	PRELOAD_HELPER,
	UI_BARREL,
	UI_IMPORTS,
	UI_KIT,
	UI_STYLESHEET,
} from './kit.paths.ts';

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
 * @returns the ids of the modules of the shell; none for a build without the kit
 */
export function kitShell(context: Rolldown.ChunkingContext) {
	const known = KIT_SHELLS.get(context);

	if (known) return known;

	const barrel = context.getModuleInfo(UI_BARREL);

	if (!barrel) return;

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

	for (const module of barrel.importedIds) {
		if (UI_STYLESHEET.test(module)) add(module);

		for (const name of context.getModuleInfo(module)?.exports ?? [])
			owners.set(name, module);
	}

	for (const importer of barrel.importers) {
		if (!isEager(importer)) continue;

		// loaded with the entry, so the graph knows it; a module may have no code to read
		const { code } = context.getModuleInfo(importer)!;

		for (const { groups } of (code ?? '').matchAll(UI_IMPORTS)) {
			// «Button as Action» takes Button
			for (const name of groups!.names.split(','))
				add(owners.get(name.trim().split(/\s/u)[0]));
		}
	}

	KIT_SHELLS.set(context, shell);

	return shell;
}
