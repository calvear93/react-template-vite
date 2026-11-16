import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, test, vi } from 'vitest';
import {
	DropdownMenu,
	DropdownMenuGroup,
	DropdownMenuItem,
	type DropdownMenuProps,
	DropdownMenuSeparator,
} from './DropdownMenu.tsx';

const renderMenu = (props: Partial<DropdownMenuProps> = {}) => {
	const handlers = { edit: vi.fn(), remove: vi.fn() };

	render(
		<>
			<DropdownMenu label='Acciones' {...props}>
				<DropdownMenuItem icon='edit' onSelect={handlers.edit}>
					Editar
				</DropdownMenuItem>
				<DropdownMenuItem disabled onSelect={handlers.edit}>
					Duplicar
				</DropdownMenuItem>
				<DropdownMenuItem download href='/orders/42.pdf'>
					Descargar
				</DropdownMenuItem>
				<DropdownMenuSeparator />
				<DropdownMenuGroup label='Zona de riesgo'>
					<DropdownMenuItem onSelect={handlers.remove} tone='danger'>
						Quitar acceso
					</DropdownMenuItem>
				</DropdownMenuGroup>
			</DropdownMenu>
			<button type='button'>Fuera</button>
		</>,
	);

	return handlers;
};

const trigger = () => screen.getByRole('button', { name: 'Acciones' });
const item = (name: string) => screen.getByRole('menuitem', { name });

describe(DropdownMenu, () => {
	// hooks
	afterEach(cleanup);

	// tests
	test('starts closed, its trigger saying it has a menu', () => {
		renderMenu({ className: 'extra' });

		expect(trigger()).toHaveAttribute('aria-haspopup', 'menu');
		expect(trigger()).toHaveAttribute('aria-expanded', 'false');
		expect(trigger()).not.toHaveAttribute('aria-controls');
		expect(screen.queryByRole('menu')).not.toBeInTheDocument();
	});

	test('opens from its trigger, named by its label, the focus on its first item', async () => {
		renderMenu();

		await userEvent.click(trigger());

		const menu = screen.getByRole('menu', { name: 'Acciones' });

		expect(trigger()).toHaveAttribute('aria-expanded', 'true');
		expect(trigger()).toHaveAttribute('aria-controls', menu.id);
		expect(
			within(menu)
				.getAllByRole('menuitem')
				.map((entry) => entry.textContent),
		).toStrictEqual(['Editar', 'Duplicar', 'Descargar', 'Quitar acceso']);
		expect(item('Editar')).toHaveFocus();
	});

	test('names its groups and separates them', async () => {
		renderMenu();

		await userEvent.click(trigger());

		const menu = within(screen.getByRole('menu'));

		expect(
			menu.getByRole('group', { name: 'Zona de riesgo' }),
		).toBeInTheDocument();
		expect(menu.getByRole('separator')).toBeInTheDocument();
	});

	test('opens with the down arrow on its trigger', async () => {
		renderMenu();

		trigger().focus();
		await userEvent.keyboard('{ArrowDown}');

		expect(item('Editar')).toHaveFocus();
	});

	test('moves between its items with the arrows, Home and End, skipping the disabled one', async () => {
		renderMenu();

		await userEvent.click(trigger());
		await userEvent.keyboard('{ArrowDown}');

		expect(item('Descargar')).toHaveFocus();

		await userEvent.keyboard('{End}');

		expect(item('Quitar acceso')).toHaveFocus();

		await userEvent.keyboard('{ArrowDown}');

		expect(item('Editar')).toHaveFocus();

		await userEvent.keyboard('{ArrowUp}');

		expect(item('Quitar acceso')).toHaveFocus();

		await userEvent.keyboard('{Home}');

		expect(item('Editar')).toHaveFocus();
	});

	test('runs the action of an item, closes and gives the focus back', async () => {
		const { edit } = renderMenu();

		await userEvent.click(trigger());
		await userEvent.keyboard('{Enter}');

		expect(edit).toHaveBeenCalledOnce();
		expect(screen.queryByRole('menu')).not.toBeInTheDocument();
		expect(trigger()).toHaveFocus();
	});

	test('does nothing on a disabled item, which stays in the menu', async () => {
		const { edit } = renderMenu();

		await userEvent.click(trigger());
		await userEvent.click(item('Duplicar'));

		expect(edit).not.toHaveBeenCalled();
		expect(item('Duplicar')).toHaveAttribute('aria-disabled', 'true');
		expect(screen.getByRole('menu')).toBeInTheDocument();
	});

	test('draws an item with an href as a link that keeps its anchor props', async () => {
		renderMenu();

		await userEvent.click(trigger());

		expect(item('Descargar')).toHaveAttribute('href', '/orders/42.pdf');
		expect(item('Descargar')).toHaveAttribute('download');
	});

	test('closes with Escape and gives the focus back, without telling its parents', async () => {
		const onKeyDown = vi.fn();

		renderMenu();
		document.addEventListener('keydown', onKeyDown);

		await userEvent.click(trigger());
		await userEvent.keyboard('{Escape}');

		document.removeEventListener('keydown', onKeyDown);

		expect(screen.queryByRole('menu')).not.toBeInTheDocument();
		expect(trigger()).toHaveFocus();
		expect(onKeyDown).not.toHaveBeenCalled();
	});

	test.each([
		{ how: 'Tab', act: () => userEvent.tab() },
		{
			how: 'a press outside',
			act: () =>
				userEvent.click(screen.getByRole('button', { name: 'Fuera' })),
		},
		{ how: 'its trigger', act: () => userEvent.click(trigger()) },
	])('closes with $how', async ({ act }) => {
		renderMenu();

		await userEvent.click(trigger());
		await act();

		expect(screen.queryByRole('menu')).not.toBeInTheDocument();
	});

	test('draws an icon trigger named by its label, and a header before its menu', async () => {
		renderMenu({
			align: 'end',
			header: <strong>Ana Pérez</strong>,
			icon: 'more',
			variant: 'outlined',
		});

		await userEvent.click(trigger());

		// who the menu is about is not one of its items: it is outside the menu element
		expect(screen.getByText('Ana Pérez')).toBeVisible();
		expect(screen.getByRole('menu')).not.toHaveTextContent('Ana Pérez');
	});

	test('takes another trigger, with the props the menu gives it', async () => {
		renderMenu({
			renderTrigger: (props) => (
				<button type='button' {...props}>
					Cuenta de Ana
				</button>
			),
		});

		const custom = screen.getByRole('button', { name: 'Cuenta de Ana' });

		await userEvent.click(custom);

		expect(custom).toHaveAttribute('aria-expanded', 'true');

		await userEvent.keyboard('{Escape}');

		expect(custom).toHaveFocus();
	});

	test('follows its parent when controlled', async () => {
		const onOpenChange = vi.fn();

		renderMenu({ onOpenChange, open: true });

		await userEvent.keyboard('{Escape}');

		expect(onOpenChange).toHaveBeenCalledExactlyOnceWith(false);
		expect(screen.getByRole('menu')).toBeInTheDocument();
	});
});
