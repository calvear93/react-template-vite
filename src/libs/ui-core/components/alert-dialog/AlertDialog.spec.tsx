import { cleanup, render, renderHook, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { afterEach, describe, expect, test, vi } from 'vitest';
import { inChile } from '../../__mocks__/locale.mock.ts';
import { UiContextException } from '../../exceptions/ui-context.exception.ts';
import { AlertDialog } from './AlertDialog.tsx';
import { type ConfirmOptions } from './dialogs.context.ts';
import { useConfirm } from './dialogs.hook.ts';
import { DialogsProvider } from './Dialogs.provider.tsx';

inChile();

describe(AlertDialog, () => {
	const renderDialog = (props = {}) => {
		const handlers = {
			onCancel: vi.fn(),
			onConfirm: vi.fn(),
			onOpenChange: vi.fn(),
		};

		render(
			<AlertDialog
				className='extra'
				confirmLabel='Quitar acceso'
				open
				title='¿Quitar el acceso de Ana Pérez?'
				{...handlers}
				{...props}
			>
				Dejará de ver los registros de la empresa.
			</AlertDialog>,
		);

		return handlers;
	};

	// hooks
	afterEach(cleanup);

	// tests
	test('is an alert dialog named by its question, with the focus on cancel', () => {
		renderDialog();

		const dialog = screen.getByRole('alertdialog', {
			name: '¿Quitar el acceso de Ana Pérez?',
		});

		expect(dialog).toHaveAccessibleDescription(
			'Dejará de ver los registros de la empresa.',
		);
		expect(screen.getByRole('button', { name: 'Cancelar' })).toHaveFocus();
	});

	test.each(['default', 'danger'] as const)(
		'confirms from its button and asks to close (%s)',
		async (tone) => {
			const { onCancel, onConfirm, onOpenChange } = renderDialog({
				tone,
			});

			await userEvent.click(
				screen.getByRole('button', { name: 'Quitar acceso' }),
			);

			expect(onConfirm).toHaveBeenCalledOnce();
			expect(onCancel).not.toHaveBeenCalled();
			expect(onOpenChange).toHaveBeenCalledExactlyOnceWith(false);
		},
	);

	test.each([
		{ how: 'its cancel button', act: () => userEvent.keyboard('{Enter}') },
		{ how: 'Escape', act: () => userEvent.keyboard('{Escape}') },
	])('cancels with $how', async ({ act }) => {
		const { onCancel, onConfirm, onOpenChange } = renderDialog({
			cancelLabel: 'No quitar',
		});

		await act();

		expect(onCancel).toHaveBeenCalledOnce();
		expect(onConfirm).not.toHaveBeenCalled();
		expect(onOpenChange).toHaveBeenCalledExactlyOnceWith(false);
	});

	test('is not closed by its veil', async () => {
		const { onCancel, onOpenChange } = renderDialog();

		await userEvent.click(screen.getByRole('alertdialog'));

		expect(onCancel).not.toHaveBeenCalled();
		expect(onOpenChange).not.toHaveBeenCalled();
	});

	test('works with only its question', () => {
		render(
			<AlertDialog
				onOpenChange={vi.fn()}
				open
				title='¿Salir sin guardar?'
			/>,
		);

		expect(screen.getByRole('alertdialog')).not.toHaveAttribute(
			'aria-describedby',
		);
		expect(screen.getByRole('button', { name: 'Confirmar' })).toBeEnabled();
	});
});

describe(useConfirm, () => {
	const Asker = ({ options }: { options: ConfirmOptions }) => {
		const confirm = useConfirm();
		const [answer, setAnswer] = useState('sin respuesta');

		return (
			<>
				<button
					onClick={async () =>
						setAnswer((await confirm(options)) ? 'sí' : 'no')
					}
					type='button'
				>
					Preguntar
				</button>
				<output>{answer}</output>
			</>
		);
	};

	const ask = async (options: ConfirmOptions) => {
		render(
			<DialogsProvider>
				<Asker options={options} />
			</DialogsProvider>,
		);
		await userEvent.click(
			screen.getByRole('button', { name: 'Preguntar' }),
		);
	};

	// hooks
	afterEach(cleanup);

	// tests
	test('throws outside of its provider', () => {
		const error = vi.spyOn(console, 'error').mockImplementation(vi.fn());

		expect(() => renderHook(() => useConfirm())).toThrow(
			UiContextException,
		);

		error.mockRestore();
	});

	test('opens the dialog with the question and resolves true when confirmed', async () => {
		await ask({
			confirmLabel: 'Quitar acceso',
			message: 'No se puede deshacer.',
			title: '¿Quitar el acceso?',
			tone: 'danger',
		});

		expect(
			screen.getByRole('alertdialog', { name: '¿Quitar el acceso?' }),
		).toHaveAccessibleDescription('No se puede deshacer.');

		await userEvent.click(
			screen.getByRole('button', { name: 'Quitar acceso' }),
		);

		expect(screen.getByRole('status')).toHaveTextContent('sí');
		expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
		expect(screen.getByRole('button', { name: 'Preguntar' })).toHaveFocus();
	});

	test.each([
		{ how: 'the cancel button', key: '{Enter}' },
		{ how: 'Escape', key: '{Escape}' },
	])('resolves false with $how', async ({ key }) => {
		await ask({ cancelLabel: 'Volver', title: '¿Salir sin guardar?' });

		expect(screen.getByRole('button', { name: 'Volver' })).toHaveFocus();

		await userEvent.keyboard(key);

		expect(screen.getByRole('status')).toHaveTextContent('no');
		expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
	});

	test('answers «no» to a question replaced by another', async () => {
		const answers: boolean[] = [];
		const Twice = () => {
			const confirm = useConfirm();

			return (
				<button
					onClick={async () => {
						answers.push(
							...(await Promise.all([
								confirm({ title: 'Primera' }),
								confirm({ title: 'Segunda' }),
							])),
						);
					}}
					type='button'
				>
					Dos preguntas
				</button>
			);
		};

		render(
			<DialogsProvider>
				<Twice />
			</DialogsProvider>,
		);

		await userEvent.click(
			screen.getByRole('button', { name: 'Dos preguntas' }),
		);

		expect(
			screen.getByRole('alertdialog', { name: 'Segunda' }),
		).toBeVisible();

		await userEvent.click(
			screen.getByRole('button', { name: 'Confirmar' }),
		);

		expect(answers).toStrictEqual([false, true]);
	});

	test('asks for the text with its own words when those are given as undefined', () => {
		render(
			<AlertDialog
				confirmLabel='Eliminar'
				labels={{ requireText: undefined }}
				onConfirm={vi.fn()}
				onOpenChange={vi.fn()}
				open
				requireText='ACME-0042'
				title='Eliminar la empresa'
			/>,
		);

		expect(
			screen.getByRole('textbox', {
				name: 'Escriba «ACME-0042» para confirmar',
			}),
		).toBeVisible();
	});
});
