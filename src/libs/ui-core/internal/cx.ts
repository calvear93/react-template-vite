/**
 * Joins class names, skipping what is not one.
 *
 * @example
 * ```ts
 * cx(styles.root, isActive && styles.active, className);
 * ```
 *
 * @param parts - class names, or a falsy value to skip
 *
 * @returns the class attribute, or undefined when nothing is left
 */
export const cx = (
	...parts: (string | false | null | undefined)[]
): string | undefined => parts.filter(Boolean).join(' ') || undefined;
