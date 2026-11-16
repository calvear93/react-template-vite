import { describe, expect, test } from 'vitest';
import {
	filterOptions,
	firstEnabled,
	flattenOptions,
	foldedLabel,
	isGroup,
	type ListItem,
} from './listbox.model.ts';

const ARICA = { label: 'Arica', value: 'arica' };
const IQUIQUE = { label: 'Iquique', value: 'iquique' };
const NUNOA = { label: 'Ñuñoa', value: 'nunoa' };
const SAN_JOSE = { disabled: true, label: 'San José de Maipo', value: 'sjm' };
const OTHER = { label: 'Otra comuna', value: 'other' };

const ITEMS: ListItem[] = [
	{ label: 'Norte', options: [ARICA, IQUIQUE] },
	{ label: 'Metropolitana', options: [NUNOA, SAN_JOSE] },
	OTHER,
];

const labels = (items: readonly ListItem[]) =>
	flattenOptions(items).map((option) => option.label);

describe(isGroup, () => {
	test('tells a group from an option', () => {
		expect(ITEMS.map(isGroup)).toStrictEqual([true, true, false]);
	});
});

describe(flattenOptions, () => {
	test('lists every option in the order shown, groups opened', () => {
		expect(flattenOptions(ITEMS)).toStrictEqual([
			ARICA,
			IQUIQUE,
			NUNOA,
			SAN_JOSE,
			OTHER,
		]);
	});

	test('has nothing for an empty list', () => {
		expect(flattenOptions([])).toStrictEqual([]);
	});
});

describe(filterOptions, () => {
	test.each(['', '   '])('keeps the list as it is for «%s»', (query) => {
		expect(filterOptions(ITEMS, query)).toBe(ITEMS);
	});

	test.each([
		['nunoa', ['Ñuñoa']],
		['ÑUÑ', ['Ñuñoa']],
		['jose san', ['San José de Maipo']],
		['i', ['Arica', 'Iquique', 'San José de Maipo']],
		['otra', ['Otra comuna']],
		['zzz', []],
	])(
		'finds «%s» whatever its accents, case or word order',
		(query, found) => {
			expect(labels(filterOptions(ITEMS, query))).toStrictEqual(found);
		},
	);

	test('keeps a group, with what is left of it, only while it has a match', () => {
		expect(filterOptions(ITEMS, 'ari')).toStrictEqual([
			{ label: 'Norte', options: [ARICA] },
		]);
	});

	test('finds a label whose accents are written as a letter and its mark', () => {
		const decomposed = { label: 'N\u0303un\u0303oa', value: 'nunoa' };

		expect(filterOptions([decomposed, OTHER], 'nuno')).toStrictEqual([
			decomposed,
		]);
	});

	test('keeps a disabled option as it is', () => {
		expect(flattenOptions(filterOptions(ITEMS, 'maipo'))).toStrictEqual([
			SAN_JOSE,
		]);
	});
});

describe(foldedLabel, () => {
	test('gives the label of an option without accents and in lower case', () => {
		expect(foldedLabel(NUNOA)).toBe('nunoa');
		expect(foldedLabel(SAN_JOSE)).toBe('san jose de maipo');
	});

	test('gives the same the second time, and folds again a label that changed', () => {
		const option = { label: 'Maipú', value: 'maipu' };

		expect(foldedLabel(option)).toBe('maipu');
		expect(foldedLabel(option)).toBe('maipu');

		option.label = 'Peñalolén';

		expect(foldedLabel(option)).toBe('penalolen');
	});
});

describe(firstEnabled, () => {
	test('gives the place of the first option that can be picked', () => {
		expect(firstEnabled([SAN_JOSE, NUNOA, ARICA])).toBe(1);
		expect(firstEnabled([ARICA])).toBe(0);
	});

	test('gives -1 when none can be', () => {
		expect(firstEnabled([SAN_JOSE])).toBe(-1);
		expect(firstEnabled([])).toBe(-1);
	});
});
