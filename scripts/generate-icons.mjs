/**
 * Generates the app icon set from `public/icons/logo.svg` and keeps the
 * `site.webmanifest` icons array and the `index.html` favicon links in sync.
 *
 * The `ICONS` spec below is the single source of truth: every output file, its
 * manifest entry and the HTML `<link>` tags are derived from it. Re-running the
 * script is idempotent.
 *
 * Best practices applied:
 * - `fit: 'contain'` so the landscape logo is letterboxed, never cropped/distorted.
 * - High `density` so the SVG rasterizes crisply before downscaling.
 * - Separate `any` (full-bleed, transparent) and `maskable` (safe-zone padded,
 *   opaque background) icons, per the Lighthouse maskable-icon audit.
 * - Opaque background for Apple/maskable icons (iOS composites alpha onto black).
 */
import { copyFile, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SRC = join(__dirname, '../public/icons/logo.svg');
const OUT = join(__dirname, '../public/icons');
const MANIFEST = join(__dirname, '../public/site.webmanifest');
const HTML = join(__dirname, '../index.html');

// SVG render resolution (DPI). High value keeps large PNGs sharp before downscale.
const DENSITY = 384;
const TRANSPARENT = { r: 0, g: 0, b: 0, alpha: 0 };
// Per-side padding fractions. Maskable content must sit inside the central
// 40%-radius safe circle; 20% per side keeps the landscape logo comfortably inside.
const MASKABLE_PADDING = 0.2;
const APPLE_PADDING = 0.12;

const manifestRaw = await readFile(MANIFEST, 'utf8');
const manifest = JSON.parse(manifestRaw);
const BACKGROUND = manifest.background_color ?? '#ffffff';

/** Detects the dominant line ending so partial rewrites preserve the file's EOL. */
const eolOf = (text) => (text.includes('\r\n') ? '\r\n' : '\n');

/**
 * Declarative icon set. `manifest` (when present) describes the entry added to
 * the web manifest `icons` array; `background` makes the icon opaque.
 */
const ICONS = [
	{
		file: 'favicon.ico',
		size: 48,
		manifest: { sizes: '48x48', type: 'image/x-icon' },
	},
	{
		file: 'apple-touch-icon.png',
		size: 180,
		padding: APPLE_PADDING,
		background: BACKGROUND,
	},
	{
		file: 'icon-192.png',
		size: 192,
		manifest: { sizes: '192x192', type: 'image/png', purpose: 'any' },
	},
	{
		file: 'icon-512.png',
		size: 512,
		manifest: { sizes: '512x512', type: 'image/png', purpose: 'any' },
	},
	{
		file: 'icon-maskable-192.png',
		size: 192,
		padding: MASKABLE_PADDING,
		background: BACKGROUND,
		manifest: { sizes: '192x192', type: 'image/png', purpose: 'maskable' },
	},
	{
		file: 'icon-maskable-512.png',
		size: 512,
		padding: MASKABLE_PADDING,
		background: BACKGROUND,
		manifest: { sizes: '512x512', type: 'image/png', purpose: 'maskable' },
	},
];

/**
 * Renders a single square icon: the logo is fit (contained) into a centered box,
 * padded out to the target size, and flattened onto an opaque background when one
 * is provided.
 */
const renderIcon = async ({ file, size, padding = 0, background = null }) => {
	const inner = Math.round(size * (1 - 2 * padding));
	const pad = size - inner;
	const before = Math.floor(pad / 2);
	const after = pad - before;
	// `contain` only fills the letterbox; the logo's own transparency is composited
	// onto `background` by `flatten`. Both must use the opaque fill to stay opaque.
	const fill = background ?? TRANSPARENT;

	let pipeline = sharp(SRC, { density: DENSITY }).resize(inner, inner, {
		fit: 'contain',
		background: fill,
	});

	if (pad > 0) {
		pipeline = pipeline.extend({
			top: before,
			bottom: after,
			left: before,
			right: after,
			background: fill,
		});
	}

	if (background) {
		pipeline = pipeline.flatten({ background });
	}

	await pipeline.png().toFile(join(OUT, file));
	console.log(`✓ ${file}`);
};

/** Rewrites the manifest `icons` array (and ensures a stable `id`) from the spec. */
const updateManifest = async () => {
	manifest.id ??= '.';
	manifest.icons = ICONS.filter((icon) => icon.manifest).map((icon) => ({
		src: `icons/${icon.file}`,
		...icon.manifest,
	}));

	const eol = eolOf(manifestRaw);
	const json = JSON.stringify(manifest, null, '\t').replaceAll('\n', eol);
	await writeFile(MANIFEST, `${json}${eol}`);
	console.log('✓ site.webmanifest');
};

/** Regenerates the favicon `<link>` block in index.html between its markers. */
const updateHtml = async () => {
	const links = [
		'<link rel="icon" href="/icons/favicon.ico" sizes="48x48" />',
		'<link rel="icon" href="/icons/favicon.svg" type="image/svg+xml" />',
		'<link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />',
	];
	const markers =
		/([ \t]*<!-- favicons:start -->)[\s\S]*?([ \t]*<!-- favicons:end -->)/u;

	const html = await readFile(HTML, 'utf8');

	if (!markers.test(html)) {
		console.warn(
			'⚠ favicons markers not found in index.html — skipping HTML update',
		);
		return;
	}

	const eol = eolOf(html);
	const block = links.map((link) => `\t\t${link}`).join(eol);
	await writeFile(HTML, html.replace(markers, `$1${eol}${block}${eol}$2`));
	console.log('✓ index.html');
};

for (const icon of ICONS) {
	await renderIcon(icon);
}

await copyFile(SRC, join(OUT, 'favicon.svg'));
console.log('✓ favicon.svg');

await updateManifest();
await updateHtml();
