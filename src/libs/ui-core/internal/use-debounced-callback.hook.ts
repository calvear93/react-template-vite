import { useEffect, useRef } from 'react';

/**
 * Runs a function once the calls stop: only the last call within `delay` gets
 * through. A pending call is dropped when the component unmounts.
 *
 * @example
 * ```ts
 * const search = useDebouncedCallback((text: string) => load(text), 250);
 *
 * <input onChange={(event) => search.run(event.target.value)} />
 * ```
 *
 * @param callback - what runs after the calls stop
 * @param delay - the wait, in milliseconds
 *
 * @returns `run` (schedules a call) and `cancel` (drops the pending one)
 */
export const useDebouncedCallback = <Args extends unknown[]>(
	callback: (...args: Args) => void,
	delay: number,
) => {
	const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
	const latest = useRef(callback);

	// the pending call runs the callback of the last render
	useEffect(() => {
		latest.current = callback;
	});

	useEffect(() => () => clearTimeout(timer.current), []);

	return {
		cancel: () => clearTimeout(timer.current),
		run: (...args: Args) => {
			clearTimeout(timer.current);
			timer.current = setTimeout(() => latest.current(...args), delay);
		},
	};
};
