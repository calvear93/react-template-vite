import { act, cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { Alert, ErrorAlert } from '../components/alert/Alert.tsx';
import { Breadcrumb } from '../components/breadcrumb/Breadcrumb.tsx';
import { Calendar } from '../components/calendar/Calendar.tsx';
import { Chip } from '../components/chip/Chip.tsx';
import { DataGrid } from '../components/data-grid/DataGrid.tsx';
import { DatePicker } from '../components/date-picker/DatePicker.tsx';
import { Dialog } from '../components/dialog/Dialog.tsx';
import { FilterChips } from '../components/filter-chips/FilterChips.tsx';
import { InputAmount } from '../components/input-amount/InputAmount.tsx';
import { Label } from '../components/label/Label.tsx';
import { Pager } from '../components/pager/Pager.tsx';
import { Progress } from '../components/progress/Progress.tsx';
import { SettingsDialog } from '../components/settings-dialog/SettingsDialog.tsx';
import { Spinner } from '../components/spinner/Spinner.tsx';
import { Stepper } from '../components/stepper/Stepper.tsx';
import { UserMenu } from '../components/user-menu/UserMenu.tsx';
import { configureLocale, setLocale } from '../format/locale.ts';
import { UiProvider } from '../theme/Ui.provider.tsx';

const CHILE = 'es-CL';
const DAY = '2026-11-05';
const AMOUNT = 'Amount';
const DATE = 'Date';

const amount = () =>
	screen.getByRole<HTMLInputElement>('textbox', { name: AMOUNT });
const date = () =>
	screen.getByRole<HTMLInputElement>('textbox', { name: DATE });
const sent = (name: string) =>
	new FormData(screen.getByRole<HTMLFormElement>('form')).get(name);

/**
 * The kit as it is by itself, for an app that sets no language: English texts, dates and
 * numbers as the United States writes them, US dollars. And as it follows a person who
 * chooses another language while the page is open.
 */
describe('the kit in English', () => {
	// hooks
	beforeEach(() => {
		// a Thursday
		vi.useFakeTimers({ toFake: ['Date'] });
		vi.setSystemTime(new Date('2026-11-05T15:00:00Z'));
	});

	afterEach(() => {
		cleanup();
		vi.useRealTimers();
		setLocale(null);
		configureLocale({});
	});

	// tests
	test('names what has no name of its own in English', () => {
		render(
			<>
				<Alert onClose={vi.fn()}>Saved</Alert>
				<ErrorAlert error={{ correlationId: 'abc-1' }} />
				<Breadcrumb items={[{ label: 'Orders' }]} />
				<Chip onRemove={vi.fn()}>Urgent</Chip>
				<Spinner />
			</>,
		);

		expect(
			screen.getByRole('button', { name: 'Close message' }),
		).toBeVisible();
		expect(screen.getByRole('alert')).toHaveTextContent(
			'The action could not be completedSupport code: abc-1',
		);
		expect(
			screen.getByRole('navigation', { name: 'Breadcrumb' }),
		).toBeVisible();
		expect(
			screen.getByRole('button', { name: 'Remove Urgent' }),
		).toBeVisible();
		expect(screen.getByText('Loading')).toBeInTheDocument();
	});

	test('says yes, no, all and optional in English', () => {
		render(
			<>
				<DataGrid entries={[{ label: 'Active', value: true }]} />
				<FilterChips label='State' options={[]} />
				<Label optional>Phone</Label>
				<UserMenu name='John Ronald Tolkien'>
					<span>Sign out</span>
				</UserMenu>
				<Progress label='Uploaded' max={8} value={1} />
			</>,
		);

		expect(screen.getByText('Yes')).toBeVisible();
		expect(screen.getByText('All')).toBeVisible();
		expect(screen.getByText('(optional)')).toBeVisible();
		expect(
			screen.getByRole('button', { name: 'Menu of John Tolkien' }),
		).toBeVisible();
		expect(screen.getByText('13%')).toBeVisible();
	});

	test('counts and pages as English writes its numbers', () => {
		render(
			<Pager
				onPageChange={vi.fn()}
				page={2}
				pages={121}
				size={25}
				total={3021}
			/>,
		);

		expect(screen.getByRole('status')).toHaveTextContent(
			'Showing 26–50 of 3,021 results',
		);
		expect(
			screen.getByRole('navigation', { name: 'Pagination' }),
		).toBeVisible();
		expect(
			screen.getByRole('button', { name: 'Next page' }),
		).toBeInTheDocument();
	});

	test('says how far a process is in English', () => {
		render(
			<Stepper
				current={1}
				steps={[
					{ state: 'done', title: 'Details' },
					{ title: 'Review' },
				]}
			/>,
		);

		expect(screen.getByText('Step 2 of 2: Review')).toBeVisible();
		expect(screen.getAllByRole('listitem')[0]).toHaveTextContent(
			'Details (Completed)',
		);
	});

	test('closes a dialog with a button named in English', () => {
		render(
			<Dialog onOpenChange={vi.fn()} open title='Details'>
				Body
			</Dialog>,
		);

		expect(
			screen.getByRole('button', { hidden: true, name: 'Close' }),
		).toBeInTheDocument();
	});

	test('shows a calendar in English, its weeks from Sunday', async () => {
		render(<Calendar />);

		expect(
			screen.getByRole('grid', { name: 'November 2026' }),
		).toBeVisible();
		expect(
			within(screen.getAllByRole('row')[0]).getAllByRole('button')[0],
		).toHaveAccessibleName('Sunday, November 1, 2026');
		expect(screen.getByText('Sun')).toBeInTheDocument();

		const today = screen.getByRole('button', {
			name: 'Thursday, November 5, 2026',
		});

		today.focus();
		await userEvent.keyboard('{Home}');

		expect(
			screen.getByRole('button', { name: 'Sunday, November 1, 2026' }),
		).toHaveFocus();
	});

	test('takes a date as the United States writes one', async () => {
		const onValueChange = vi.fn();

		render(<DatePicker aria-label={DATE} onValueChange={onValueChange} />);

		expect(date()).toHaveAttribute('placeholder', 'mm/dd/yyyy');
		expect(date()).toHaveAccessibleDescription(
			'Format: mm/dd/yyyy, for example 11/25/2026',
		);

		await userEvent.type(date(), '11052026');

		expect(date()).toHaveValue('11/05/2026');
		expect(onValueChange).toHaveBeenLastCalledWith(DAY);
		expect(
			screen.getByRole('button', { name: 'Open the calendar' }),
		).toBeVisible();
	});

	test('says in English what is wrong with a date, with the shape of one', async () => {
		render(<DatePicker aria-label={DATE} max={DAY} />);

		await userEvent.type(date(), '13452026');
		await userEvent.click(document.body);

		expect(date()).toHaveAccessibleDescription(
			/Not a valid date: use mm\/dd\/y{4}, for example 11\/25\/2026$/u,
		);

		await userEvent.clear(date());
		await userEvent.type(date(), '11062026');
		await userEvent.click(document.body);

		expect(date()).toHaveAccessibleDescription(
			/The date cannot be after 11\/05\/2026$/u,
		);
	});

	test('reads a date pasted whole in the order of the United States', async () => {
		render(
			<form aria-label='Visit'>
				<DatePicker aria-label={DATE} name='day' />
			</form>,
		);

		await userEvent.click(date());
		await userEvent.paste('11/5/2026');

		expect(date()).toHaveValue('11/05/2026');
		expect(sent('day')).toBe(DAY);
	});

	test('writes its date again when the person chooses another language', () => {
		render(
			<form aria-label='Visit'>
				<DatePicker aria-label={DATE} defaultValue={DAY} name='day' />
			</form>,
		);

		expect(date()).toHaveValue('11/05/2026');

		act(() => setLocale(CHILE));

		const field = screen.getByRole('textbox', { name: DATE });

		expect(field).toHaveValue('05-11-2026');
		expect(field).toHaveAttribute('placeholder', 'dd-mm-aaaa');
		expect(sent('day')).toBe(DAY);
	});

	test('takes an amount of dollars, with its cents', async () => {
		const onValueChange = vi.fn();

		render(
			<form aria-label='Order'>
				<InputAmount
					aria-label={AMOUNT}
					name='price'
					onValueChange={onValueChange}
				/>
			</form>,
		);

		await userEvent.type(amount(), '1250.5');

		expect(amount()).toHaveValue('1,250.5');
		expect(amount()).toHaveAttribute('inputmode', 'decimal');
		expect(onValueChange).toHaveBeenLastCalledWith(1250.5);
		expect(sent('price')).toBe('1250.5');
		expect(screen.getByText('$')).toBeInTheDocument();
	});

	test('refuses a third decimal of a dollar, and a second dot', async () => {
		render(<InputAmount aria-label={AMOUNT} defaultValue={12.34} />);

		expect(amount()).toHaveValue('12.34');

		await userEvent.type(amount(), '5');

		expect(amount()).toHaveValue('12.34');

		await userEvent.type(amount(), '.', {
			initialSelectionEnd: 1,
			initialSelectionStart: 1,
		});

		expect(amount()).toHaveValue('12.34');
	});

	test('says a limit of an amount with the sign of its currency', async () => {
		render(<InputAmount aria-label={AMOUNT} min={1000} />);

		await userEvent.type(amount(), '5');
		await userEvent.tab();

		expect(amount()).toHaveAccessibleDescription(
			'The minimum amount is $1,000.00',
		);
	});

	test('takes an amount in the currency it is told, whatever the one of the app', async () => {
		render(
			<>
				<InputAmount aria-label={AMOUNT} currency='EUR' />
				<InputAmount aria-label='Pesos' currency='CLP' />
			</>,
		);

		await userEvent.type(amount(), '9.99');
		await userEvent.type(
			screen.getByRole('textbox', { name: 'Pesos' }),
			'1250.5',
		);

		expect(amount()).toHaveValue('9.99');
		expect(screen.getByText('€')).toBeInTheDocument();
		// a peso has no cents: the dot of its decimals is no key of its field
		expect(screen.getByRole('textbox', { name: 'Pesos' })).toHaveValue(
			'12,505',
		);
	});

	test('writes its amount again when the person chooses another language', () => {
		render(
			<form aria-label='Order'>
				<InputAmount
					aria-label={AMOUNT}
					defaultValue={1250.5}
					name='price'
				/>
			</form>,
		);

		expect(amount()).toHaveValue('1,250.50');

		act(() => setLocale(CHILE));

		expect(amount()).toHaveValue('1.250,50');
		expect(sent('price')).toBe('1250.5');
	});

	test('lets the person choose the language in its settings', async () => {
		render(<SettingsDialog onOpenChange={vi.fn()} open />);

		const language = screen.getByRole('combobox', {
			hidden: true,
			name: /^Language/u,
		});

		expect(language).toHaveValue('en');
		expect(
			within(language)
				.getAllByRole('option', { hidden: true })
				.map((option) => option.textContent),
		).toStrictEqual(['English', 'Español']);

		await userEvent.selectOptions(language, 'es');

		expect(document.documentElement).toHaveAttribute('lang', 'es');
		expect(
			screen.getByRole('combobox', { hidden: true, name: /^Idioma/u }),
		).toHaveValue('es');
	});

	test('offers the languages of the app, and none to choose when it has one', () => {
		const { rerender } = render(
			<UiProvider locale='pt-BR'>
				<SettingsDialog
					languages={[
						{ label: 'English (UK)', value: 'en-GB' },
						{ label: 'Español (Chile)', value: CHILE },
					]}
					onOpenChange={vi.fn()}
					open
				/>
			</UiProvider>,
		);
		const language = screen.getByRole('combobox', {
			hidden: true,
			name: /^Language/u,
		});

		// a language of the page that is not among those offered is still shown as chosen
		expect(language).toHaveValue('pt-BR');
		expect(
			within(language).getAllByRole('option', { hidden: true }),
		).toHaveLength(3);

		rerender(
			<UiProvider locale='pt-BR'>
				<SettingsDialog
					languages={[{ label: 'Português', value: 'pt-BR' }]}
					onOpenChange={vi.fn()}
					open
				/>
			</UiProvider>,
		);

		expect(
			screen.queryByRole('combobox', {
				hidden: true,
				name: /^Language/u,
			}),
		).not.toBeInTheDocument();
	});
});

describe(UiProvider, () => {
	// hooks
	afterEach(() => {
		cleanup();
		setLocale(null);
		configureLocale({});
	});

	// tests
	test('draws the app in its language, its currency and its time zone', () => {
		render(
			<UiProvider
				currency='CLP'
				locale={CHILE}
				timeZone='America/Santiago'
			>
				<InputAmount aria-label='Monto' defaultValue={1_250_000} />
				<DatePicker aria-label='Fecha' defaultValue={DAY} />
			</UiProvider>,
		);

		expect(screen.getByRole('textbox', { name: 'Monto' })).toHaveValue(
			'1.250.000',
		);
		expect(screen.getByRole('textbox', { name: 'Fecha' })).toHaveValue(
			'05-11-2026',
		);
		expect(
			screen.getByRole('button', { name: 'Abrir calendario' }),
		).toBeVisible();
		expect(document.documentElement).toHaveAttribute('lang', CHILE);
	});

	test('keeps the language a person chose over the one of the app', () => {
		setLocale('en-GB');

		render(
			<UiProvider locale={CHILE}>
				<DatePicker aria-label={DATE} defaultValue={DAY} />
			</UiProvider>,
		);

		expect(date()).toHaveValue('05/11/2026');
	});

	test('leaves the kit as it is by itself once it is gone', () => {
		const { unmount } = render(<UiProvider locale={CHILE} />);

		expect(document.documentElement).toHaveAttribute('lang', CHILE);

		unmount();

		expect(document.documentElement).toHaveAttribute('lang', 'en');
	});
});
