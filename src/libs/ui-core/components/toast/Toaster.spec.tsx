import {
	act,
	cleanup,
	fireEvent,
	render,
	screen,
	within,
} from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { mockAnimations } from '../../__mocks__/animations.mock.ts';
import { dismissToast, getToasts, toast } from './toast.store.ts';
import { Toaster } from './Toaster.tsx';

describe(Toaster, () => {
	// hooks
	beforeEach(() => {
		vi.useFakeTimers();
	});

	afterEach(() => {
		cleanup();
		act(() => {
			dismissToast();
		});
		vi.useRealTimers();
	});

	// tests
	test('is a named region that starts empty, each toast announcing itself', () => {
		render(<Toaster label='Notificaciones' />);

		const region = screen.getByRole('region', { name: 'Notificaciones' });

		// a live region around live toasts would say each one twice
		expect(region).not.toHaveAttribute('aria-live');
		expect(region).toBeEmptyDOMElement();
	});

	test.each(['info', 'success', 'warning'] as const)(
		'shows a %s toast as a status with its message and description',
		(tone) => {
			render(<Toaster />);

			act(() => {
				toast('Cambios guardados', {
					description: 'Se notificó al trabajador',
					tone,
				});
			});

			expect(screen.getByRole('status')).toHaveTextContent(
				'Cambios guardadosSe notificó al trabajador',
			);
		},
	);

	test('announces a danger toast at once', () => {
		render(<Toaster position='bottom-left' />);

		act(() => {
			toast('No se pudo enviar', { tone: 'danger' });
		});

		expect(screen.getByRole('alert')).toHaveTextContent(
			'No se pudo enviar',
		);
	});

	test('takes a toast away by itself after its time', () => {
		render(<Toaster />);

		act(() => {
			toast('Listo');
			toast('Rápido', { duration: 1000 });
		});

		act(() => {
			vi.advanceTimersByTime(1000);
		});

		expect(screen.getByRole('status')).toHaveTextContent('Listo');

		act(() => {
			vi.advanceTimersByTime(3500);
		});

		expect(screen.queryByRole('status')).not.toBeInTheDocument();
	});

	test('keeps an error until it is closed, unless it is given a time', () => {
		render(<Toaster />);

		act(() => {
			toast('No se pudo guardar', { tone: 'danger' });
			toast('No se pudo enviar', { duration: 1000, tone: 'danger' });
		});
		act(() => {
			vi.advanceTimersByTime(60_000);
		});

		expect(screen.getByText('No se pudo guardar')).toBeInTheDocument();
		expect(screen.queryByText('No se pudo enviar')).not.toBeInTheDocument();
	});

	test('keeps a toast without a duration until it is closed', () => {
		render(<Toaster closeLabel='Quitar aviso' />);

		act(() => {
			toast('Sesión por expirar', { duration: 0 });
		});
		act(() => {
			vi.advanceTimersByTime(60_000);
		});

		fireEvent.click(
			within(screen.getByRole('status')).getByRole('button', {
				name: 'Quitar aviso',
			}),
		);

		expect(screen.queryByRole('status')).not.toBeInTheDocument();
	});

	test.each([
		{ enter: 'mouseEnter', how: 'the pointer', leave: 'mouseLeave' },
		{ enter: 'focus', how: 'the focus', leave: 'blur' },
	] as const)(
		'stops its countdown while $how is on it, and starts it over after',
		({ enter, leave }) => {
			render(<Toaster />);

			act(() => {
				toast('Guardado', { duration: 1000 });
			});

			const item = screen.getByRole('status');
			const target =
				enter === 'focus' ? within(item).getByRole('button') : item;

			act(() => {
				vi.advanceTimersByTime(900);
			});
			fireEvent[enter](target);
			act(() => {
				vi.advanceTimersByTime(5000);
			});

			expect(item).toBeInTheDocument();

			fireEvent[leave](target);
			act(() => {
				vi.advanceTimersByTime(999);
			});

			expect(item).toBeInTheDocument();

			act(() => {
				vi.advanceTimersByTime(1);
			});

			expect(item).not.toBeInTheDocument();
		},
	);

	test('dismisses one toast by its id, or all of them', () => {
		render(<Toaster />);

		let first = 0;

		act(() => {
			first = toast('Uno', { duration: 0 });
			toast('Dos', { duration: 0 });
			toast('Tres', { duration: 0 });
		});

		expect(getToasts()).toHaveLength(3);

		act(() => {
			dismissToast(first);
		});

		expect(
			screen.getAllByRole('status').map((item) => item.textContent),
		).toStrictEqual(['Dos', 'Tres']);

		act(() => {
			dismissToast();
		});

		expect(screen.queryByRole('status')).not.toBeInTheDocument();
	});

	test('keeps a dismissed toast in its place for the moment its way out takes', async () => {
		const animations = mockAnimations();

		render(<Toaster />);

		let first = 0;

		act(() => {
			first = toast('Uno', { duration: 0 });
			toast('Dos', { duration: 0 });
		});
		act(() => {
			dismissToast(first);
			toast('Tres', { duration: 0 });
		});

		// out of the store, still on the screen where it was, the new one after them
		expect(getToasts()).toHaveLength(2);
		expect(
			screen.getAllByRole('status').map((item) => item.textContent),
		).toStrictEqual(['Uno', 'Dos', 'Tres']);
		expect(screen.getAllByRole('status')[0]).toHaveAttribute(
			'data-leaving',
		);

		await act(() => animations.finish());

		expect(
			screen.getAllByRole('status').map((item) => item.textContent),
		).toStrictEqual(['Dos', 'Tres']);
	});
});
