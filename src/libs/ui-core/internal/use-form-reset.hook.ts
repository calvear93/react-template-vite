import { type RefObject, useEffect, useRef } from 'react';

/**
 * Tells a control that its form was reset. A native control goes back to its
 * first value by itself; one that keeps its text in state (InputRut, DatePicker,
 * Combobox) has to be told, or a «Clear» button would leave it as it is.
 *
 * @example
 * ```ts
 * useFormReset(input, () => setText(initialText));
 * ```
 *
 * @param control - an element of the form (the visible input or button of the control)
 * @param onReset - what puts the control back to its first value
 */
export const useFormReset = (
	control: RefObject<HTMLButtonElement | HTMLInputElement | null>,
	onReset: () => void,
) => {
	const latest = useRef(onReset);

	// the form calls the function of the last render
	useEffect(() => {
		latest.current = onReset;
	});

	useEffect(() => {
		const form = control.current?.form;

		if (!form) return;

		const handleReset = () => latest.current();

		form.addEventListener('reset', handleReset);

		return () => form.removeEventListener('reset', handleReset);
	}, [control]);
};
