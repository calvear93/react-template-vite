import { describe, expect, test } from 'vitest';
import { defined } from './defined.ts';

describe(defined, () => {
	test('leaves out what was given as undefined, and keeps the rest as it is', () => {
		const say = () => 'dicho';

		expect(
			defined({
				empty: '',
				max: undefined,
				min: say,
				none: null,
				zero: 0,
			}),
		).toStrictEqual({ empty: '', min: say, none: null, zero: 0 });
	});

	test('has nothing when it is given nothing', () => {
		expect(defined(undefined)).toStrictEqual({});
		expect(defined({})).toStrictEqual({});
	});

	test('lets the texts of a component stay where none is given', () => {
		const LABELS = { close: 'Cerrar', open: 'Abrir' };
		const labels: Partial<typeof LABELS> = {
			close: undefined,
			open: 'Ver',
		};

		expect({ ...LABELS, ...defined(labels) }).toStrictEqual({
			close: 'Cerrar',
			open: 'Ver',
		});
		// the mistake it is there for
		expect({ ...LABELS, ...labels }.close).toBeUndefined();
	});
});
