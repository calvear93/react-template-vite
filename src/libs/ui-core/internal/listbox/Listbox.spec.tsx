import { cleanup, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, test, vi } from 'vitest';
import { highlightParts } from '../highlight-parts.ts';
import { Listbox } from './Listbox.tsx';

// every option draws its label through highlightParts: its calls count the options drawn
vi.mock(import('../highlight-parts.ts'), async (original) => {
	const actual = await original();

	return { ...actual, highlightParts: vi.fn(actual.highlightParts) };
});

const OPTIONS = Array.from({ length: 30 }, (_, index) => ({
	label: `Comuna ${index}`,
	value: `c${index}`,
}));

const drawn = () => vi.mocked(highlightParts).mock.calls.map(([text]) => text);

afterEach(() => {
	cleanup();
	vi.mocked(highlightParts).mockClear();
});

describe(Listbox, () => {
	test('draws every option, the one the keys are on and the selected ones marked', () => {
		render(
			<Listbox
				active={1}
				aria-label='Comunas'
				id='list'
				items={OPTIONS}
				values={['c2']}
			/>,
		);

		const options = screen.getAllByRole('option');

		expect(options).toHaveLength(30);
		expect(options[1]).toHaveAttribute('data-active');
		expect(options[1]).toHaveAttribute('id', 'list-1');
		expect(options[2]).toHaveAttribute('aria-selected', 'true');
		expect(options[1]).toHaveAttribute('aria-selected', 'false');
	});

	test('draws again only the two options the keys move between', () => {
		const { rerender } = render(
			<Listbox active={3} id='list' items={OPTIONS} values={[]} />,
		);

		expect(drawn()).toHaveLength(30);

		vi.mocked(highlightParts).mockClear();
		rerender(<Listbox active={4} id='list' items={OPTIONS} values={[]} />);

		expect(drawn()).toStrictEqual(['Comuna 3', 'Comuna 4']);
		expect(screen.getAllByRole('option')[4]).toHaveAttribute('data-active');
		expect(screen.getAllByRole('option')[3]).not.toHaveAttribute(
			'data-active',
		);
	});

	test('draws again only the option whose selection changes', () => {
		const { rerender } = render(
			<Listbox
				active={-1}
				id='list'
				items={OPTIONS}
				multiple
				values={['c1']}
			/>,
		);

		vi.mocked(highlightParts).mockClear();
		rerender(
			<Listbox
				active={-1}
				id='list'
				items={OPTIONS}
				multiple
				values={['c1', 'c7']}
			/>,
		);

		expect(drawn()).toStrictEqual(['Comuna 7']);
		expect(screen.getAllByRole('option')[7]).toHaveAttribute(
			'aria-selected',
			'true',
		);
	});

	test('draws every option again when what is searched changes', () => {
		const { rerender } = render(
			<Listbox active={0} id='list' items={OPTIONS} values={[]} />,
		);

		vi.mocked(highlightParts).mockClear();
		rerender(
			<Listbox
				active={0}
				id='list'
				items={OPTIONS}
				query='comuna 2'
				values={[]}
			/>,
		);

		expect(drawn()).toHaveLength(30);
		expect(
			within(screen.getAllByRole('option')[2] as HTMLElement).getByText(
				'Comuna',
				{ selector: 'mark' },
			),
		).toBeInTheDocument();
	});
});
