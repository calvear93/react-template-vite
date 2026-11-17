import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { type Plugin, type Rolldown, type UserConfig } from 'vite';
import { describe, expect, test, vi } from 'vitest';
import { UI_BARREL, UI_LAYERS_SHEET } from './kit.paths.ts';
import {
	kitChunks,
	kitLayers,
	kitOnDemand,
	readLayers,
	uiCore,
} from './ui-core.plugin.ts';

const KIT = dirname(UI_BARREL);
const LAYERS = '@layer reset, ui.tokens, ui.base, ui.components;';

const QUESTION = `${KIT}/components/alert-dialog/Question.tsx`;
const PROVIDER = `${KIT}/components/alert-dialog/Dialogs.provider.tsx`;
const PANES = `${KIT}/components/settings-dialog/settings.panes.tsx`;
const WINDOW = `${KIT}/components/settings-dialog/SettingsWindow.tsx`;
const BUTTON = `${KIT}/components/button/Button.tsx`;
const NEW_PART = `${KIT}/components/report/ReportWindow.tsx`;

/** Calls a hook of a plugin the way the bundler does, with what it is given. */
const call = <Args extends unknown[]>(
	hook: Plugin[keyof Plugin],
	context: unknown,
	...args: Args
) => {
	const handler =
		typeof hook === 'function'
			? hook
			: (hook as { handler: (...rest: unknown[]) => unknown }).handler;

	return (handler as (...rest: unknown[]) => unknown).apply(context, args);
};

/** The context of a build: its modules, and the error that stops it. */
const build = (modules: Record<string, Partial<Rolldown.ModuleInfo>>) => ({
	error: vi.fn((message: string) => {
		throw new Error(message);
	}),
	getModuleIds: () => Object.keys(modules)[Symbol.iterator](),
	getModuleInfo: (id: string) =>
		id in modules
			? { dynamicImporters: [], importers: [], ...modules[id] }
			: null,
});

describe(readLayers, () => {
	test('reads the statement that orders the layers of the kit', () => {
		expect(readLayers(UI_LAYERS_SHEET)).toBe(LAYERS);
	});

	test('names the stylesheet that has no such statement', () => {
		const sheet = join(mkdtempSync(join(tmpdir(), 'kit-')), 'app.css');

		writeFileSync(sheet, '.page { color: red; }');

		expect(() => readLayers(sheet)).toThrow(
			`${sheet} must declare the order of its cascade layers in one @layer statement`,
		);
	});
});

describe(kitLayers, () => {
	const transform = (code: string, id: string) =>
		call(kitLayers(LAYERS).transform, {}, code, id);

	test('says the order of the layers at the top of a stylesheet of the kit', () => {
		expect(
			transform(
				'.root { color: red; }',
				`${KIT}/components/button/Button.module.css`,
			),
		).toStrictEqual({ code: `${LAYERS}.root { color: red; }`, map: null });
	});

	test('says it once: not in a stylesheet that already does', () => {
		expect(
			transform(`${LAYERS}\n.page {}`, `${KIT}/styles/index.css`),
		).toBeNull();
	});

	test('leaves the stylesheets of the app and the code of the kit as they are', () => {
		expect(
			transform('.page {}', '/repo/src/app/styles/app.css'),
		).toBeNull();
		expect(transform('export {};', BUTTON)).toBeNull();
	});
});

describe(kitOnDemand, () => {
	const check = (modules: Record<string, Partial<Rolldown.ModuleInfo>>) => {
		const context = build(modules);

		call(kitOnDemand().buildEnd, context);

		return context;
	};

	test('lets the build go on when the list has every module of the parts', () => {
		const context = check({
			[BUTTON]: { importers: [PROVIDER, WINDOW] },
			[PANES]: { importers: [WINDOW] },
			[PROVIDER]: {},
			[QUESTION]: { dynamicImporters: [PROVIDER] },
		});

		expect(context.error).not.toHaveBeenCalled();
	});

	test('stops it for a part loaded on demand that the list misses', () => {
		expect(() =>
			check({
				[NEW_PART]: { dynamicImporters: [PROVIDER] },
				[PROVIDER]: {},
			}),
		).toThrow(
			'loaded on demand but not in UI_ON_DEMAND (src/libs/ui-core/vite/on-demand.modules.ts): components/report/ReportWindow.tsx',
		);
	});

	test('stops it for a module that only the modules of the list import', () => {
		const pane = `${KIT}/components/settings-dialog/settings.report.tsx`;

		expect(() => check({ [pane]: { importers: [WINDOW, PANES] } })).toThrow(
			'components/settings-dialog/settings.report.tsx',
		);
	});

	test('does not look at a build that already failed', () => {
		const context = build({ [NEW_PART]: { dynamicImporters: [PROVIDER] } });

		call(kitOnDemand().buildEnd, context, new Error('another problem'));

		expect(context.error).not.toHaveBeenCalled();
	});
});

describe(kitChunks, () => {
	const config = () =>
		call(
			kitChunks().config,
			{},
			{},
			{ command: 'build', mode: 'dev' },
		) as UserConfig;
	const groups = () =>
		(
			config().build?.rolldownOptions?.output as {
				codeSplitting: { groups: Rolldown.CodeSplittingGroup[] };
			}
		).codeSplitting.groups;
	const rules = () =>
		config().build?.rolldownOptions?.treeshake as {
			moduleSideEffects: { sideEffects: boolean; test: RegExp }[];
		};
	/** Whether a module is taken as having side effects: the first rule that matches decides. */
	const hasSideEffects = (id: string) =>
		rules().moduleSideEffects.find((rule) => rule.test.test(id))
			?.sideEffects;

	test('adds three groups for the kit: what is on demand, the shell, what pages share', () => {
		expect(
			groups().map(({ minShareCount, name, priority }) => ({
				minShareCount,
				name: typeof name === 'function' ? 'by rule' : name,
				priority,
			})),
		).toStrictEqual([
			{
				minShareCount: undefined,
				name: 'ui-core-on-demand',
				priority: 30,
			},
			{ minShareCount: undefined, name: 'by rule', priority: 26 },
			{ minShareCount: 2, name: 'ui-core-pages', priority: 25 },
		]);
	});

	test('puts in the on-demand group the modules of the list alone', () => {
		const [onDemand] = groups();
		const test = onDemand.test as RegExp;

		expect(test.test(QUESTION)).toBe(true);
		expect(test.test(PANES)).toBe(true);
		expect(test.test(BUTTON)).toBe(false);
		expect(onDemand.includeDependenciesRecursively).toBe(false);
	});

	test('looks for the shell among the modules of the kit and Vite’s helper', () => {
		const [, shell] = groups();
		const test = shell.test as (id: string) => boolean;

		expect(test(BUTTON)).toBe(true);
		expect(test('\0vite/preload-helper.js')).toBe(true);
		expect(test('/repo/node_modules/react/index.js')).toBe(false);
	});

	test('names the shell «ui-core», and fails for a kit whose barrel is not in the build', () => {
		const [, shell] = groups();
		const name = shell.name as (
			id: string,
			context: Rolldown.ChunkingContext,
		) => string | null;
		const empty = {
			getModuleInfo: () => null,
		} as unknown as Rolldown.ChunkingContext;
		const withBarrel = {
			getModuleInfo: (id: string) =>
				id === UI_BARREL
					? {
							code: '',
							exports: [],
							importedIds: [],
							importers: [],
							isEntry: false,
						}
					: null,
		} as unknown as Rolldown.ChunkingContext;

		expect(name(UI_BARREL, withBarrel)).toBe('ui-core');
		expect(name(BUTTON, withBarrel)).toBeNull();
		expect(name('\0vite/preload-helper.js', empty)).toBeNull();
		expect(() => name(BUTTON, empty)).toThrow(
			`the barrel of the UI kit (${UI_BARREL}) is not in the build`,
		);
	});

	test('tells the bundler that only the barrel and the stylesheets of the kit have side effects', () => {
		expect(hasSideEffects(UI_BARREL)).toBe(true);
		expect(
			hasSideEffects(`${KIT}/components/button/Button.module.css`),
		).toBe(true);
		expect(hasSideEffects(BUTTON)).toBe(false);
	});

	test('leaves the side effects of the app as the bundler sees them, its stylesheets kept', () => {
		expect(hasSideEffects('/repo/src/app/styles/app.css?used')).toBe(true);
		expect(hasSideEffects('/repo/src/app/App.tsx')).toBeUndefined();
	});
});

describe(uiCore, () => {
	test('brings its chunks, its layers and its check, the layers before every other transform', () => {
		const plugins = uiCore() as Plugin[];

		expect(plugins.map(({ name }) => name)).toStrictEqual([
			'kit-chunks',
			'kit-layers',
			'kit-on-demand',
		]);
		expect(plugins[1].enforce).toBe('pre');
		expect(plugins[2].apply).toBe('build');
	});
});
