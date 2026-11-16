import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, test, vi } from 'vitest';
import { inChile } from '../../__mocks__/locale.mock.ts';
import { DropdownMenuItem } from '../dropdown-menu/DropdownMenu.tsx';
import { UserMenu, type UserMenuProps } from './UserMenu.tsx';

inChile();

const NAME = 'Pérez Soto, Ana María';

const renderMenu = (props: Partial<UserMenuProps> = {}) => {
	const onSelect = vi.fn();

	render(
		<UserMenu name={NAME} {...props}>
			<DropdownMenuItem icon='settings' onSelect={onSelect}>
				Configuración
			</DropdownMenuItem>
		</UserMenu>,
	);

	return onSelect;
};

const trigger = (name = 'Menú de Ana Pérez') =>
	screen.getByRole('button', { name });

describe(UserMenu, () => {
	// hooks
	afterEach(cleanup);

	// tests
	test('shows the short name of the person, never the full one, and what they are', () => {
		renderMenu({ className: 'extra', roleLabel: 'Administradora' });

		expect(trigger()).toHaveTextContent('Ana PérezAdministradoraAP');
		expect(trigger()).toHaveAttribute('title', NAME);
		expect(trigger()).toHaveAttribute('aria-haspopup', 'menu');
		expect(trigger()).toHaveAttribute('aria-expanded', 'false');
	});

	test('opens a menu that starts with who it is', async () => {
		renderMenu({ detail: 'ana.perez@empresa.cl' });

		await userEvent.click(trigger());

		const menu = screen.getByRole('menu', { name: 'Menú de Ana Pérez' });

		expect(screen.getByText(NAME)).toBeVisible();
		expect(screen.getByText('ana.perez@empresa.cl')).toBeVisible();
		expect(
			within(menu).getByRole('menuitem', { name: 'Configuración' }),
		).toHaveFocus();
		expect(trigger()).toHaveAttribute('aria-expanded', 'true');
	});

	test('runs the item chosen and closes', async () => {
		const onSelect = renderMenu();

		await userEvent.click(trigger());
		await userEvent.click(
			screen.getByRole('menuitem', { name: 'Configuración' }),
		);

		expect(onSelect).toHaveBeenCalledOnce();
		expect(screen.queryByRole('menu')).not.toBeInTheDocument();
		expect(trigger()).toHaveFocus();
	});

	test('draws the photo over the initials when there is one', () => {
		renderMenu({ photo: '/photos/ana.jpg' });

		expect(
			screen.getByRole('presentation', { hidden: true }),
		).toHaveAttribute('src', '/photos/ana.jpg');
	});

	test('keeps a name it cannot shorten, and takes another label', () => {
		renderMenu({ label: 'Cuenta', name: 'soporte' });

		expect(trigger('Cuenta')).toHaveTextContent('soporte');
	});
});
