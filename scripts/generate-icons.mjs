/**
 * Generates the app icon set declared in `public/site.webmanifest` and keeps the
 * `index.html` favicon links in sync with it. The manifest is the single source
 * of truth — this script only reads it.
 *
 * The renderer respects the source SVG: it detects whether `logo.svg` is a solid
 * filled icon (e.g. a squircle) or a transparent symbol, and adapts:
 * - solid source       → full-bleed (resize only).
 * - transparent source → `any` stays transparent full-bleed; `maskable` gets
 *   safe-zone padding + opaque background; `apple-touch-icon` gets light padding +
 *   opaque background (iOS has no alpha). `image/svg+xml` entries copy the SVG.
 */
import { copyFile, readFile, writeFile } from 'node:fs/promises';
import { basename, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const PUBLIC = join(ROOT, 'public');
const SOURCE = join(PUBLIC, 'icons/logo.svg');
const MANIFEST = join(PUBLIC, 'site.webmanifest');
const HTML = join(ROOT, 'index.html');

// rasterize the source SVG at ~1536px so downscales to any icon size stay crisp;
// deriving density from the SVG's own size avoids sharp's pixel limit on huge SVGs.
const RASTER = 1536;
const { height, width } = await sharp(SOURCE).metadata();
const DENSITY = Math.max(
	1,
	Math.round((RASTER * 72) / Math.max(width ?? RASTER, height ?? RASTER)),
);
const TRANSPARENT = { alpha: 0, b: 0, g: 0, r: 0 };
// per-side padding fractions applied only to transparent symbols (not solid icons).
const MASKABLE_PADDING = 0.2;
const APPLE_PADDING = 0.12;
// opaque-pixel coverage above which the source SVG is treated as a solid icon.
const SOLID_COVERAGE = 0.6;

const manifest = JSON.parse(await readFile(MANIFEST, 'utf8'));
const BACKGROUND = manifest.background_color ?? '#ffffff';

const eolOf = (text) => (text.includes('\r\n') ? '\r\n' : '\n');
const isApple = (src) => basename(src).startsWith('apple-touch-icon');
const isMaskable = (purpose) => (purpose ?? '').split(' ').includes('maskable');
const largestSize = (sizes) =>
	Math.max(...sizes.split(' ').map((size) => Number.parseInt(size, 10)));

/** Detects whether the source SVG is a solid/filled icon vs a transparent symbol. */
const detectSolid = async () => {
	const size = 128;
	const { data } = await sharp(SOURCE, { density: DENSITY })
		.resize(size, size, { background: TRANSPARENT, fit: 'contain' })
		.ensureAlpha()
		.raw()
		.toBuffer({ resolveWithObject: true });

	let opaque = 0;
	for (let index = 3; index < data.length; index += 4) {
		if (data[index] > 250) {
			opaque += 1;
		}
	}

	return opaque / (size * size) >= SOLID_COVERAGE;
};

const SOLID = await detectSolid();

/**
 * Renders one square icon. A solid source is always full-bleed; a transparent
 * source gets safe-zone padding + an opaque background for maskable/apple icons.
 */
const renderIcon = async (icon, out) => {
	const size = largestSize(icon.sizes);
	let padding = 0;
	let opaque = false;

	if (!SOLID) {
		if (isMaskable(icon.purpose)) {
			padding = MASKABLE_PADDING;
			opaque = true;
		} else if (isApple(icon.src)) {
			padding = APPLE_PADDING;
			opaque = true;
		}
	}

	const fill = opaque ? BACKGROUND : TRANSPARENT;
	const inner = Math.round(size * (1 - 2 * padding));
	const pad = size - inner;
	const before = Math.floor(pad / 2);
	const after = pad - before;

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

	if (opaque) {
		pipeline = pipeline.flatten({ background: BACKGROUND });
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
			await renderIcon(icon, out);
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
