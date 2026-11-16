import { cleanup, render, renderHook, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { StrictMode, useState } from 'react';
import { afterEach, describe, expect, test, vi } from 'vitest';
import { inChile } from '../../__mocks__/locale.mock.ts';
import { UiContextException } from '../../exceptions/ui-context.exception.ts';
import { AlertDialog } from './AlertDialog.tsx';
import { ChoiceDialog, type ChoiceDialogProps } from './ChoiceDialog.tsx';
import { type Dialogs } from './dialogs.context.ts';
import { useDialogs } from './dialogs.hook.ts';
import { DialogsProvider } from './Dialogs.provider.tsx';
import { PromptDialog, type PromptDialogProps } from './PromptDialog.tsx';

inChile();

const CANCEL = 'Cancelar';
const button = (name: string) => screen.getByRole('button', { name });

describe('AlertDialog as a notice, and with a text to type', () => {
	// hooks
	afterEach(cleanup);

	// tests
	test('is one button to press once it was read, the focus on it', async () => {
		const onConfirm = vi.fn();
		const onOpenChange = vi.fn();

		render(
			<AlertDialog
				notice
				onConfirm={onConfirm}
				onOpenChange={onOpenChange}
				open
				title='Sesión por vencer'
				tone='warning'
			>
				Guarde su trabajo.
			</AlertDialog>,
		);

		expect(button('Entendido')).toHaveFocus();
		expect(
			screen.queryByRole('button', { name: CANCEL }),
		).not.toBeInTheDocument();

		await userEvent.keyboard('{Enter}');

		expect(onConfirm).toHaveBeenCalledOnce();
		expect(onOpenChange).toHaveBeenCalledExactlyOnceWith(false);
	});

	test('takes Escape on a notice as having read it', async () => {
		const onConfirm = vi.fn();
		const onCancel = vi.fn();

		render(
			<AlertDialog
				notice
				onCancel={onCancel}
				onConfirm={onConfirm}
				onOpenChange={vi.fn()}
				open
				title='Sesión por vencer'
			/>,
		);

		await userEvent.keyboard('{Escape}');

		expect(onConfirm).toHaveBeenCalledOnce();
		expect(onCancel).not.toHaveBeenCalled();
	});

	test('lets confirm only once the text asked for is typed, the focus in its field', async () => {
		const onConfirm = vi.fn();

		render(
			<AlertDialog
				confirmLabel='Eliminar'
				onConfirm={onConfirm}
				onOpenChange={vi.fn()}
				open
				requireText='ACME-0042'
				title='Eliminar la empresa'
				tone='danger'
			/>,
		);

		const field = screen.getByRole('textbox', {
			name: 'Escriba «ACME-0042» para confirmar',
		});

		expect(field).toHaveFocus();
		expect(button('Eliminar')).toBeDisabled();

		await userEvent.keyboard('acme-004{Enter}');

		expect(onConfirm).not.toHaveBeenCalled();

		// whatever its case and the spaces around it
		await userEvent.keyboard('2 ');

		expect(button('Eliminar')).toBeEnabled();

		await userEvent.keyboard('{Enter}');

		expect(onConfirm).toHaveBeenCalledOnce();
	});

	test('asks for the text again each time it opens', async () => {
		const Opener = () => {
			const [isOpen, setIsOpen] = useState(true);

			return (
				<>
					<button onClick={() => setIsOpen(true)} type='button'>
						Abrir
					</button>
					<AlertDialog
						labels={{ requireText: (text) => `Folio ${text}` }}
						onOpenChange={setIsOpen}
						open={isOpen}
						requireText='42'
						title='Eliminar'
					/>
				</>
			);
		};

		render(<Opener />);
		await userEvent.type(
			screen.getByRole('textbox', { name: 'Folio 42' }),
			'42',
		);
		await userEvent.click(button(CANCEL));
		await userEvent.click(button('Abrir'));

		expect(screen.getByRole('textbox', { name: 'Folio 42' })).toHaveValue(
			'',
		);
		expect(button('Confirmar')).toBeDisabled();
	});
});

describe(ChoiceDialog, () => {
	const renderChoice = (props: Partial<ChoiceDialogProps> = {}) => {
		const handlers = { onChoose: vi.fn(), onOpenChange: vi.fn() };

		render(
			<ChoiceDialog
				className='extra'
				open
				options={[
					{ label: 'Descartar', tone: 'danger', value: 'discard' },
					{ icon: 'check', label: 'Guardar y salir', value: 'save' },
				]}
				title='Hay cambios sin guardar'
				{...handlers}
				{...props}
			>
				Si sale ahora, se pierden.
			</ChoiceDialog>,
		);

		return handlers;
	};

	// hooks
	afterEach(cleanup);

	// tests
	test('is an alert dialog with its answers as buttons, the focus on cancel', () => {
		renderChoice();

		expect(
			screen.getByRole('alertdialog', {
				name: 'Hay cambios sin guardar',
			}),
		).toHaveAccessibleDescription('Si sale ahora, se pierden.');
		expect(button(CANCEL)).toHaveFocus();
		expect(
			screen.getAllByRole('button').map((item) => item.textContent),
		).toStrictEqual([CANCEL, 'Descartar', 'Guardar y salir']);
	});

	test('tells the answer chosen and asks to close', async () => {
		const { onChoose, onOpenChange } = renderChoice();

		await userEvent.click(button('Guardar y salir'));

		expect(onChoose).toHaveBeenCalledExactlyOnceWith('save');
		expect(onOpenChange).toHaveBeenCalledExactlyOnceWith(false);
	});

	test.each([
		{ how: 'Escape', act: () => userEvent.keyboard('{Escape}') },
		{ how: 'its cancel button', act: () => userEvent.keyboard('{Enter}') },
	])('leaves without an answer with $how', async ({ act }) => {
		const { onChoose, onOpenChange } = renderChoice({
			cancelLabel: 'Seguir editando',
		});

		await act();

		expect(onChoose).not.toHaveBeenCalled();
		expect(onOpenChange).toHaveBeenCalledExactlyOnceWith(false);
	});

	test('is not closed by its veil', async () => {
		const { onOpenChange } = renderChoice();

		await userEvent.click(screen.getByRole('alertdialog'));

		expect(onOpenChange).not.toHaveBeenCalled();
	});

	test('lists the answers that explain themselves, each with what it does', async () => {
		const { onChoose } = renderChoice({
			title: 'Exportar las denuncias',
			tone: 'info',
			options: [
				{
					description: 'Una hoja por cada mes',
					icon: 'document',
					label: 'Excel',
					value: 'xlsx',
				},
				{ label: 'PDF', value: 'pdf' },
			],
		});

		expect(button('Excel Una hoja por cada mes')).toBeVisible();

		await userEvent.click(button('PDF'));

		expect(onChoose).toHaveBeenCalledExactlyOnceWith('pdf');
	});

	test('lists more than three answers too', () => {
		renderChoice({
			options: ['Hoy', 'Esta semana', 'Este mes', 'Este año'].map(
				(label) => ({ label, value: label }),
			),
		});

		// the list first, cancel after it
		expect(
			screen.getAllByRole('button').map((item) => item.textContent),
		).toStrictEqual(['Hoy', 'Esta semana', 'Este mes', 'Este año', CANCEL]);
	});
});

describe(PromptDialog, () => {
	const renderPrompt = (props: Partial<PromptDialogProps> = {}) => {
		const handlers = { onOpenChange: vi.fn(), onSubmit: vi.fn() };

		render(
			<PromptDialog
				className='extra'
				label='Motivo'
				open
				title='Rechazar la denuncia'
				{...handlers}
				{...props}
			>
				El trabajador verá este motivo.
			</PromptDialog>,
		);

		return handlers;
	};

	const field = () => screen.getByRole('textbox', { name: /^Motivo/u });

	// hooks
	afterEach(cleanup);

	// tests
	test('is a dialog with one field, the focus in it', () => {
		renderPrompt({ defaultValue: 'Fuera de plazo', hint: 'Sea breve' });

		expect(
			screen.getByRole('dialog', { name: 'Rechazar la denuncia' }),
		).toHaveAccessibleDescription('El trabajador verá este motivo.');
		expect(field()).toHaveFocus();
		expect(field()).toHaveValue('Fuera de plazo');
		expect(field()).toHaveAccessibleDescription('Sea breve');
	});

	test('gives the text typed, trimmed, with Enter, and asks to close', async () => {
		const { onOpenChange, onSubmit } = renderPrompt();

		await userEvent.keyboard('  Falta la firma {Enter}');

		expect(onSubmit).toHaveBeenCalledExactlyOnceWith('Falta la firma');
		expect(onOpenChange).toHaveBeenCalledExactlyOnceWith(false);
	});

	test('says a text is missing, and stays, when it is required', async () => {
		const { onOpenChange, onSubmit } = renderPrompt({ required: true });

		await userEvent.click(button('Aceptar'));

		expect(field()).toBeInvalid();
		expect(field()).toHaveAccessibleDescription(
			'Escriba un texto para continuar',
		);
		expect(onSubmit).not.toHaveBeenCalled();
		expect(onOpenChange).not.toHaveBeenCalled();

		// what is wrong goes away as soon as it is corrected
		await userEvent.type(field(), 'x');

		expect(field()).toBeValid();
	});

	test('says what is wrong with a text, and accepts an empty one that is not required', async () => {
		const { onSubmit } = renderPrompt({
			confirmLabel: 'Rechazar',
			labels: { cancel: 'Volver' },
			multiline: true,
			tone: 'danger',
			validate: (text) =>
				text.length > 5 ? 'Máximo 5 caracteres' : undefined,
		});

		await userEvent.type(field(), 'demasiado');
		await userEvent.click(button('Rechazar'));

		expect(field()).toHaveAccessibleDescription('Máximo 5 caracteres');

		await userEvent.clear(field());
		await userEvent.click(button('Rechazar'));

		expect(onSubmit).toHaveBeenCalledExactlyOnceWith('');
		expect(button('Volver')).toBeVisible();
	});

	test.each([
		{ how: 'Escape', act: () => userEvent.keyboard('{Escape}') },
		{
			how: 'its cancel button',
			act: () => userEvent.click(button(CANCEL)),
		},
	])('leaves without a text with $how', async ({ act }) => {
		const { onOpenChange, onSubmit } = renderPrompt();

		await userEvent.keyboard('algo');
		await act();

		expect(onSubmit).not.toHaveBeenCalled();
		expect(onOpenChange).toHaveBeenCalledExactlyOnceWith(false);
	});

	test('starts from its first text each time it opens', async () => {
		const Opener = () => {
			const [isOpen, setIsOpen] = useState(true);

			return (
				<>
					<button onClick={() => setIsOpen(true)} type='button'>
						Abrir
					</button>
					<PromptDialog
						label='Motivo'
						onOpenChange={setIsOpen}
						open={isOpen}
						required
						title='Rechazar'
					/>
				</>
			);
		};

		render(<Opener />);
		await userEvent.click(button('Aceptar'));
		await userEvent.keyboard('{Escape}');
		await userEvent.click(button('Abrir'));

		expect(field()).toHaveValue('');
		// nothing wrong said yet: it was not sent this time
		expect(field()).not.toHaveAttribute('aria-invalid');
	});
});

describe(useDialogs, () => {
	const answers: unknown[] = [];

	const Asker = ({
		ask,
	}: {
		ask: (dialogs: Dialogs) => Promise<unknown>;
	}) => {
		const dialogs = useDialogs();

		return (
			<button
				onClick={async () => {
					answers.push(await ask(dialogs));
				}}
				type='button'
			>
				Preguntar
			</button>
		);
	};

	const ask = async (question: (dialogs: Dialogs) => Promise<unknown>) => {
		render(
			<DialogsProvider>
				<Asker ask={question} />
			</DialogsProvider>,
		);
		await userEvent.click(button('Preguntar'));
	};

	// hooks
	afterEach(() => {
		cleanup();
		answers.length = 0;
	});

	// tests
	test('throws outside of its provider', () => {
		const error = vi.spyOn(console, 'error').mockImplementation(vi.fn());

		expect(() => renderHook(() => useDialogs())).toThrow(
			UiContextException,
		);

		error.mockRestore();
	});

	test('shows a notice and resolves once it was read', async () => {
		await ask(({ alert }) =>
			alert({
				closeLabel: 'Cerrar',
				message: 'Vuelva a intentarlo más tarde.',
				title: 'No se pudo enviar',
				tone: 'danger',
			}),
		);

		expect(
			screen.getByRole('alertdialog', { name: 'No se pudo enviar' }),
		).toHaveAccessibleDescription('Vuelva a intentarlo más tarde.');
		expect(answers).toStrictEqual([]);

		await userEvent.click(button('Cerrar'));

		expect(answers).toHaveLength(1);
		expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
		expect(button('Preguntar')).toHaveFocus();
	});

	test('confirms what is irreversible only with its text typed', async () => {
		await ask(({ confirm }) =>
			confirm({
				confirmLabel: 'Eliminar',
				requireText: 'Ana',
				title: 'Eliminar a Ana',
				tone: 'danger',
			}),
		);

		expect(button('Eliminar')).toBeDisabled();

		await userEvent.keyboard('ana');
		await userEvent.click(button('Eliminar'));

		expect(answers).toStrictEqual([true]);
	});

	test('resolves with the answer chosen', async () => {
		await ask(({ choose }) =>
			choose({
				message: 'Si sale ahora, se pierden.',
				title: 'Hay cambios sin guardar',
				options: [
					{ label: 'Descartar', tone: 'danger', value: 'discard' },
					{ label: 'Guardar', value: 'save' },
				],
			}),
		);

		await userEvent.click(button('Descartar'));

		expect(answers).toStrictEqual(['discard']);
		expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
	});

	test('resolves with the text typed', async () => {
		await ask(({ prompt }) =>
			prompt({ label: 'Motivo', required: true, title: 'Rechazar' }),
		);

		await userEvent.keyboard('Fuera de plazo{Enter}');

		expect(answers).toStrictEqual(['Fuera de plazo']);
		expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
	});

	test.each([
		{ cancelled: undefined, name: 'a choice', question: 'choose' },
		{ cancelled: undefined, name: 'a text', question: 'prompt' },
		{ cancelled: false, name: 'a confirmation', question: 'confirm' },
	] as const)(
		'resolves $cancelled when $name is cancelled',
		async ({ cancelled, question }) => {
			await ask((dialogs) =>
				dialogs[question]({
					label: 'Motivo',
					options: [],
					title: 'Pregunta',
				}),
			);

			await userEvent.keyboard('{Escape}');

			expect(answers).toStrictEqual([cancelled]);
		},
	);

	test('keeps each question open until it is answered, one kind after another', async () => {
		const Asker = () => {
			const { alert, choose, prompt } = useDialogs();

			return (
				<>
					<button
						onClick={() => alert({ title: 'Aviso' })}
						type='button'
					>
						Avisar
					</button>
					<button
						onClick={() =>
							choose({
								options: [{ label: 'Sí', value: 'yes' }],
								title: 'Elección',
							})
						}
						type='button'
					>
						Elegir
					</button>
					<button
						onClick={() =>
							prompt({ label: 'Motivo', title: 'Texto' })
						}
						type='button'
					>
						Pedir
					</button>
				</>
			);
		};

		// as in development: a dialog mounted already open has its effects run twice
		render(
			<StrictMode>
				<DialogsProvider>
					<Asker />
				</DialogsProvider>
			</StrictMode>,
		);

		await userEvent.click(button('Avisar'));
		await userEvent.click(button('Entendido'));
		await userEvent.click(button('Elegir'));

		expect(
			screen.getByRole('alertdialog', { name: 'Elección' }),
		).toHaveAttribute('open');

		await userEvent.click(button('Sí'));
		await userEvent.click(button('Pedir'));

		expect(screen.getByRole('dialog', { name: 'Texto' })).toHaveAttribute(
			'open',
		);

		await userEvent.keyboard('{Escape}');
		await userEvent.click(button('Elegir'));

		expect(
			screen.getByRole('alertdialog', { name: 'Elección' }),
		).toHaveAttribute('open');
	});

	test('cancels a question that another one replaces', async () => {
		await ask(({ alert, choose, prompt }) =>
			Promise.all([
				choose({
					options: [{ label: 'Sí', value: 'yes' }],
					title: 'Primera',
				}),
				prompt({ label: 'Motivo', title: 'Segunda' }),
				alert({ title: 'Tercera' }),
			]),
		);

		// only the last one is on screen
		expect(
			screen.getByRole('alertdialog', { name: 'Tercera' }),
		).toBeVisible();

		await userEvent.click(button('Entendido'));

		expect(answers).toStrictEqual([[undefined, undefined, true]]);
	});
});
