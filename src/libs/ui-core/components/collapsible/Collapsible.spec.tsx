import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { afterEach, describe, expect, test, vi } from 'vitest';
import { Collapsible } from './Collapsible.tsx';

const Controlled = ({
	onOpenChange,
}: {
	onOpenChange: (open: boolean) => void;
}) => {
	const [isOpen, setIsOpen] = useState(true);

	return (
		<Collapsible
			onOpenChange={(open) => {
				setIsOpen(open);
				onOpenChange(open);
			}}
			open={isOpen}
			title='Antecedentes'
		>
			Detalle
		</Collapsible>
	);
};

describe(Collapsible, () => {
	// hooks
	afterEach(cleanup);

	// tests
	test('starts closed and opens from its trigger, uncontrolled', async () => {
		const onOpenChange = vi.fn();

		render(
			<Collapsible
				className='extra'
				onOpenChange={onOpenChange}
				summary='3 documentos'
				title='Antecedentes'
			>
				Detalle
			</Collapsible>,
		);

		const details = screen.getByRole('group');

		expect(details).not.toHaveAttribute('open');
		expect(details).toHaveClass('extra');

		await userEvent.click(screen.getByText('Antecedentes'));

		expect(details).toHaveAttribute('open');
		expect(onOpenChange).toHaveBeenCalledExactlyOnceWith(true);
		expect(screen.getByText('3 documentos')).toBeInTheDocument();
	});

	test('starts open when asked', () => {
		render(
			<Collapsible defaultOpen title='Antecedentes'>
				Detalle
			</Collapsible>,
		);

		expect(screen.getByRole('group')).toHaveAttribute('open');
		expect(screen.getByText('Detalle')).toBeVisible();
	});

	test('follows the state of its parent when controlled', async () => {
		const onOpenChange = vi.fn();

		render(<Controlled onOpenChange={onOpenChange} />);

		const details = screen.getByRole('group');

		expect(details).toHaveAttribute('open');

		await userEvent.click(screen.getByText('Antecedentes'));

		expect(details).not.toHaveAttribute('open');
		expect(onOpenChange).toHaveBeenCalledExactlyOnceWith(false);
	});

	test('stays as its parent keeps it when the parent does not follow', async () => {
		const onOpenChange = vi.fn();

		render(
			<Collapsible
				onOpenChange={onOpenChange}
				open={false}
				title='Antecedentes'
			>
				Detalle
			</Collapsible>,
		);

		await userEvent.click(screen.getByText('Antecedentes'));

		expect(onOpenChange).toHaveBeenCalledExactlyOnceWith(true);
		expect(screen.getByRole('group')).not.toHaveAttribute('open');
	});
});
