import { act, cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { afterEach, describe, expect, test } from 'vitest';
import { inChile } from '../../__mocks__/locale.mock.ts';
import { mockMatchMedia } from '../../__mocks__/match-media.mock.ts';
import {
	BLACK_STORAGE_KEY,
	CONTRAST_STORAGE_KEY,
	LINKS_STORAGE_KEY,
	MOTION_STORAGE_KEY,
	TEXT_STORAGE_KEY,
	THEME_STORAGE_KEY,
} from '../../theme/theme.constants.ts';
import {
	setAccent,
	setContrast,
	setMotion,
	setPureBlack,
	setTextSize,
	setTheme,
	setUnderlineLinks,
} from '../../theme/theme.store.ts';
import { Switch } from '../switch/Switch.tsx';
import { SettingsDialog, type SettingsDialogProps } from './SettingsDialog.tsx';
import { SettingsGroup, SettingsRow } from './SettingsGroup.tsx';

inChile();

const TITLE = 'Configuración';
const APPEARANCE = 'Apariencia';
const ACCESSIBILITY = 'Accesibilidad';
const NOTICES = 'Notificaciones';
const AUTO = 'Automático';
const A11Y = 'accessibility';
const SELECTED = 'aria-selected';

const NOTIFICATIONS: SettingsDialogProps['sections'] = [
	{
		id: 'notifications',
		description: 'Qué avisos recibe y por dónde.',
		icon: 'mail',
		label: NOTICES,
		content: (
			<SettingsGroup title='Correo'>
				<SettingsRow
					hint='Un resumen cada lunes'
					label='Correo semanal'
				>
					<Switch />
				</SettingsRow>
			</SettingsGroup>
		),
	},
];

const Opener = (props: Partial<SettingsDialogProps>) => {
	const [isOpen, setIsOpen] = useState(true);

	return (
		<>
			<button onClick={() => setIsOpen(true)} type='button'>
				Abrir
			</button>
			<SettingsDialog onOpenChange={setIsOpen} open={isOpen} {...props} />
		</>
	);
};

const root = document.documentElement;
const dialog = () => screen.queryByRole('dialog', { name: TITLE });
const tab = (name: string) => screen.getByRole('tab', { name });
const panel = () => screen.getByRole('tabpanel');
// an option of a group of the panel: «Alto» of «Contraste»
const choice = (group: string, name: RegExp | string) =>
	within(screen.getByRole('group', { name: group })).getByRole('radio', {
		name,
	});
const opener = () => screen.getByRole('button', { name: 'Abrir' });

describe(SettingsDialog, () => {
	// hooks
	afterEach(() => {
		cleanup();
		setTheme('auto');
		setContrast(null);
		setMotion(null);
		setTextSize('normal');
		setUnderlineLinks(false);
		setPureBlack(false);
		setAccent(null);
		localStorage.clear();
	});

	// tests
	test('is a dialog with its categories as tabs, the first one chosen and focused', () => {
		render(<Opener className='extra' />);

		const tabs = screen.getByRole('tablist', {
			name: 'Secciones de la configuración',
		});

		expect(dialog()).toBeInTheDocument();
		expect(
			within(tabs)
				.getAllByRole('tab')
				.map((item) => item.textContent),
		).toStrictEqual([APPEARANCE, ACCESSIBILITY]);
		expect(tab(APPEARANCE)).toHaveAttribute(SELECTED, 'true');
		expect(tab(APPEARANCE)).toHaveFocus();
		expect(tab(ACCESSIBILITY)).toHaveAttribute('tabindex', '-1');
	});

	test('shows the options of the chosen category in a panel named by it', async () => {
		render(<Opener />);

		expect(panel()).toHaveAccessibleName(APPEARANCE);
		expect(
			within(panel()).getByRole('heading', { name: APPEARANCE }),
		).toBeVisible();
		expect(
			within(panel()).getByText(
				'Cómo se ve la aplicación en este navegador.',
			),
		).toBeVisible();

		await userEvent.click(tab(ACCESSIBILITY));

		expect(panel()).toHaveAccessibleName(ACCESSIBILITY);
		expect(
			within(panel()).getByRole('heading', { name: 'Lectura' }),
		).toBeVisible();
	});

	test.each([
		['{ArrowDown}', ACCESSIBILITY],
		['{ArrowRight}', ACCESSIBILITY],
		['{ArrowUp}', NOTICES],
		['{End}', NOTICES],
		['{End}{Home}', APPEARANCE],
		['{ArrowDown}{ArrowDown}{ArrowDown}', APPEARANCE],
	])(
		'moves through its categories with %s, choosing «%s»',
		async (keys, name) => {
			render(<Opener sections={NOTIFICATIONS} />);

			await userEvent.keyboard(keys);

			expect(tab(name)).toHaveFocus();
			expect(tab(name)).toHaveAttribute(SELECTED, 'true');
			expect(panel()).toHaveAccessibleName(name);
		},
	);

	test('follows the system until a theme is chosen, then applies and remembers it', async () => {
		render(<Opener />);

		expect(choice('Tema', /^Automático/u)).toBeChecked();
		expect(choice('Tema', /^Automático/u)).toHaveAccessibleDescription(
			'Sigue al sistema',
		);

		await userEvent.click(choice('Tema', 'Oscuro'));

		expect(root).toHaveAttribute('data-theme', 'dark');
		expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark');

		await userEvent.click(choice('Tema', /^Automático/u));

		expect(localStorage.getItem(THEME_STORAGE_KEY)).toBeNull();
	});

	test('makes the text larger, and normal again', async () => {
		render(<Opener />);

		expect(choice('Tamaño del texto', 'Normal')).toBeChecked();

		await userEvent.click(choice('Tamaño del texto', 'Grande'));

		expect(root).toHaveAttribute('data-text', 'large');
		expect(localStorage.getItem(TEXT_STORAGE_KEY)).toBe('large');

		await userEvent.click(choice('Tamaño del texto', 'Normal'));

		expect(root).not.toHaveAttribute('data-text');
	});

	test('sets the contrast high, normal, or as the system asks', async () => {
		render(<Opener defaultSection={A11Y} />);

		expect(choice('Contraste', AUTO)).toBeChecked();

		await userEvent.click(choice('Contraste', 'Alto'));

		expect(root).toHaveAttribute('data-contrast', 'more');
		expect(localStorage.getItem(CONTRAST_STORAGE_KEY)).toBe('more');

		await userEvent.click(choice('Contraste', 'Normal'));

		expect(localStorage.getItem(CONTRAST_STORAGE_KEY)).toBe('normal');

		await userEvent.click(choice('Contraste', AUTO));

		expect(localStorage.getItem(CONTRAST_STORAGE_KEY)).toBeNull();
	});

	test('reduces the motion, lets all of it, or follows the system', async () => {
		render(<Opener defaultSection={A11Y} />);

		expect(choice('Animaciones', AUTO)).toBeChecked();

		await userEvent.click(choice('Animaciones', 'Reducidas'));

		expect(root).toHaveAttribute('data-motion', 'reduce');
		expect(localStorage.getItem(MOTION_STORAGE_KEY)).toBe('reduce');

		await userEvent.click(choice('Animaciones', 'Completas'));

		expect(localStorage.getItem(MOTION_STORAGE_KEY)).toBe('full');

		await userEvent.click(choice('Animaciones', AUTO));

		expect(localStorage.getItem(MOTION_STORAGE_KEY)).toBeNull();
	});

	test('offers the accents as colors to pick, each by its name', async () => {
		render(<Opener />);

		const accents = within(
			screen.getByRole('radiogroup', { name: 'Color de acento' }),
		);

		// one radio per color, in the order they are offered, each found by its name
		expect(accents.getAllByRole('radio')).toStrictEqual(
			['Azul', 'Morado', 'Rosa', 'Naranja', 'Verde', 'Grafito'].map(
				(name) => accents.getByRole('radio', { name }),
			),
		);
		expect(accents.getByRole('radio', { name: 'Azul' })).toBeChecked();

		await userEvent.click(accents.getByRole('radio', { name: 'Morado' }));

		expect(root).toHaveAttribute('data-accent', 'purple');
		expect(accents.getByRole('radio', { name: 'Morado' })).toBeChecked();

		await userEvent.click(accents.getByRole('radio', { name: 'Azul' }));

		expect(root).not.toHaveAttribute('data-accent');
	});

	test('paints the dark theme in pure black from a switch, which a light theme has no use for', async () => {
		render(<Opener />);

		const black = () => screen.getByRole('switch', { name: 'Negro puro' });

		act(() => setTheme('light'));

		expect(black()).toBeDisabled();

		act(() => setTheme('dark'));
		await userEvent.click(black());

		expect(black()).toBeChecked();
		expect(root).toHaveAttribute('data-dark', 'black');
		expect(localStorage.getItem(BLACK_STORAGE_KEY)).toBe('true');
		expect(black()).toHaveAccessibleDescription(
			'En el tema oscuro, un fondo negro de verdad: para pantallas OLED.',
		);
	});

	test('underlines the links from a switch named and described by its row', async () => {
		render(<Opener defaultSection={A11Y} />);

		const links = screen.getByRole('switch', { name: 'Subrayar enlaces' });

		expect(links).not.toBeChecked();
		expect(links).toHaveAccessibleDescription(
			'Los enlaces se distinguen por algo más que su color.',
		);

		await userEvent.click(links);

		expect(root).toHaveAttribute('data-links', 'underline');
		expect(localStorage.getItem(LINKS_STORAGE_KEY)).toBe('underline');

		await userEvent.click(screen.getByText('Subrayar enlaces'));

		expect(root).not.toHaveAttribute('data-links');
	});

	test('says what the system asks for, only when it asks', () => {
		const media = mockMatchMedia({
			'(prefers-contrast: more)': true,
			'(prefers-reduced-motion: reduce)': true,
		});

		// the store reads the system again
		setMotion(null);

		const { unmount } = render(<Opener defaultSection={A11Y} />);

		expect(
			screen.getByText(/Su sistema pide más contraste\./u),
		).toBeVisible();
		expect(
			screen.getByText(/Su sistema pide menos movimiento\./u),
		).toBeVisible();
		unmount();
		// the system stops asking: the mock is taken away before the test ends
		media.restore();
		setMotion(null);
		render(<Opener defaultSection={A11Y} />);

		expect(screen.queryByText(/Su sistema pide/u)).not.toBeInTheDocument();
	});

	test('adds the categories of the app after its own, built with groups and rows', async () => {
		render(
			<Opener defaultSection='notifications' sections={NOTIFICATIONS} />,
		);

		expect(tab(NOTICES)).toHaveAttribute(SELECTED, 'true');
		expect(
			within(panel()).getByText('Qué avisos recibe y por dónde.'),
		).toBeVisible();
		expect(
			within(panel()).getByRole('region', { name: 'Correo' }),
		).toBeVisible();

		const weekly = screen.getByRole('switch', { name: 'Correo semanal' });

		expect(weekly).toHaveAccessibleDescription('Un resumen cada lunes');

		await userEvent.click(weekly);

		expect(weekly).toBeChecked();
	});

	test('opens on its first category when it is told one it does not have', () => {
		render(<Opener defaultSection='billing' />);

		expect(tab(APPEARANCE)).toHaveAttribute(SELECTED, 'true');
	});

	test.each(['Listo', 'Cerrar la configuración'])(
		'closes from «%s», the focus back on what opened it',
		async (name) => {
			render(<Opener />);
			// it starts open: closed and opened again, it has an opener to go back to
			await userEvent.keyboard('{Escape}');
			await userEvent.click(opener());

			await userEvent.click(screen.getByRole('button', { name }));

			expect(dialog()).not.toBeInTheDocument();
			expect(opener()).toHaveFocus();
		},
	);

	test('closes with Escape and opens again on the category it was left on', async () => {
		render(<Opener />);

		await userEvent.click(tab(ACCESSIBILITY));
		await userEvent.keyboard('{Escape}');

		expect(dialog()).not.toBeInTheDocument();

		await userEvent.click(opener());

		expect(tab(ACCESSIBILITY)).toHaveAttribute(SELECTED, 'true');
		expect(tab(ACCESSIBILITY)).toHaveFocus();
	});

	test('takes other texts', () => {
		render(
			<Opener
				labels={{
					appearance: 'Aspecto',
					done: 'Cerrar',
					title: 'Ajustes',
				}}
			/>,
		);

		expect(screen.getByRole('dialog', { name: 'Ajustes' })).toBeVisible();
		expect(tab('Aspecto')).toBeVisible();
		expect(screen.getByRole('button', { name: 'Cerrar' })).toBeVisible();
	});
});
