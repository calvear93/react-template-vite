import { dirname } from 'node:path';
import { type Rolldown } from 'vite';
import { describe, expect, test } from 'vitest';
import { kitShell } from './kit-shell.ts';
import { UI_BARREL } from './kit.paths.ts';

const KIT = dirname(UI_BARREL);
const APP = '/repo/src/app/App.tsx';
const PAGE = '/repo/src/app/pages/detail/Detail.page.tsx';
const ENTRY = '/repo/src/main.tsx';
const HELPER = '\0vite/preload-helper.js';

const BUTTON = `${KIT}/components/button/Button.tsx`;
const BUTTON_CSS = `${KIT}/components/button/Button.module.css`;
const CX = `${KIT}/internal/cx.ts`;
const DIALOG = `${KIT}/components/dialog/Dialog.tsx`;
const LOGO = `${KIT}/brand/Logo.tsx`;
const STYLES = `${KIT}/styles/index.css`;

type Module = Partial<Rolldown.ModuleInfo>;

/** A module graph of a build, as the bundler hands it to its chunking: modules by id. */
const graph = (modules: Record<string, Module>) =>
	({
		getModuleInfo: (id: string) =>
			id in modules
				? {
						code: '',
						exports: [],
						importedIds: [],
						importers: [],
						isEntry: false,
						...modules[id],
					}
				: null,
	}) as unknown as Rolldown.ChunkingContext;

/**
 * An app whose shell takes `Button` (as `Action`) and `Logo` from the barrel, and a page,
 * loaded on demand, that takes `Dialog`.
 */
const app = () =>
	graph({
		[BUTTON_CSS]: { importers: [BUTTON] },
		[CX]: { exports: ['cx'], importers: [BUTTON, DIALOG] },
		[ENTRY]: { importedIds: [APP], isEntry: true },
		[HELPER]: { importers: [LOGO] },
		[STYLES]: { importers: [UI_BARREL] },
		[APP]: {
			code: "import { Button as Action, Logo } from '#libs/ui-core';",
			importedIds: [UI_BARREL],
			importers: [ENTRY],
		},
		[BUTTON]: {
			exports: ['Button'],
			importedIds: [BUTTON_CSS, CX],
			importers: [UI_BARREL],
		},
		[DIALOG]: {
			exports: ['Dialog'],
			importedIds: [CX],
			importers: [UI_BARREL],
		},
		[LOGO]: {
			exports: ['Logo'],
			importedIds: [HELPER],
			importers: [UI_BARREL],
		},
		[PAGE]: {
			code: "import { Dialog } from '#libs/ui-core';",
			importedIds: [UI_BARREL],
		},
		[UI_BARREL]: {
			importedIds: [STYLES, BUTTON, DIALOG, LOGO],
			importers: [APP, PAGE],
		},
	});

describe(kitShell, () => {
	test('takes what the modules loaded with the entry take from the barrel, and what that imports', () => {
		expect(kitShell(app())).toStrictEqual(
			new Set([BUTTON, BUTTON_CSS, CX, HELPER, LOGO, STYLES, UI_BARREL]),
		);
	});

	test('leaves what only a page loaded on demand takes', () => {
		expect(kitShell(app())?.has(DIALOG)).toBe(false);
	});

	test('works the shell out once for a build', () => {
		const context = app();

		expect(kitShell(context)).toBe(kitShell(context));
	});

	test('has no shell for a build without the barrel of the kit', () => {
		expect(kitShell(graph({ [ENTRY]: { isEntry: true } }))).toBeUndefined();
	});

	test('follows the kit and Vite’s helper alone, each module once, and what the graph knows', () => {
		const REACT = '/repo/node_modules/react/index.js';
		const UNKNOWN = `${KIT}/components/gone/Gone.tsx`;
		const LOOP = '/repo/src/app/loop.ts';

		const shell = kitShell(
			graph({
				[CX]: { importedIds: [BUTTON], importers: [BUTTON] },
				[DIALOG]: { exports: ['Dialog'], importers: [UI_BARREL] },
				[ENTRY]: { importedIds: [APP], isEntry: true },
				// a module loaded with the entry whose code the graph does not have
				[PAGE]: { code: null, importers: [ENTRY] },
				[REACT]: { importers: [BUTTON] },
				[APP]: {
					code: "export { Button } from '#libs/ui-core';",
					importedIds: [UI_BARREL],
					importers: [ENTRY],
				},
				// Button imports react, cx, and cx imports Button back
				[BUTTON]: {
					exports: ['Button'],
					importedIds: [REACT, CX, UNKNOWN],
					importers: [UI_BARREL, CX],
				},
				// a module of the app in a cycle of imports that never reaches the entry
				[LOOP]: {
					code: "import { Dialog } from '#libs/ui-core';",
					importedIds: [UI_BARREL],
					importers: [LOOP, '/repo/src/app/missing.ts'],
				},
				[UI_BARREL]: {
					importedIds: [BUTTON, DIALOG, UNKNOWN],
					importers: [APP, LOOP, PAGE],
				},
			}),
		);

		expect(shell).toStrictEqual(new Set([BUTTON, CX, UI_BARREL, UNKNOWN]));
	});
});
