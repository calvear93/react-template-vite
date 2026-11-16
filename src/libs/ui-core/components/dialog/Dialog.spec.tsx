import { act, cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { StrictMode, useState } from 'react';
import { afterEach, describe, expect, test, vi } from 'vitest';
import { mockAnimations } from '../../__mocks__/animations.mock.ts';
import { inChile } from '../../__mocks__/locale.mock.ts';
import { Dialog, type DialogProps, FormDialog } from './Dialog.tsx';

inChile();

const Harness = ({
	onOpenChange,
	...props
}: Partial<DialogProps> & { onOpenChange?: (open: boolean) => void }) => {
	const [isOpen, setIsOpen] = useState(false);

	return (
		<>
			<button onClick={() => setIsOpen(true)} type='button'>
				Abrir
			</button>
			<Dialog
				onOpenChange={(open) => {
					onOpenChange?.(open);
					setIsOpen(open);
				}}
				open={isOpen}
				title='Detalle del folio'
				{...props}
			/>
		</>
	);
};

const open = () =>
	userEvent.click(screen.getByRole('button', { name: 'Abrir' }));

describe(Dialog, () => {
	// hooks
	afterEach(cleanup);

	// tests
	test('renders nothing while it is closed', () => {
		render(<Harness />);

		expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
	});

	test('opens as a modal dialog named by its title and described by its description', async () => {
		render(
			<Harness
				className='extra'
				description='Emitido el 02-11-2026'
				footer={<button type='button'>Entendido</button>}
			>
				Contenido
			</Harness>,
		);

		await open();

		const dialog = screen.getByRole('dialog', {
			name: 'Detalle del folio',
		});

		expect(dialog).toHaveAttribute('open');
		expect(dialog).toHaveAccessibleDescription('Emitido el 02-11-2026');
		expect(
			within(dialog).getByRole('heading', { level: 2 }),
		).toHaveTextContent('Detalle del folio');
		expect(within(dialog).getByText('Contenido')).toBeInTheDocument();
		expect(
			within(dialog).getByRole('button', { name: 'Entendido' }),
		).toBeInTheDocument();
	});

	test.each(['sm', 'md', 'lg'] as const)(
		'puts the focus on its first field and gives it back when it closes (%s)',
		async (size) => {
			render(
				<Harness size={size}>
					<input aria-label='Nombre' />
				</Harness>,
			);

			await open();

			expect(
				screen.getByRole('textbox', { name: 'Nombre' }),
			).toHaveFocus();

			await userEvent.click(
				screen.getByRole('button', { name: 'Cerrar' }),
			);

			expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
			expect(screen.getByRole('button', { name: 'Abrir' })).toHaveFocus();
		},
	);

	test('takes the focus itself when it has no field', async () => {
		render(<Harness>Solo texto</Harness>);

		await open();

		expect(screen.getByRole('dialog')).toHaveFocus();
	});

	test('asks to close with Escape', async () => {
		const onOpenChange = vi.fn();

		render(<Harness onOpenChange={onOpenChange} />);

		await open();
		await userEvent.keyboard('{Escape}');

		expect(onOpenChange).toHaveBeenCalledExactlyOnceWith(false);
		expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
	});

	test('asks to close when the browser requests it or closes it', async () => {
		const onOpenChange = vi.fn();

		render(<Harness onOpenChange={onOpenChange} />);

		await open();

		const cancel = new Event('cancel', { cancelable: true });

		screen.getByRole('dialog').dispatchEvent(cancel);

		expect(cancel.defaultPrevented).toBe(true);
		expect(onOpenChange).toHaveBeenCalledExactlyOnceWith(false);
	});

	test('asks to close from its veil, unless told not to', async () => {
		const onOpenChange = vi.fn();
		const { rerender } = render(
			<Dialog onOpenChange={onOpenChange} open title='Aviso' />,
		);

		await userEvent.click(screen.getByRole('dialog'));

		expect(onOpenChange).toHaveBeenCalledExactlyOnceWith(false);

		rerender(
			<Dialog
				dismissOnVeil={false}
				onOpenChange={onOpenChange}
				open
				title='Aviso'
			/>,
		);

		await userEvent.click(screen.getByRole('dialog'));

		expect(onOpenChange).toHaveBeenCalledOnce();
	});

	test('stays open when a press that started inside ends on its veil', async () => {
		const onOpenChange = vi.fn();

		render(
			<Dialog onOpenChange={onOpenChange} open title='Aviso'>
				<p>Texto que alguien selecciona</p>
			</Dialog>,
		);

		// a text selection dragged out of the panel: the click lands on the veil
		await userEvent.pointer([
			{
				keys: '[MouseLeft>]',
				target: screen.getByText('Texto que alguien selecciona'),
			},
			{ keys: '[/MouseLeft]', target: screen.getByRole('dialog') },
		]);

		expect(onOpenChange).not.toHaveBeenCalled();
	});

	test('cannot be closed while it is locked, even by the browser', async () => {
		const onOpenChange = vi.fn();

		render(
			<Dialog
				locked
				onOpenChange={onOpenChange}
				open
				title='Guardando'
			/>,
		);

		const dialog = screen.getByRole<HTMLDialogElement>('dialog');

		await userEvent.keyboard('{Escape}');
		await userEvent.click(screen.getByRole('dialog'));

		expect(screen.getByRole('button', { name: 'Cerrar' })).toBeDisabled();

		dialog.close();
		dialog.dispatchEvent(new Event('close'));

		expect(dialog).toHaveAttribute('open');
		expect(onOpenChange).not.toHaveBeenCalled();
	});

	test('stays open when it is mounted already open, its effects run twice', () => {
		const onOpenChange = vi.fn();

		// StrictMode mounts, unmounts and mounts again: the close of that clean-up is its own
		render(
			<StrictMode>
				<Dialog onOpenChange={onOpenChange} open title='Aviso' />
			</StrictMode>,
		);

		expect(screen.getByRole('dialog')).toHaveAttribute('open');
		expect(onOpenChange).not.toHaveBeenCalled();
	});

	test('tells its parent when the browser closed it', () => {
		const onOpenChange = vi.fn();

		render(<Dialog onOpenChange={onOpenChange} open title='Aviso' />);

		// as the browser does: the dialog is closed, and then it says so
		screen.getByRole<HTMLDialogElement>('dialog').close();

		expect(onOpenChange).toHaveBeenCalledExactlyOnceWith(false);
	});

	describe('where a dialog says it closed later, as a browser does', () => {
		// happy-dom fires `close` inside close(); a browser queues it: the dialog is closed
		// first, and says so once the code that closed it has ended
		const deferClose = () => {
			const closed: HTMLDialogElement[] = [];

			vi.spyOn(HTMLDialogElement.prototype, 'close').mockImplementation(
				function close(this: HTMLDialogElement) {
					this.removeAttribute('open');
					closed.push(this);
				},
			);

			return () =>
				act(() => {
					for (const dialog of closed.splice(0))
						dialog.dispatchEvent(new Event('close'));
				});
		};

		afterEach(() => vi.restoreAllMocks());

		test('stays open when it is mounted already open, its effects run twice', () => {
			const sayClosed = deferClose();
			const onOpenChange = vi.fn();

			render(
				<StrictMode>
					<Dialog onOpenChange={onOpenChange} open title='Aviso' />
				</StrictMode>,
			);
			sayClosed();

			expect(screen.getByRole('dialog')).toHaveAttribute('open');
			expect(onOpenChange).not.toHaveBeenCalled();
		});

		test('tells its parent once of a close it asked for, not again when the dialog says so', async () => {
			const sayClosed = deferClose();
			const onOpenChange = vi.fn();

			render(<Harness onOpenChange={onOpenChange} />);
			await open();
			await userEvent.keyboard('{Escape}');
			sayClosed();

			expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
			expect(onOpenChange).toHaveBeenCalledExactlyOnceWith(false);
		});

		test('does not show again a locked dialog its parent closed', () => {
			const sayClosed = deferClose();
			const onOpenChange = vi.fn();
			const { rerender } = render(
				<Dialog
					locked
					onOpenChange={onOpenChange}
					open
					title='Aviso'
				/>,
			);
			const dialog = screen.getByRole<HTMLDialogElement>('dialog');
			const showModal = vi.spyOn(dialog, 'showModal');

			rerender(
				<Dialog
					locked
					onOpenChange={onOpenChange}
					open={false}
					title='Aviso'
				/>,
			);
			sayClosed();

			expect(showModal).not.toHaveBeenCalled();
			expect(onOpenChange).not.toHaveBeenCalled();
			expect(dialog).not.toBeInTheDocument();
		});

		test('still tells its parent when the browser closed it', () => {
			const sayClosed = deferClose();
			const onOpenChange = vi.fn();

			render(<Dialog onOpenChange={onOpenChange} open title='Aviso' />);
			screen.getByRole<HTMLDialogElement>('dialog').close();

			expect(onOpenChange).not.toHaveBeenCalled();

			sayClosed();

			expect(onOpenChange).toHaveBeenCalledExactlyOnceWith(false);
		});

		test('does not take for its own the close of the browser that follows one that never said so', () => {
			const sayClosed = deferClose();
			const onOpenChange = vi.fn();
			const view = (isOpen: boolean) => (
				<Dialog
					onOpenChange={onOpenChange}
					open={isOpen}
					title='Aviso'
				/>
			);
			const { rerender } = render(view(true));

			// closed by its parent: the dialog leaves the page before it can say it closed
			rerender(view(false));
			rerender(view(true));
			sayClosed();

			// the browser closes the new one: that is told
			screen.getByRole<HTMLDialogElement>('dialog').close();
			sayClosed();

			expect(onOpenChange).toHaveBeenCalledExactlyOnceWith(false);
		});
	});

	test('calls the close and cancel handlers it is given, besides its own', () => {
		const onCancel = vi.fn();
		const onClose = vi.fn();
		const onOpenChange = vi.fn();

		render(
			<Dialog
				onCancel={onCancel}
				onClose={onClose}
				onOpenChange={onOpenChange}
				open
				title='Aviso'
			/>,
		);

		const dialog = screen.getByRole<HTMLDialogElement>('dialog');

		act(() => {
			dialog.dispatchEvent(new Event('cancel', { cancelable: true }));
		});

		expect(onCancel).toHaveBeenCalledOnce();
		expect(onOpenChange).toHaveBeenCalledExactlyOnceWith(false);

		act(() => dialog.close());

		expect(onClose).toHaveBeenCalledOnce();
	});

	test('leaves Escape to what handled it inside, and runs its own key handler', async () => {
		const onOpenChange = vi.fn();
		const onKeyDown = vi.fn();

		render(
			<Dialog
				onKeyDown={onKeyDown}
				onOpenChange={onOpenChange}
				open
				title='Aviso'
			>
				<input
					aria-label='Buscar'
					onKeyDown={(event) => event.preventDefault()}
				/>
			</Dialog>,
		);

		await userEvent.keyboard('{Escape}');

		expect(onKeyDown).toHaveBeenCalledOnce();
		expect(onOpenChange).not.toHaveBeenCalled();
	});
});

describe(FormDialog, () => {
	const renderForm = (onSubmit: (data: FormData) => Promise<unknown>) => {
		const onOpenChange = vi.fn();

		render(
			<FormDialog
				errorTitle='No se agregó el trabajador'
				formProps={{ 'aria-label': 'Trabajador' }}
				onOpenChange={onOpenChange}
				onSubmit={onSubmit}
				open
				submitLabel='Agregar trabajador'
				title='Agregar trabajador'
			>
				<input aria-label='Nombre' name='name' />
			</FormDialog>,
		);

		return onOpenChange;
	};

	// hooks
	afterEach(cleanup);

	// tests
	test('sends the data of its form and closes when it is saved', async () => {
		const onSubmit = vi.fn<(data: FormData) => Promise<void>>(async () => {
			// saved
		});
		const onOpenChange = renderForm(onSubmit);

		await userEvent.type(
			screen.getByRole('textbox', { name: 'Nombre' }),
			'Ana',
		);
		await userEvent.click(
			screen.getByRole('button', { name: 'Agregar trabajador' }),
		);

		expect(onSubmit.mock.calls[0][0].get('name')).toBe('Ana');
		expect(onOpenChange).toHaveBeenCalledExactlyOnceWith(false);
		expect(screen.queryByRole('alert')).not.toBeInTheDocument();
	});

	test('cannot be closed while it saves, and its button is busy', async () => {
		const saving = Promise.withResolvers<undefined>();
		const onOpenChange = renderForm(() => saving.promise);

		await userEvent.click(
			screen.getByRole('button', { name: 'Agregar trabajador' }),
		);

		expect(
			screen.getByRole('button', { name: 'Agregar trabajador' }),
		).toHaveAttribute('aria-busy', 'true');
		expect(screen.getByRole('button', { name: 'Cancelar' })).toBeDisabled();

		await userEvent.keyboard('{Escape}');

		expect(onOpenChange).not.toHaveBeenCalled();

		saving.resolve(undefined);

		await vi.waitFor(() =>
			expect(onOpenChange).toHaveBeenCalledExactlyOnceWith(false),
		);
	});

	test('shows the error inside and stays open, keeping what was typed', async () => {
		const onOpenChange = renderForm(() =>
			Promise.reject(new Error('El RUT ya está registrado')),
		);

		await userEvent.type(
			screen.getByRole('textbox', { name: 'Nombre' }),
			'Ana',
		);
		await userEvent.click(
			screen.getByRole('button', { name: 'Agregar trabajador' }),
		);

		await expect(screen.findByRole('alert')).resolves.toHaveTextContent(
			'No se agregó el trabajadorEl RUT ya está registrado',
		);
		expect(onOpenChange).not.toHaveBeenCalled();
		expect(screen.getByRole('textbox', { name: 'Nombre' })).toHaveValue(
			'Ana',
		);
		expect(screen.getByRole('button', { name: 'Cancelar' })).toBeEnabled();
	});

	test('cancels from its button', async () => {
		const onOpenChange = renderForm(vi.fn());

		await userEvent.click(screen.getByRole('button', { name: 'Cancelar' }));

		expect(onOpenChange).toHaveBeenCalledExactlyOnceWith(false);
	});

	test('stays for the moment its way out takes, then gives the focus back', async () => {
		const animations = mockAnimations();

		render(<Harness />);
		await open();
		await userEvent.keyboard('{Escape}');

		const dialog = screen.getByRole('dialog');

		expect(dialog).toHaveAttribute('data-leaving');
		// still modal: the focus has not gone back yet
		expect(screen.getByRole('button', { name: 'Abrir' })).not.toHaveFocus();

		await act(() => animations.finish());

		expect(dialog).not.toBeInTheDocument();
		expect(screen.getByRole('button', { name: 'Abrir' })).toHaveFocus();
	});
});
