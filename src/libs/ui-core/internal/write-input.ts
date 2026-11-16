/**
 * Puts a text in an input as its user would: the input says so with an `input`
 * event that bubbles, and the component that holds its text hears it in its
 * `onChange`, as it hears a key. For a field that takes something whole (a date
 * pasted, read apart from its keys): there is one way in, the one of what is typed.
 *
 * The text goes in through the setter of every input, not the one React puts on
 * the input it holds: that one would take the text for known, and tell of no change.
 *
 * @example
 * ```ts
 * event.preventDefault();
 * writeInput(event.currentTarget, '11/05/2026');
 * ```
 *
 * @param input - the input
 * @param text - its new text
 */
export const writeInput = (input: HTMLInputElement, text: string) => {
	Reflect.set(HTMLInputElement.prototype, 'value', text, input);
	input.dispatchEvent(new Event('input', { bubbles: true }));
};
