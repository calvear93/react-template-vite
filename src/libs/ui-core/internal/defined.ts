/**
 * What was given of an object of optional values: its entries that are not
 * `undefined`. It is how a component puts the texts it is given over its own:
 * `{ ...LABELS, ...labels }` lets one given as `undefined` take the place of its
 * default (the type of an optional property allows it, and a conditional gives it:
 * `{ min: isStrict ? strict : undefined }`), and a text that is not there is a button
 * with no name, or a function that is not one when it is called.
 *
 * @example
 * ```ts
 * const texts = { ...DIALOG_LABELS, ...defined(labels) };
 * ```
 *
 * @param value - the values given, if any
 *
 * @returns those that are not `undefined`
 */
export const defined = <T extends object>(value: T | undefined) =>
	Object.fromEntries(
		Object.entries(value ?? {}).filter(([, item]) => item !== undefined),
	) as T;
