import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, test, vi } from 'vitest';
import { inChile } from '../../__mocks__/locale.mock.ts';
import { UiContextException } from '../../exceptions/ui-context.exception.ts';
import { Tab, Tabs, TabsList, TabsPanel, type TabsProps } from './Tabs.tsx';

inChile();

const renderTabs = (props: Partial<TabsProps> = {}) =>
	render(
		<Tabs defaultValue='data' {...props}>
			<TabsList label='Ficha del trabajador'>
				<Tab value='data'>Datos</Tab>
				<Tab attention count={1234} value='reports'>
					Denuncias
				</Tab>
				<Tab disabled value='history'>
					Historial
				</Tab>
				<Tab count={0} value='documents'>
					Documentos
				</Tab>
			</TabsList>
			<TabsPanel value='data'>Panel de datos</TabsPanel>
			<TabsPanel value='reports'>Panel de denuncias</TabsPanel>
			<TabsPanel value='documents'>Panel de documentos</TabsPanel>
		</Tabs>,
	);

const SELECTED = 'aria-selected';

const tab = (name: RegExp | string) => screen.getByRole('tab', { name });

describe(Tabs, () => {
	// hooks
	afterEach(cleanup);

	// tests
	test('is a named tab list with one selected tab and its panel', () => {
		renderTabs({ className: 'extra' });

		expect(
			screen.getByRole('tablist', { name: 'Ficha del trabajador' }),
		).toHaveAttribute('aria-orientation', 'horizontal');
		expect(
			screen
				.getAllByRole('tab')
				.map((item) => item.getAttribute(SELECTED)),
		).toStrictEqual(['true', 'false', 'false', 'false']);
	});

	test('shows only the panel of the selected tab, tied to it and focusable', () => {
		renderTabs();

		const panel = screen.getByRole('tabpanel', { name: 'Datos' });

		expect(panel).toHaveTextContent('Panel de datos');
		expect(panel).toHaveAttribute('tabindex', '0');
		expect(tab('Datos')).toHaveAttribute('aria-controls', panel.id);
		expect(screen.getAllByRole('tabpanel')).toHaveLength(1);
	});

	test('shows the count of a tab as Chile writes numbers', () => {
		renderTabs();

		// the count that needs attention says so in words, not only in color
		expect(tab(/Denuncias/u)).toHaveTextContent(
			'Denuncias1.234 (requiere atención)',
		);
		expect(tab(/Documentos/u)).toHaveTextContent('Documentos0');
	});

	test('chooses a tab from a click and shows its panel', async () => {
		const onValueChange = vi.fn();

		renderTabs({ onValueChange });

		await userEvent.click(tab(/Denuncias/u));

		expect(tab(/Denuncias/u)).toHaveAttribute(SELECTED, 'true');
		expect(screen.getByRole('tabpanel')).toHaveTextContent(
			'Panel de denuncias',
		);
		expect(onValueChange).toHaveBeenCalledExactlyOnceWith('reports');
	});

	test('is one Tab stop: the arrows move and choose, skipping the disabled tab', async () => {
		renderTabs();

		await userEvent.tab();

		expect(tab('Datos')).toHaveFocus();

		await userEvent.keyboard('{ArrowRight}{ArrowRight}');

		expect(tab(/Documentos/u)).toHaveFocus();
		expect(tab(/Documentos/u)).toHaveAttribute(SELECTED, 'true');

		await userEvent.keyboard('{ArrowRight}');

		expect(tab('Datos')).toHaveFocus();
	});

	test('jumps with Home and End, loops back, and leaves to its panel with Tab', async () => {
		renderTabs();

		await userEvent.tab();
		await userEvent.keyboard('{End}');

		expect(tab(/Documentos/u)).toHaveAttribute(SELECTED, 'true');

		await userEvent.keyboard('{Home}{ArrowLeft}');

		expect(tab(/Documentos/u)).toHaveFocus();

		await userEvent.tab();

		expect(screen.getByRole('tabpanel')).toHaveFocus();
	});

	test('moves with the up and down arrows when it is vertical', async () => {
		renderTabs({ orientation: 'vertical', variant: 'box' });

		await userEvent.tab();
		await userEvent.keyboard('{ArrowRight}');

		expect(tab('Datos')).toHaveFocus();

		await userEvent.keyboard('{ArrowDown}');

		expect(tab(/Denuncias/u)).toHaveAttribute(SELECTED, 'true');
	});

	test('shows the tab of its parent when controlled', async () => {
		const onValueChange = vi.fn();

		renderTabs({ onValueChange, value: 'reports' });

		await userEvent.click(tab('Datos'));

		expect(onValueChange).toHaveBeenCalledExactlyOnceWith('data');
		expect(tab(/Denuncias/u)).toHaveAttribute(SELECTED, 'true');
	});

	test('keeps every tab reachable while none is selected', () => {
		renderTabs({ defaultValue: undefined });

		expect(screen.queryByRole('tabpanel')).not.toBeInTheDocument();
		expect(tab('Datos')).toHaveAttribute('tabindex', '0');
		expect(tab(/Denuncias/u)).toHaveAttribute('tabindex', '0');
	});

	test('draws tabs with an href as links that wait for Enter', async () => {
		const onValueChange = vi.fn();

		render(
			<Tabs onValueChange={onValueChange} value='data'>
				<TabsList label='Secciones'>
					<Tab href='/worker/data' value='data'>
						Datos
					</Tab>
					<Tab href='/worker/reports' value='reports'>
						Denuncias
					</Tab>
					<Tab disabled href='/worker/history' value='history'>
						Historial
					</Tab>
				</TabsList>
				<TabsPanel value='data'>Panel de datos</TabsPanel>
			</Tabs>,
		);

		expect(tab('Denuncias')).toHaveAttribute('href', '/worker/reports');
		expect(tab('Historial')).toBeDisabled();

		await userEvent.tab();
		await userEvent.keyboard('{ArrowRight}');

		expect(tab('Denuncias')).toHaveFocus();
		expect(onValueChange).not.toHaveBeenCalled();
	});

	test.each([
		{ name: 'TabsList', part: <TabsList label='Suelta' /> },
		{ name: 'Tab', part: <Tab value='a'>Suelta</Tab> },
		{ name: 'TabsPanel', part: <TabsPanel value='a' /> },
	])('refuses a $name outside of Tabs', ({ part }) => {
		const error = vi.spyOn(console, 'error').mockImplementation(vi.fn());

		expect(() => render(part)).toThrow(UiContextException);

		error.mockRestore();
	});
});
