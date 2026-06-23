/**
 * Generates the app icon set declared in `public/site.webmanifest` and keeps the
 * `index.html` favicon links in sync with it.
 *
 * `site.webmanifest` is the single source of truth: it lists every icon
 * (`src`, `sizes`, `type`, `purpose`) and this script only consumes it — it never
 * writes it. Each icon's render rules are derived from its entry:
 * - `image/svg+xml`      → the source SVG is copied verbatim (scalable favicon).
 * - `purpose: maskable`  → opaque background + safe-zone padding (Lighthouse audit).
 * - `apple-touch-icon.*` → opaque background + light padding (iOS has no alpha).
 * - everything else      → transparent, full-bleed.
 *
 * Quality: `fit: 'contain'` never crops/distorts and a high `density` keeps large
 * PNGs crisp before downscaling.
 */
import { copyFile, readFile, writeFile } from 'node:fs/promises';
import { basename, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const SOURCE = join(ROOT, 'public/icons/logo.svg');
const PUBLIC = join(ROOT, 'public');
const MANIFEST = join(PUBLIC, 'site.webmanifest');
const HTML = join(ROOT, 'index.html');

// render density (DPI) for the SVG; higher keeps large PNGs sharp on downscale.
const DENSITY = 384;
const TRANSPARENT = { alpha: 0, b: 0, g: 0, r: 0 };
// per-side padding fractions; maskable content must sit inside the central
// 40%-radius safe circle, so 20% per side keeps the landscape logo well inside.
const MASKABLE_PADDING = 0.2;
const APPLE_PADDING = 0.12;

const manifest = JSON.parse(await readFile(MANIFEST, 'utf8'));
const BACKGROUND = manifest.background_color ?? '#ffffff';

/** Detects the dominant line ending so partial rewrites preserve the file's EOL. */
const eolOf = (text) => (text.includes('\r\n') ? '\r\n' : '\n');

const isApple = (src) => basename(src).startsWith('apple-touch-icon');
const isMaskable = (purpose) => (purpose ?? '').split(' ').includes('maskable');
const largestSize = (sizes) =>
	Math.max(...sizes.split(' ').map((size) => Number.parseInt(size, 10)));

/** Maps a manifest icon to its raster options (opaqueness + padding derived from intent). */
const optionsFor = ({ purpose, src }) => {
	if (isMaskable(purpose)) {
		return { background: BACKGROUND, padding: MASKABLE_PADDING };
	}
	if (isApple(src)) {
		return { background: BACKGROUND, padding: APPLE_PADDING };
	}
	return { background: null, padding: 0 };
};

/**
 * Renders a single square icon: the logo is fit (contained) into a centered box,
 * padded out to the target size, and flattened onto an opaque background when one
 * is provided.
 */
const renderIcon = async ({ background, out, padding, size }) => {
	const inner = Math.round(size * (1 - 2 * padding));
	const pad = size - inner;
	const before = Math.floor(pad / 2);
	const after = pad - before;
	// `contain` only fills the letterbox; the logo's own transparency is composited
	// onto `background` by `flatten`. Both must use the opaque fill to stay opaque.
	const fill = background ?? TRANSPARENT;

	let pipeline = sharp(SOURCE, { density: DENSITY }).resize(inner, inner, {
		background: fill,
		fit: 'contain',
	});

	if (pad > 0) {
		pipeline = pipeline.extend({
			background: fill,
			bottom: after,
			left: before,
			right: after,
			top: before,
		});
	}

	if (background) {
		pipeline = pipeline.flatten({ background });
	}

	await pipeline.png().toFile(out);
};

/** Generates every icon file declared in the manifest. */
const generateIcons = async () => {
	for (const icon of manifest.icons) {
		const out = join(PUBLIC, icon.src);

		if (icon.type === 'image/svg+xml') {
			await copyFile(SOURCE, out);
		} else {
			await renderIcon({
				...optionsFor(icon),
				out,
				size: largestSize(icon.sizes),
			});
		}

		console.info(`✓ ${basename(icon.src)}`);
	}
};

/** Derives the favicon `<link>` for a manifest icon, or null if it is manifest-only. */
const linkFor = ({ sizes, src, type }) => {
	const href = `/${src}`;
	if (type === 'image/x-icon') {
		return `<link rel="icon" href="${href}" sizes="${sizes}" />`;
	}
	if (type === 'image/svg+xml') {
		return `<link rel="icon" href="${href}" type="image/svg+xml" />`;
	}
	if (isApple(src)) {
		return `<link rel="apple-touch-icon" href="${href}" />`;
	}
	return null;
};

/** Regenerates the favicon `<link>` block in index.html from the manifest. */
const updateHtml = async () => {
	const start = '<!-- favicons:start -->';
	const end = '<!-- favicons:end -->';
	const links = manifest.icons.map(linkFor).filter(Boolean);

	const html = await readFile(HTML, 'utf8');
	const startIndex = html.indexOf(start);
	const endIndex = html.indexOf(end);

	if (startIndex === -1 || endIndex === -1) {
		console.warn(
			'⚠ favicons markers not found in index.html — skipping HTML update',
		);
		return;
	}

	const eol = eolOf(html);
	// keep the markers and their indentation; rewrite only the block between them.
	const head = html.slice(0, startIndex + start.length);
	const tail = html.slice(html.lastIndexOf('\n', endIndex) + 1);
	const block = links.map((link) => `${eol}\t\t${link}`).join('');

	await writeFile(HTML, `${head}${block}${eol}${tail}`);
	console.info('✓ index.html');
};

await generateIcons();
await updateHtml();
