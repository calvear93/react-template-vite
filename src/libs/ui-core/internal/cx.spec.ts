import { describe, expect, test } from 'vitest';
import { cx } from './cx.ts';

describe(cx, () => {
	test('joins the class names and skips what is not one', () => {
		expect(cx('a', false, null, undefined, '', 'b')).toBe('a b');
	});

	test('is undefined when nothing is left, so no empty attribute is written', () => {
		expect(cx(false, undefined)).toBeUndefined();
	});
});
