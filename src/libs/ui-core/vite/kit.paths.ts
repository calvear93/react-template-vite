import { resolve } from 'node:path';
import { normalizePath } from 'vite';

/** The folder of the kit, from this file: wherever the build is run from. */
const KIT_DIR = resolve(import.meta.dirname, '..');

/** The modules of the UI kit (#libs/ui-core). */
export const UI_KIT = /src\/libs\/ui-core\//u;

/** The barrel of the kit: what the app imports as `#libs/ui-core`. */
export const UI_BARREL = normalizePath(resolve(KIT_DIR, 'index.ts'));

/** The global stylesheet of the kit, which declares the order of its cascade layers. */
export const UI_LAYERS_SHEET = resolve(KIT_DIR, 'styles/index.css');

/** The stylesheets of the kit. */
export const UI_STYLESHEET = /src\/libs\/ui-core\/.*\.css(?:\?|$)/u;

/** The helper Vite puts wherever something is imported on demand. */
export const PRELOAD_HELPER = /vite\/preload-helper/u;

/** What a module takes from the kit, or hands on: the names between the braces. */
export const UI_IMPORTS =
	/(?:export|import)\s*\{(?<names>[^}]*)\}\s*from\s*["']#libs\/ui-core["']/gu;
