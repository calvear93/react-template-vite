import { type ReactNode } from 'react';
import { type Tone } from '../../internal/tone.ts';

/** A toast on screen. */
export interface ToastItem {
	id: number;
	/** Milliseconds on screen; 0 keeps it until it is closed. */
	duration: number;
	message: ReactNode;
	tone: Exclude<Tone, 'neutral'>;
	description?: ReactNode;
}

export interface ToastOptions {
	/** A second line under the message. */
	description?: ReactNode;
	/** Milliseconds on screen (default 4500); 0 keeps it until it is closed. */
	duration?: number;
	tone?: ToastItem['tone'];
}

const listeners = new Set<() => void>();
let items: readonly ToastItem[] = [];
let lastId = 0;

const emit = (next: readonly ToastItem[]) => {
	items = next;

	for (const listener of listeners) listener();
};

/**
 * A short confirmation in the corner that goes by itself: something was done. A
 * `danger` one stays until it is closed (give it a `duration` to change that).
 * Callable from anywhere (a handler, a service): the Toaster of UiProvider shows
 * it. What must be read before going on is an Alert, and the error of a dialog
 * goes inside the dialog: a toast under a modal cannot be reached.
 *
 * @example
 * ```ts
 * toast('Changes saved', { tone: 'success' });
 * toast('Could not send', { tone: 'danger', description: 'Check your connection' });
 * ```
 *
 * @param message - what happened
 * @param options - the tone (info by default), a second line and how long it stays
 *
 * @returns the id of the toast, to dismiss it
 */
export const toast = (
	message: ReactNode,
	{ description, duration, tone = 'info' }: ToastOptions = {},
) => {
	const id = ++lastId;

	emit([
		...items,
		{
			id,
			description,
			// an error is read at the person's pace: it stays until it is closed
			duration: duration ?? (tone === 'danger' ? 0 : 4500),
			message,
			tone,
		},
	]);

	return id;
};

/**
 * Takes a toast away, or all of them.
 *
 * @param id - the toast to dismiss; without it, every toast
 */
export const dismissToast = (id?: number) => {
	emit(id === undefined ? [] : items.filter((item) => item.id !== id));
};

/**
 * The toasts on screen: the same array until one comes or goes.
 *
 * @returns the current toasts, oldest first
 */
export const getToasts = () => items;

/**
 * Listens to the toasts that come and go.
 *
 * @param listener - called after each change
 *
 * @returns the function that stops listening
 */
export const subscribeToasts = (listener: () => void) => {
	listeners.add(listener);

	return () => {
		listeners.delete(listener);
	};
};
