import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, test, vi } from 'vitest';
import { Dialog } from '../dialog/Dialog.tsx';
import { Popover, type PopoverProps } from './Popover.tsx';

const EXPANDED = 'aria-expanded';

const renderPopover = (props: Partial<PopoverProps> = {}) => {
	const onOpenChange = vi.fn();

	render(
		<>
			<Popover label='Filtros' onOpenChange={onOpenChange} {...props}>
				<label>
					Folio
					<input type='text' />
				</label>
				<button type='button'>Aplicar</button>
			</Popover>
			<button type='button'>Otro</button>
			<p>Texto</p>
		</>,
	);

	return onOpenChange;
};

const trigger = () => screen.getByRole('button', { name: 'Filtros' });
const panel = () => screen.queryByRole('dialog', { name: 'Filtros' });

describe(Popover, () => {
	// hooks
	afterEach(cleanup);

	// tests
	test('is a button that says it opens a dialog, closed at first', () => {
		renderPopover({ className: 'extra', icon: 'filter' });

		expect(trigger()).toHaveAttribute(EXPANDED, 'false');
		expect(trigger()).toHaveAttribute('aria-haspopup', 'dialog');
		expect(trigger()).not.toHaveAttribute('aria-controls');
		expect(panel()).not.toBeInTheDocument();
	});

	test('opens a dialog that is not modal, the focus on its first control', async () => {
		const onOpenChange = renderPopover();

		await userEvent.click(trigger());

		expect(panel()).toHaveAttribute('aria-modal', 'false');
		expect(trigger()).toHaveAttribute('aria-controls', panel()?.id);
		expect(trigger()).toHaveAttribute(EXPANDED, 'true');
		expect(screen.getByRole('textbox', { name: 'Folio' })).toHaveFocus();
		expect(onOpenChange).toHaveBeenCalledExactlyOnceWith(true);
	});

	test('takes the focus itself when it holds no control', async () => {
		render(<Popover label='Detalle'>Calculado sobre 12 meses.</Popover>);

		await userEvent.click(screen.getByRole('button', { name: 'Detalle' }));

		expect(screen.getByRole('dialog', { name: 'Detalle' })).toHaveFocus();
	});

	test('closes from its button', async () => {
		renderPopover({ defaultOpen: true });

		expect(panel()).toBeInTheDocument();

		await userEvent.click(trigger());

		expect(panel()).not.toBeInTheDocument();
	});

	test('closes with Escape, the focus back on its button', async () => {
		renderPopover();

		await userEvent.click(trigger());
		await userEvent.keyboard('{Escape}');

		expect(panel()).not.toBeInTheDocument();
		expect(trigger()).toHaveFocus();
	});

	test('leaves alone an Escape that something inside already took', async () => {
		renderPopover();

		await userEvent.click(trigger());
		screen
			.getByRole('textbox', { name: 'Folio' })
			.addEventListener('keydown', (event) => event.preventDefault());
		await userEvent.keyboard('{Escape}');

		expect(panel()).toBeInTheDocument();
	});

	test('closes alone with Escape, not the dialog it is in', async () => {
		const onDialogChange = vi.fn();

		render(
			<Dialog onOpenChange={onDialogChange} open title='Denuncias'>
				<Popover label='Filtros'>
					<button type='button'>Aplicar</button>
				</Popover>
			</Dialog>,
		);

		await userEvent.click(trigger());
		await userEvent.keyboard('{Escape}');

		expect(panel()).not.toBeInTheDocument();
		expect(onDialogChange).not.toHaveBeenCalled();
	});

	test('stays open while the focus moves inside it, and closes when it leaves', async () => {
		renderPopover();

		await userEvent.click(trigger());
		await userEvent.tab();

		expect(screen.getByRole('button', { name: 'Aplicar' })).toHaveFocus();
		expect(panel()).toBeInTheDocument();

		await userEvent.tab();

		expect(screen.getByRole('button', { name: 'Otro' })).toHaveFocus();
		expect(panel()).not.toBeInTheDocument();
	});

	test('closes on a press outside of it, not on one inside', async () => {
		renderPopover();

		await userEvent.click(trigger());
		await userEvent.click(screen.getByText('Folio'));

		expect(panel()).toBeInTheDocument();

		await userEvent.click(screen.getByText('Texto'));

		expect(panel()).not.toBeInTheDocument();
	});

	test('is open or closed as it is told when it is controlled', async () => {
		const onOpenChange = renderPopover({ open: true });

		await userEvent.keyboard('{Escape}');

		expect(onOpenChange).toHaveBeenCalledExactlyOnceWith(false);
		expect(panel()).toBeInTheDocument();
	});

	test('hangs from another trigger when it is given one', async () => {
		renderPopover({
			renderTrigger: (props) => (
				<button type='button' {...props}>
					Ver cálculo
				</button>
			),
		});

		await userEvent.click(
			screen.getByRole('button', { name: 'Ver cálculo' }),
		);

		expect(panel()).toBeInTheDocument();

		await userEvent.keyboard('{Escape}');

		expect(
			screen.getByRole('button', { name: 'Ver cálculo' }),
		).toHaveFocus();
	});
});
