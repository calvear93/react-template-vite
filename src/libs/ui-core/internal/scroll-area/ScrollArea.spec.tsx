import { act, cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { mockResizeObserver } from '../../__mocks__/resize-observer.mock.ts';
import { ScrollArea } from './ScrollArea.tsx';

const TEXT = 'Contenido largo';

const area = () => screen.getByTestId('area');

/** What the layout would say: the content is this much wider and taller than its area. */
const overflowBy = (width: number, height = 0) => {
	vi.spyOn(area(), 'clientWidth', 'get').mockReturnValue(200);
	vi.spyOn(area(), 'scrollWidth', 'get').mockReturnValue(200 + width);
	vi.spyOn(area(), 'clientHeight', 'get').mockReturnValue(100);
	vi.spyOn(area(), 'scrollHeight', 'get').mockReturnValue(100 + height);
};

describe(ScrollArea, () => {
	let sizes: ReturnType<typeof mockResizeObserver>;

	// hooks
	beforeEach(() => {
		sizes = mockResizeObserver();
	});

	afterEach(() => {
		cleanup();
		sizes.restore();
		vi.restoreAllMocks();
	});

	// tests
	test('is a plain box while everything is in sight', () => {
		render(
			<ScrollArea aria-label='Tabla' className='extra' data-testid='area'>
				{TEXT}
			</ScrollArea>,
		);
		overflowBy(1);
		act(() => sizes.resize());

		expect(area()).toHaveTextContent(TEXT);
		expect(area()).toHaveClass('extra');
		expect(area()).not.toHaveAttribute('tabindex');
		expect(area()).not.toHaveAttribute('role');
	});

	test.each([
		{ height: 0, name: 'sideways', width: 40 },
		{ height: 40, name: 'down', width: 0 },
	])(
		'takes the focus as a named region while it scrolls $name',
		({ height, width }) => {
			render(
				<ScrollArea aria-label='Tabla' data-testid='area'>
					{TEXT}
				</ScrollArea>,
			);
			overflowBy(width, height);
			act(() => sizes.resize());

			expect(screen.getByRole('region', { name: 'Tabla' })).toBe(area());
			expect(area()).toHaveAttribute('tabindex', '0');

			overflowBy(0);
			act(() => sizes.resize());

			expect(area()).not.toHaveAttribute('tabindex');
		},
	);

	test('takes the focus without a role when it has no name', () => {
		render(<ScrollArea data-testid='area'>{TEXT}</ScrollArea>);
		overflowBy(0, 40);
		act(() => sizes.resize());

		expect(area()).toHaveAttribute('tabindex', '0');
		expect(area()).not.toHaveAttribute('role');
	});

	test('follows the content it gets later', async () => {
		const { rerender } = render(
			<ScrollArea data-testid='area'>
				<p>{TEXT}</p>
			</ScrollArea>,
		);

		rerender(
			<ScrollArea data-testid='area'>
				<p>{TEXT}</p>
				<p>Otro párrafo</p>
			</ScrollArea>,
		);
		// the content changed: it is watched again, and measured
		await act(async () => {
			await Promise.resolve();
		});
		overflowBy(0, 40);
		act(() => sizes.resize());

		expect(area()).toHaveAttribute('tabindex', '0');
	});

	test('stops watching when it leaves', () => {
		const { unmount } = render(<ScrollArea>{TEXT}</ScrollArea>);

		expect(sizes.count).toBe(1);

		unmount();

		expect(sizes.count).toBe(0);
	});

	test('stays a plain box where the browser cannot watch sizes', () => {
		vi.stubGlobal('ResizeObserver', undefined);
		render(<ScrollArea data-testid='area'>{TEXT}</ScrollArea>);

		expect(area()).not.toHaveAttribute('tabindex');
	});
});
