import { describe, expect, test } from 'vitest';
import { paginationWindow } from './pagination-window.ts';

describe(paginationWindow, () => {
	test.each([
		{ expected: [1], page: 1, pages: 1 },
		{ expected: [1, 2, 3], page: 2, pages: 3 },
		{ expected: [1, 2, null, 9], page: 1, pages: 9 },
		{ expected: [1, 2, 3, null, 9], page: 2, pages: 9 },
		{ expected: [1, null, 4, 5, 6, null, 9], page: 5, pages: 9 },
		{ expected: [1, null, 7, 8, 9], page: 8, pages: 9 },
		{ expected: [1, null, 8, 9], page: 9, pages: 9 },
		{ expected: [1, 2, 3, 4], page: 3, pages: 4 },
	])(
		'shows $expected for page $page of $pages',
		({ expected, page, pages }) => {
			expect(paginationWindow(page, pages)).toStrictEqual(expected);
		},
	);
});
