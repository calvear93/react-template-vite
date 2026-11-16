import { act, cleanup, render, screen } from '@testing-library/react';
import { useRef } from 'react';
import { afterEach, describe, expect, test } from 'vitest';
import { mockAnimations } from '../__mocks__/animations.mock.ts';
import { usePresence } from './use-presence.hook.ts';

const Panel = ({ open }: { open: boolean }) => {
	const panel = useRef<HTMLDivElement>(null);
	const { isLeaving, isPresent } = usePresence(open, panel);

	if (!isPresent) return null;

	return (
		<div data-leaving={isLeaving || undefined} ref={panel}>
			Panel
		</div>
	);
};

const panel = () => screen.queryByText('Panel');

describe(usePresence, () => {
	// hooks
	afterEach(cleanup);

	// tests
	test('renders what is open, and nothing while it never was', () => {
		const { rerender } = render(<Panel open={false} />);

		expect(panel()).not.toBeInTheDocument();

		rerender(<Panel open />);

		expect(panel()).toBeInTheDocument();
		expect(panel()).not.toHaveAttribute('data-leaving');
	});

	test('takes away at once what closes with no animation', () => {
		const { rerender } = render(<Panel open />);

		rerender(<Panel open={false} />);

		expect(panel()).not.toBeInTheDocument();
	});

	test('keeps what closes, marked as leaving, until its animation ends', async () => {
		const animations = mockAnimations();
		const { rerender } = render(<Panel open />);

		rerender(<Panel open={false} />);

		expect(panel()).toHaveAttribute('data-leaving');

		await act(() => animations.finish());

		expect(panel()).not.toBeInTheDocument();
	});

	test('stays when it is opened again on its way out', async () => {
		const animations = mockAnimations();
		const { rerender } = render(<Panel open />);

		rerender(<Panel open={false} />);
		rerender(<Panel open />);

		expect(panel()).not.toHaveAttribute('data-leaving');

		// the way out it had started ends: it is not what takes it away any more
		await act(() => animations.finish());

		expect(panel()).toBeInTheDocument();
	});

	test('does not wait for an animation that never ends', () => {
		mockAnimations(Number.POSITIVE_INFINITY);
		const { rerender } = render(<Panel open />);

		rerender(<Panel open={false} />);

		expect(panel()).not.toBeInTheDocument();
	});
});
