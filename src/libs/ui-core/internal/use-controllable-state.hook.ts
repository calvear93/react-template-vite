import { useState } from 'react';

/**
 * State that the parent may own. With `value` the component is controlled (the
 * parent holds the state and `onChange` asks it to change); without it, the
 * component keeps its own, starting at `defaultValue`.
 *
 * @example
 * ```ts
 * const [isOpen, setIsOpen] = useControllableState({
 *   defaultValue: defaultOpen,
 *   value: open,
 *   onChange: onOpenChange,
 * });
 * ```
 *
 * @param options - the controlled value, the uncontrolled start and the change listener
 *
 * @returns the current value and its setter
 */
export const useControllableState = <T>({
	defaultValue,
	onChange,
	value,
}: {
	defaultValue: T;
	value: T | undefined;
	onChange?: (value: T) => void;
}) => {
	const [internal, setInternal] = useState(defaultValue);
	const isControlled = value !== undefined;

	const set = (next: T) => {
		if (!isControlled) setInternal(next);

		onChange?.(next);
	};

	return [isControlled ? value : internal, set] as const;
};
