import { useSyncExternalStore } from 'react';
import { dismissToast, toast } from '../components/toast/toast.store.ts';
import { type UiTexts } from '../i18n/en.ts';

/**
 * How long the code waits for the browser to be idle before it is fetched all the
 * same, in milliseconds; where the browser cannot tell when it is idle, how long
 * it waits.
 */
const IDLE_TIMEOUT = 2000;
/** The paint that first shows something of the page, as the browser names it. */
const FIRST_PAINT = 'first-contentful-paint';

/** The stylesheets that did not arrive since the first load of a part. */
const lost = new Set<HTMLLinkElement>();
let isWatching = false;
/** The stylesheets asked for again, on their way. */
let recovery: Promise<unknown> = Promise.resolve();
let told: number | undefined;

const note = ({ target }: Event) => {
	if (target instanceof HTMLLinkElement && target.rel === 'stylesheet')
		lost.add(target);
};

/** Asks for a stylesheet again, in its place; settles when it arrived, or failed again. */
const reload = (link: HTMLLinkElement) =>
	new Promise<void>((resolve) => {
		const fresh = document.createElement('link');

		for (const { name, value } of link.attributes)
			fresh.setAttribute(name, value);

		fresh.addEventListener('load', () => resolve());
		fresh.addEventListener('error', () => resolve());
		link.replaceWith(fresh);
	});

/**
 * A bundler asks for the stylesheet of a chunk once (the preload helper of Vite
 * remembers it, arrived or not): after a load that failed offline, the code would
 * come back without its styles. Each stylesheet that failed is asked for again
 * before the code is, and waited for; one that fails again does not hold the code.
 */
const recoverStylesheets = () => {
	const links = [...lost].filter((link) => link.isConnected);

	lost.clear();
	recovery = Promise.all([recovery, ...links.map(reload)]);

	return recovery;
};

/** Runs a task at the next idle moment of the browser; returns what calls it off. */
const onceIdle = (task: () => void) => {
	if ('requestIdleCallback' in globalThis) {
		const id = requestIdleCallback(task, { timeout: IDLE_TIMEOUT });

		return () => cancelIdleCallback(id);
	}

	const id = setTimeout(task, IDLE_TIMEOUT);

	return () => clearTimeout(id);
};

/**
 * Runs a task once the page had its first contentful paint and the browser is
 * idle. An idle moment alone can come before that paint is on screen, while the
 * page waits for its frame; a browser that does not tell of its paints is taken at
 * its idle moment.
 *
 * @param task - what to run
 *
 * @returns the function that calls it off
 */
const whenIdle = (task: () => void) => {
	// a browser with no observer, or one that does not list what it observes, is
	// taken at its idle moment too
	if (
		typeof PerformanceObserver === 'undefined' ||
		!PerformanceObserver.supportedEntryTypes?.includes('paint')
	)
		return onceIdle(task);

	let cancelIdle: (() => void) | undefined;

	const observer = new PerformanceObserver((paints) => {
		if (paints.getEntriesByName(FIRST_PAINT).length === 0) return;

		observer.disconnect();
		cancelIdle = onceIdle(task);
	});

	// buffered: a paint that already happened is told as well
	observer.observe({ buffered: true, type: 'paint' });

	return () => {
		observer.disconnect();
		cancelIdle?.();
	};
};

/**
 * A part of the kit that is not on the first screen (a dialog, a window) and is
 * fetched when it is needed, or ahead once the page is painted and the browser is
 * idle: its code and its styles stay out of what the first paint waits for. Unlike
 * `lazy()`, nothing suspends: who needs the part reads it with `useOnDemand()`,
 * draws nothing until it is there, and decides what a failed load means. Its
 * modules are named in `../vite/on-demand.modules.ts`, so that the build puts them
 * in a chunk of their own (and fails when one is missing).
 *
 * @example
 * ```tsx
 * const WINDOW = onDemand(() => import('./Window.tsx'));
 *
 * const loaded = useOnDemand(WINDOW);
 *
 * useEffect(() => WINDOW.prefetch(), []);
 *
 * return loaded ? <loaded.Window /> : null;
 * ```
 *
 * @param importer - the dynamic import of the part
 *
 * @returns the part: what it loaded so far, and the functions that load it
 */
export const onDemand = <Part>(
	importer: () => Promise<Part>,
): OnDemand<Part> => {
	const listeners = new Set<() => void>();
	let loaded: Part | undefined;
	let pending: Promise<Part> | undefined;

	const arrive = async () => {
		try {
			await recoverStylesheets();

			if (!isWatching) {
				isWatching = true;
				// the error of a stylesheet does not bubble: it is heard on its way down
				document.addEventListener('error', note, true);
			}

			loaded = await importer();
		} catch (error) {
			// a load that failed is not kept: the next one asks again
			pending = undefined;

			throw error;
		}

		for (const listener of listeners) listener();

		return loaded;
	};

	const load = () => {
		pending ??= arrive();

		return pending;
	};

	const ahead = async () => {
		try {
			await load();
		} catch {
			// nobody asked for it yet: who does will load it again, and be told
		}
	};

	return {
		load,
		peek: () => loaded,
		prefetch: () => {
			// loaded, or on its way: nothing to fetch ahead, and nothing to call off
			const cancel = pending ? undefined : whenIdle(() => void ahead());

			return () => cancel?.();
		},
		subscribe: (listener) => {
			listeners.add(listener);

			return () => {
				listeners.delete(listener);
			};
		},
	};
};

/**
 * What a part loaded on demand brought, for a component: nothing until it arrives,
 * and the component is drawn again when it does.
 *
 * @param source - the part
 *
 * @returns what it loaded, or nothing yet
 */
export const useOnDemand = <Part>(source: OnDemand<Part>) =>
	useSyncExternalStore(source.subscribe, source.peek);

/**
 * Tells the person that a part of the application could not be loaded (offline,
 * or a release that replaced the one in the page). One toast, however often it
 * failed.
 *
 * @param texts - what the toast says, in the language of the page
 */
export const tellNotLoaded = ({ failed, failedHint }: UiTexts['onDemand']) => {
	if (told !== undefined) dismissToast(told);

	told = toast(failed, { description: failedHint, tone: 'danger' });
};

export interface OnDemand<Part> {
	/**
	 * Loads the part, once: every call gets the same answer. A load that failed is
	 * forgotten, and the next call asks again.
	 */
	load: () => Promise<Part>;
	/** What it loaded, or nothing while it has not. */
	peek: () => Part | undefined;
	/**
	 * Loads it once the page is painted and the browser is idle, in silence; returns
	 * the function that calls that off.
	 */
	prefetch: () => () => void;
	/** Listens to its arrival; returns the function that stops listening. */
	subscribe: (listener: () => void) => () => void;
}
