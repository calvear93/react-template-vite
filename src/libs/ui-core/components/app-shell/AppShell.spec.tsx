import { act, cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, test, vi } from 'vitest';
import { inChile } from '../../__mocks__/locale.mock.ts';
import { SHELL_FOLDED_STORAGE_KEY } from './app-shell.hook.ts';
import { AppShell, type AppShellProps } from './AppShell.tsx';

inChile();

const MENU: AppShellProps['menu'] = [
	{
		title: 'Gestión',
		items: [
			{ href: '/orders', icon: 'list', label: 'Órdenes' },
			{ current: true, href: '/reports', label: 'Denuncias' },
		],
	},
	{ items: [{ href: '/users', icon: 'users', label: 'Usuarios' }] },
];

const EXPANDED = 'aria-expanded';
const FOLD = 'Plegar el menú';
const UNFOLD = 'Desplegar el menú';

const shell = (props: Partial<AppShellProps> = {}) => (
	<AppShell
		menu={MENU}
		subtitle='Área · Acme'
		title='Mi aplicación'
		{...props}
	>
		<h1>Contenido</h1>
	</AppShell>
);

const menuButton = () => screen.getByRole('button', { name: 'Menú' });
const foldButton = () => screen.getByRole('button', { name: 'Barra lateral' });
const navigation = () =>
	screen.getByRole('navigation', { name: 'Menú principal' });
const link = (name: string) => within(navigation()).getByRole('link', { name });
const texts = (text: string) => screen.getAllByText(text).length;

describe(AppShell, () => {
	// hooks
	afterEach(() => {
		cleanup();
		localStorage.clear();
		vi.restoreAllMocks();
	});

	// tests
	test('frames the page: the header, the menu and the content', () => {
		render(shell({ className: 'extra', utilities: <span>DEV</span> }));

		const header = within(screen.getByRole('banner'));

		expect(header.getByText('Mi aplicación')).toBeVisible();
		expect(header.getByText('Área · Acme')).toBeVisible();
		expect(header.getByText('DEV')).toBeVisible();
		expect(
			within(screen.getByRole('main')).getByRole('heading', {
				name: 'Contenido',
			}),
		).toBeVisible();
		expect(screen.getByRole('complementary')).toContainElement(
			navigation(),
		);
	});

	test('puts its header before its side bar: the focus follows what is seen', () => {
		render(shell());

		expect(
			screen
				.getByRole('banner')
				.compareDocumentPosition(screen.getByRole('complementary')),
		).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
	});

	test('lists its menu by sections, each link named and leading somewhere', () => {
		render(shell());

		expect(
			within(navigation()).getByRole('heading', { name: 'Gestión' }),
		).toBeVisible();
		expect(within(navigation()).getAllByRole('heading')).toHaveLength(1);
		expect(link('Órdenes')).toHaveAttribute('href', '/orders');
		expect(link('Usuarios')).toHaveAttribute('href', '/users');
	});

	test('marks the current page when it is told which one', () => {
		render(shell());

		expect(link('Denuncias')).toHaveAttribute('aria-current', 'page');
		expect(link('Órdenes')).not.toHaveAttribute('aria-current');
	});

	test('leads its logo to the home of the application, in its header and in its menu', () => {
		render(
			shell({ home: '/inicio', logo: <img alt='' src='/logo.svg' /> }),
		);

		const logos = screen.getAllByRole('link', { name: 'Inicio' });

		expect(logos).toHaveLength(2);
		expect(
			logos.every((logo) => logo.getAttribute('href') === '/inicio'),
		).toBe(true);
	});

	test('draws no link home without a logo', () => {
		render(shell());

		expect(
			screen.queryByRole('link', { name: 'Inicio' }),
		).not.toBeInTheDocument();
	});

	test('starts with a link that skips to the content', async () => {
		render(shell());

		await userEvent.tab();

		const skip = screen.getByRole('link', { name: 'Saltar al contenido' });

		expect(skip).toHaveFocus();
		expect(skip).toHaveAttribute('href', `#${screen.getByRole('main').id}`);

		await userEvent.keyboard('{Enter}');

		expect(screen.getByRole('main')).toHaveFocus();
		expect(globalThis.location.hash).toBe('');
	});

	test('folds its side bar to icons', async () => {
		const { unmount } = render(shell());

		// one name whatever its state: the state is what changes
		expect(foldButton()).toHaveAttribute(EXPANDED, 'true');
		expect(foldButton()).toHaveAttribute('title', FOLD);

		await userEvent.click(foldButton());

		expect(foldButton()).toHaveAttribute(EXPANDED, 'false');
		expect(foldButton()).toHaveAttribute('title', UNFOLD);
		// folded, each link keeps its name
		expect(link('Órdenes')).toBeInTheDocument();

		unmount();
	});

	test('remembers its side bar folded', async () => {
		const { unmount } = render(shell());

		await userEvent.click(foldButton());

		expect(localStorage.getItem(SHELL_FOLDED_STORAGE_KEY)).toBe('true');

		unmount();
		render(shell());

		expect(foldButton()).toHaveAttribute(EXPANDED, 'false');
	});

	test('unfolds again', async () => {
		localStorage.setItem(SHELL_FOLDED_STORAGE_KEY, 'true');
		render(shell());

		await userEvent.click(foldButton());

		expect(foldButton()).toHaveAttribute(EXPANDED, 'true');
		expect(localStorage.getItem(SHELL_FOLDED_STORAGE_KEY)).toBe('false');
	});

	test('folds without remembering when the storage is blocked', async () => {
		const blocked = () => {
			throw new DOMException('blocked', 'SecurityError');
		};

		vi.spyOn(Storage.prototype, 'getItem').mockImplementation(blocked);
		vi.spyOn(Storage.prototype, 'setItem').mockImplementation(blocked);
		render(shell());

		await userEvent.click(foldButton());

		expect(foldButton()).toHaveAttribute(EXPANDED, 'false');
	});

	test('shows the name of a folded link on focus and on hover, without saying it twice', async () => {
		localStorage.setItem(SHELL_FOLDED_STORAGE_KEY, 'true');
		render(shell());

		expect(texts('Usuarios')).toBe(1);

		act(() => link('Usuarios').focus());

		expect(texts('Usuarios')).toBe(2);
		expect(link('Usuarios')).not.toHaveAttribute('aria-describedby');

		await userEvent.hover(link('Órdenes'));

		expect(texts('Órdenes')).toBe(2);
	});

	test('shows no hint while its links have their names in sight', async () => {
		render(shell());

		await userEvent.hover(link('Usuarios'));
		act(() => link('Órdenes').focus());

		expect(texts('Usuarios')).toBe(1);
		expect(texts('Órdenes')).toBe(1);
	});

	test('opens its menu over the page from the header, the focus on its first link', async () => {
		render(shell());

		expect(menuButton()).toHaveAttribute(EXPANDED, 'false');
		expect(menuButton()).toHaveAttribute(
			'aria-controls',
			screen.getByRole('complementary').id,
		);

		await userEvent.click(menuButton());

		expect(menuButton()).toHaveAttribute(EXPANDED, 'true');
		expect(link('Órdenes')).toHaveFocus();
	});

	test('leaves the rest of the page inert while its menu is open', async () => {
		render(shell());

		const rest = [
			screen.getByRole('banner'),
			screen.getByRole('main'),
			screen.getByRole('link', { name: 'Saltar al contenido' }),
		];

		expect(rest.some((node) => node.inert)).toBe(false);

		await userEvent.click(menuButton());

		expect(rest.every((node) => node.inert)).toBe(true);
		expect(screen.getByRole('complementary').inert).toBe(false);

		await userEvent.keyboard('{Escape}');

		expect(rest.some((node) => node.inert)).toBe(false);
	});

	test('closes its menu with Escape, the focus back on its button', async () => {
		render(shell());

		await userEvent.click(menuButton());
		await userEvent.keyboard('{Escape}');

		expect(menuButton()).toHaveAttribute(EXPANDED, 'false');
		expect(menuButton()).toHaveFocus();
	});

	test('leaves alone an Escape that something else already took', async () => {
		render(shell());

		await userEvent.click(menuButton());
		link('Órdenes').addEventListener('keydown', (event) =>
			event.preventDefault(),
		);
		await userEvent.keyboard('{Escape}');

		expect(menuButton()).toHaveAttribute(EXPANDED, 'true');
	});

	test('closes its menu from its own button, the focus back on the one that opened it', async () => {
		render(shell());

		await userEvent.click(menuButton());
		await userEvent.click(
			screen.getByRole('button', { name: 'Cerrar el menú' }),
		);

		expect(menuButton()).toHaveAttribute(EXPANDED, 'false');
		expect(menuButton()).toHaveFocus();
	});

	test('keeps its menu open on a press inside of it and closes it on one outside', async () => {
		render(shell());

		await userEvent.click(menuButton());
		await userEvent.click(screen.getByRole('heading', { name: 'Gestión' }));

		expect(menuButton()).toHaveAttribute(EXPANDED, 'true');

		await userEvent.click(
			screen.getByRole('heading', { name: 'Contenido' }),
		);

		expect(menuButton()).toHaveAttribute(EXPANDED, 'false');
	});

	test('closes its menu when the window grows wide: the side bar is in the page again', async () => {
		const listeners: (() => void)[] = [];
		const wide = { matches: false };

		vi.spyOn(globalThis, 'matchMedia').mockImplementation(
			(media) =>
				({
					media,
					removeEventListener: vi.fn(),
					addEventListener: (_: string, listener: () => void) =>
						listeners.push(listener),
					get matches() {
						return wide.matches;
					},
				}) as unknown as MediaQueryList,
		);
		render(shell());
		await userEvent.click(menuButton());

		// a change that leaves the window narrow keeps the panel
		act(() => {
			for (const listener of listeners) listener();
		});

		expect(menuButton()).toHaveAttribute(EXPANDED, 'true');

		wide.matches = true;
		act(() => {
			for (const listener of listeners) listener();
		});

		expect(menuButton()).toHaveAttribute(EXPANDED, 'false');
	});

	test('closes its menu when one of its links is followed', async () => {
		render(shell());

		await userEvent.click(menuButton());
		link('Usuarios').addEventListener('click', (event) =>
			event.preventDefault(),
		);
		await userEvent.click(link('Usuarios'));

		expect(menuButton()).toHaveAttribute(EXPANDED, 'false');
	});

	test('starts a new page at its top, the focus on its content and the menu closed', async () => {
		const scrollTo = vi
			.spyOn(HTMLElement.prototype, 'scrollTo')
			.mockImplementation(vi.fn());
		const { rerender } = render(shell({ pageKey: '/orders' }));

		expect(document.body).toHaveFocus();
		expect(scrollTo).not.toHaveBeenCalled();

		await userEvent.click(menuButton());
		rerender(shell({ pageKey: '/users' }));

		expect(screen.getByRole('main')).toHaveFocus();
		expect(scrollTo).toHaveBeenCalledExactlyOnceWith({ top: 0 });
		expect(menuButton()).toHaveAttribute(EXPANDED, 'false');
	});

	test('takes other texts', () => {
		render(
			shell({
				subtitle: undefined,
				labels: {
					menu: 'Menu',
					navigation: 'Main menu',
					sidebar: 'Side bar',
					skip: 'Skip',
				},
			}),
		);

		expect(screen.getByRole('button', { name: 'Menu' })).toBeVisible();
		expect(screen.getByRole('button', { name: 'Side bar' })).toBeVisible();
		expect(
			screen.getByRole('navigation', { name: 'Main menu' }),
		).toBeVisible();
		expect(screen.getByRole('link', { name: 'Skip' })).toBeInTheDocument();
		expect(screen.queryByText('Área · Acme')).not.toBeInTheDocument();
	});
});
