import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SRC = join(__dirname, '../public/icons/logo.svg');
const OUT = join(__dirname, '../public/icons');

const ICONS = [
	{ file: 'favicon-16x16.png', size: 16 },
	{ file: 'favicon-32x32.png', size: 32 },
	{ file: 'apple-touch-icon.png', size: 180 },
	{ file: 'android-icon-36x36.png', size: 36 },
	{ file: 'android-icon-48x48.png', size: 48 },
	{ file: 'android-icon-72x72.png', size: 72 },
	{ file: 'android-icon-96x96.png', size: 96 },
	{ file: 'android-icon-144x144.png', size: 144 },
	{ file: 'android-icon-192x192.png', size: 192 },
	{ file: 'android-icon-512x512.png', size: 512 },
];

for (const { file, size } of ICONS) {
	await sharp(SRC).resize(size, size).png().toFile(join(OUT, file));
	console.log(`✓ ${file}`);
}

// favicon.ico — modern browsers accept PNG content inside .ico
await sharp(SRC).resize(32, 32).png().toFile(join(OUT, 'favicon.ico'));
console.log('✓ favicon.ico');
