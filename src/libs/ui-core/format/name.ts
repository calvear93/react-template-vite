import { getLocale } from './locale.ts';

const PARTICLES = new Set([
	'da',
	'de',
	'del',
	'la',
	'las',
	'los',
	'van',
	'von',
	'y',
]);

const isParticle = (word: string) => PARTICLES.has(word.toLowerCase());

const words = (text: string | null | undefined) =>
	(text ?? '').trim().split(/\s+/u).filter(Boolean);

/**
 * The words of a name, with particles joined to the word after them:
 * "Pérez de la Fuente" → ["Pérez", "de la Fuente"].
 */
const nameParts = (text: string | null | undefined) => {
	const parts: string[] = [];
	let pending: string[] = [];

	for (const word of words(text)) {
		if (isParticle(word)) {
			pending.push(word.toLowerCase());
		} else {
			parts.push([...pending, word].join(' '));
			pending = [];
		}
	}

	if (pending.length > 0) parts.push(pending.join(' '));

	return parts;
};

/** "ANA" → "Ana"; mixed case is left alone; particles stay lowercase. */
const capitalize = (part: string) =>
	part
		.split(' ')
		.map((word) => {
			if (isParticle(word)) return word.toLowerCase();

			return word === word.toUpperCase() && word.length > 1
				? word[0] + word.slice(1).toLowerCase()
				: word;
		})
		.join(' ');

/** Whether a language writes two surnames after the given names, the father's first. */
const hasTwoSurnames = (locale: string) =>
	new Intl.Locale(locale).language === 'es';

const givenAndSurname = (name: string, locale: string) => {
	if (name.includes(',')) {
		// "Pérez Soto, Ana María": the format of a directory
		const [surnames, names] = name.split(',', 2);

		return [nameParts(names)[0], nameParts(surnames)[0]];
	}

	const parts = nameParts(name);

	// one surname, the last word of the name: "John Ronald Tolkien"
	if (!hasTwoSurnames(locale)) return [parts[0], ...parts.slice(1).slice(-1)];

	if (parts.length >= 4) return [parts[0], parts[2]];

	return parts.length === 3 ? [parts[0], parts[1]] : parts;
};

/**
 * First given name and first surname, so no screen shows a full name. Which word is the
 * surname depends on the language: the last one, or in Spanish the first of the two a name
 * ends with.
 *
 * @example
 * ```ts
 * shortName('John Ronald Tolkien'); // 'John Tolkien'
 * shortName('Tolkien, John Ronald'); // 'John Tolkien'
 * shortName('Ana María Pérez Soto', {}, 'es-CL'); // 'Ana Pérez'
 * shortName('JUAN PABLO DE LA CRUZ SOTO', {}, 'es-CL'); // 'Juan de la Cruz'
 * shortName('', { given: 'Ana María', surname: 'Pérez Soto' }); // 'Ana Pérez'
 * ```
 *
 * @param name - the full name, in either order
 * @param known - the given name and the surname when they are known apart: they win over parsing
 * @param locale - the locale (default: the current one)
 *
 * @returns the short name, or '' without a name
 */
export const shortName = (
	name: string | null | undefined,
	{ given, surname }: { given?: string; surname?: string } = {},
	locale: string = getLocale(),
) => {
	const parts =
		given || surname
			? [nameParts(given)[0], nameParts(surname)[0]]
			: givenAndSurname((name ?? '').trim(), locale);

	return parts
		.filter((part) => part !== undefined)
		.map((part) => capitalize(part))
		.join(' ');
};

/**
 * Up to two initials, particles skipped.
 *
 * @example
 * ```ts
 * initials('Juan de la Cruz'); // 'JC'
 * ```
 *
 * @param name - a person's name
 *
 * @returns the initials in uppercase, or '?' without a name
 */
export const initials = (name: string | null | undefined) =>
	words(name)
		.filter((word) => !isParticle(word))
		.slice(0, 2)
		.map((word) => word[0].toUpperCase())
		.join('') || '?';
