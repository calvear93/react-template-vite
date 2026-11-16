import { act, cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { ActionsSection } from './actions.section.tsx';

describe(ActionsSection, () => {
	// hooks
	beforeEach(() => {
		render(<ActionsSection />);
	});

	afterEach(() => {
		cleanup();
		vi.useRealTimers();
	});

	// tests
	test.each([
		'Button: variants',
		'Button: sizes and icons',
		'Button: states and links',
		'ButtonGroup and block',
		'Badge',
		'Chip',
		'Avatar and StatusDot',
		'SegmentedControl',
		'Waiting: Spinner, Skeleton and Progress',
	])('has the example “%s”', (title) => {
		expect(screen.getByRole('region', { name: title })).toBeInTheDocument();
	});

	test('shows a button busy while its action runs, then free again', async () => {
		vi.useFakeTimers({ shouldAdvanceTime: true });

		const button = screen.getByRole('button', {
			name: 'Record attempt',
		});

		await userEvent.click(button);

		expect(button).toHaveAttribute('aria-busy', 'true');

		await act(() => vi.advanceTimersByTimeAsync(1500));

		expect(button).not.toHaveAttribute('aria-busy');
	});

	test('removes a chip with its button and restores them all', async () => {
		const chips = within(screen.getByRole('region', { name: 'Chip' }));

		await userEvent.click(
			chips.getByRole('button', { name: 'Remove John Carter' }),
		);

		expect(chips.queryByText('John Carter')).not.toBeInTheDocument();

		await userEvent.click(
			chips.getByRole('button', { name: 'Remove Reset' }),
		);

		expect(chips.getByText('John Carter')).toBeInTheDocument();
	});

	test('names its progress bars and its group of buttons', () => {
		expect(
			screen.getByRole('progressbar', { name: 'Documents uploaded' }),
		).toHaveValue(3);
		expect(screen.getByRole('group', { name: 'View' })).toBeInTheDocument();
	});

	test('changes the view from the segmented control', async () => {
		const example = within(
			screen.getByRole('region', { name: 'SegmentedControl' }),
		);

		expect(example.getByText('Shown as a table')).toBeInTheDocument();
		expect(example.getByRole('radio', { name: 'Quarter' })).toBeChecked();

		await userEvent.click(example.getByRole('radio', { name: 'Cards' }));

		expect(example.getByText('Shown as cards')).toBeInTheDocument();
	});
});
