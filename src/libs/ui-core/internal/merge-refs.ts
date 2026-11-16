import { type Ref, type RefCallback } from 'react';

/**
 * One ref for several: a component that needs its own ref to an element and also
 * passes on the one it was given.
 *
 * @example
 * ```tsx
 * <input ref={mergeRefs(ownRef, props.ref)} />
 * ```
 *
 * @param refs - object refs, callback refs, or nothing
 *
 * @returns a callback ref that sets them all
 */
export const mergeRefs =
	<T>(...refs: (Ref<T> | undefined)[]): RefCallback<T> =>
	(node) => {
		for (const ref of refs) {
			if (typeof ref === 'function') ref(node);
			else if (ref) ref.current = node;
		}
	};
