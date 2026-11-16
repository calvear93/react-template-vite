/**
 * The pages to show around the current one: the first, the last, the current and
 * its neighbours, with `null` where pages are skipped.
 *
 * @example
 * ```ts
 * paginationWindow(5, 9); // [1, null, 4, 5, 6, null, 9]
 * ```
 *
 * @param page - the current page, from 1
 * @param pages - how many pages there are
 *
 * @returns page numbers in order, and null for each elision
 */
export const paginationWindow = (page: number, pages: number) => {
	const shown = [...new Set([1, page, page + 1, page - 1, pages])]
		.filter((number) => number >= 1 && number <= pages)
		.toSorted((a, b) => a - b);

	return shown.flatMap((number, index) =>
		index > 0 && number - shown[index - 1] > 1 ? [null, number] : [number],
	);
};
