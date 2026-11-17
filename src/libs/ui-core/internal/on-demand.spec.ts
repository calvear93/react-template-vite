import { act, cleanup, renderHook, screen } from '@testing-library/react';
import { type Window as HappyDomWindow } from 'happy-dom';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { dismissToast, getToasts } from '../components/toast/toast.store.ts';
import { UI_TEXTS_EN } from '../i18n/en.ts';
import { onDemand, tellNotLoaded, useOnDemand } from './on-demand.ts';

const PART = { name: 'part' };
const OFFLINE = new Error('offline');
const IDLE = 2000;
/** How long a stylesheet asked for again is waited for. */
const STYLESHEET_WAIT = 10_000;

/** An importer that fails once, as offline, and then loads. */
const flaky = () =>
	vi
		.fn<() => Promise<typeof PART>>()
		.mockRejectedValueOnce(OFFLINE)
		.mockResolvedValue(PART);

describe(onDemand, () => {
	// hooks
	afterEach(() => {
		cleanup();
		vi.useRealTimers();
		vi.unstubAllGlobals();
	});

	// tests
	test('has nothing until it is loaded, and loads once however often it is asked', async () => {
		const importer = vi.fn(() => Promise.resolve(PART));
		const source = onDemand(importer);

		expect(source.peek()).toBeUndefined();

		const parts = await Promise.all([source.load(), source.load()]);

		expect(parts).toStrictEqual([PART, PART]);
		expect(source.peek()).toBe(PART);
		await expect(source.load()).resolves.toBe(PART);
		expect(importer).toHaveBeenCalledOnce();
	});

	test('tells who listens that it arrived, not who stopped listening', async () => {
		const source = onDemand(() => Promise.resolve(PART));
		const listener = vi.fn();
		const stopped = vi.fn();

		source.subscribe(listener);
		source.subscribe(stopped)();

		expect(listener).not.toHaveBeenCalled();

		await source.load();

		expect(listener).toHaveBeenCalledOnce();
		expect(stopped).not.toHaveBeenCalled();
	});

	test('forgets a load that failed: the next one asks again', async () => {
		const importer = flaky();
		const source = onDemand(importer);
		const listener = vi.fn();

		source.subscribe(listener);

		await expect(source.load()).rejects.toBe(OFFLINE);
		expect(source.peek()).toBeUndefined();
		expect(listener).not.toHaveBeenCalled();

		await expect(source.load()).resolves.toBe(PART);
		expect(listener).toHaveBeenCalledOnce();
	});

	test('gives a component what it loaded, as soon as it arrives', async () => {
		const source = onDemand(() => Promise.resolve(PART));
		const { result } = renderHook(() => useOnDemand(source));

		expect(result.current).toBeUndefined();

		await act(() => source.load());

		expect(result.current).toBe(PART);
	});

	describe('fetched ahead', () => {
		// hooks
		beforeEach(() => {
			vi.useFakeTimers();
		});

		// tests
		test('loads once the browser is idle', async () => {
			const tasks: IdleRequestCallback[] = [];
			const importer = vi.fn(() => Promise.resolve(PART));
			const source = onDemand(importer);
			const requestIdle = vi.fn((task: IdleRequestCallback) => {
				tasks.push(task);

				return 7;
			});

			vi.stubGlobal('requestIdleCallback', requestIdle);
			vi.stubGlobal('cancelIdleCallback', vi.fn());
			source.prefetch();

			expect(requestIdle).toHaveBeenCalledExactlyOnceWith(
				expect.any(Function),
				{ timeout: IDLE },
			);

			await vi.advanceTimersByTimeAsync(IDLE * 2);

			expect(importer).not.toHaveBeenCalled();

			tasks[0]({ didTimeout: false, timeRemaining: () => 50 });
			await vi.advanceTimersByTimeAsync(0);

			expect(source.peek()).toBe(PART);
		});

		test('is called off before the browser was idle', () => {
			const importer = vi.fn(() => Promise.resolve(PART));
			const cancelIdle = vi.fn();

			vi.stubGlobal('requestIdleCallback', () => 7);
			vi.stubGlobal('cancelIdleCallback', cancelIdle);
			onDemand(importer).prefetch()();

			expect(cancelIdle).toHaveBeenCalledExactlyOnceWith(7);
			expect(importer).not.toHaveBeenCalled();
		});

		test('waits a moment where the browser cannot tell when it is idle', async () => {
			const importer = vi.fn(() => Promise.resolve(PART));
			const source = onDemand(importer);

			source.prefetch();
			await vi.advanceTimersByTimeAsync(IDLE - 1);

			expect(importer).not.toHaveBeenCalled();

			await vi.advanceTimersByTimeAsync(1);

			expect(source.peek()).toBe(PART);
		});

		test('waits a moment in a browser with no paint observer at all', async () => {
			const importer = vi.fn(() => Promise.resolve(PART));
			const source = onDemand(importer);

			vi.stubGlobal('PerformanceObserver', undefined);

			expect(() => source.prefetch()).not.toThrow();

			await vi.advanceTimersByTimeAsync(IDLE);

			expect(source.peek()).toBe(PART);
		});

		test('waits a moment in a browser whose observer does not list what it observes', async () => {
			const importer = vi.fn(() => Promise.resolve(PART));
			const source = onDemand(importer);

			vi.stubGlobal('PerformanceObserver', class {});

			expect(() => source.prefetch()).not.toThrow();

			await vi.advanceTimersByTimeAsync(IDLE);

			expect(source.peek()).toBe(PART);
		});

		test('is called off before that moment', async () => {
			const importer = vi.fn(() => Promise.resolve(PART));

			onDemand(importer).prefetch()();
			await vi.advanceTimersByTimeAsync(IDLE * 2);

			expect(importer).not.toHaveBeenCalled();
		});

		test('has nothing to do for what is loaded, or on its way', async () => {
			const importer = vi.fn(() => Promise.resolve(PART));
			const source = onDemand(importer);
			const loading = source.load();

			source.prefetch()();

			expect(vi.getTimerCount()).toBe(0);

			await loading;
			source.prefetch()();

			expect(vi.getTimerCount()).toBe(0);
			expect(importer).toHaveBeenCalledOnce();
		});

		test('fails in silence: nobody asked, and the next load asks again', async () => {
			const importer = flaky();
			const source = onDemand(importer);

			source.prefetch();
			await vi.advanceTimersByTimeAsync(IDLE);

			expect(importer).toHaveBeenCalledOnce();
			expect(source.peek()).toBeUndefined();
			await expect(source.load()).resolves.toBe(PART);
		});
	});

	describe('fetched ahead in a browser that tells of its paints', () => {
		const disconnect = vi.fn();
		let tell: (names: string[]) => void;

		/** Tells its observer of the paints the test names. */
		class PaintObserver {
			constructor(
				callback: (paints: PerformanceObserverEntryList) => void,
			) {
				tell = (names) =>
					callback({
						getEntriesByName: (name: string) =>
							names.filter((item) => item === name),
					} as unknown as PerformanceObserverEntryList);
			}

			disconnect = disconnect;
			observe = vi.fn();

			static supportedEntryTypes = ['paint', 'resource'];
		}

		// hooks
		beforeEach(() => {
			vi.useFakeTimers();
			vi.stubGlobal('PerformanceObserver', PaintObserver);
		});

		afterEach(() => {
			disconnect.mockClear();
		});

		// tests
		test('waits for the first contentful paint, then for the browser to be idle', async () => {
			const importer = vi.fn(() => Promise.resolve(PART));
			const source = onDemand(importer);

			source.prefetch();
			tell(['first-paint']);
			await vi.advanceTimersByTimeAsync(IDLE * 2);

			expect(importer).not.toHaveBeenCalled();

			tell(['first-paint', 'first-contentful-paint']);
			await vi.advanceTimersByTimeAsync(IDLE - 1);

			expect(disconnect).toHaveBeenCalledOnce();
			expect(importer).not.toHaveBeenCalled();

			await vi.advanceTimersByTimeAsync(1);

			expect(source.peek()).toBe(PART);
		});

		test('is called off before the page was painted', () => {
			const importer = vi.fn(() => Promise.resolve(PART));

			onDemand(importer).prefetch()();

			expect(disconnect).toHaveBeenCalledOnce();
			expect(importer).not.toHaveBeenCalled();
		});

		test('is called off between the paint and the idle moment', async () => {
			const importer = vi.fn(() => Promise.resolve(PART));
			const cancel = onDemand(importer).prefetch();

			tell(['first-contentful-paint']);
			cancel();
			await vi.advanceTimersByTimeAsync(IDLE * 2);

			expect(importer).not.toHaveBeenCalled();
		});
	});

	describe('with a stylesheet that did not arrive', () => {
		const { settings } = (window as unknown as HappyDomWindow).happyDOM;
		let isTold = false;

		/**
		 * happy-dom fetches no stylesheet: told so, it takes each one as arrived as
		 * soon as it is in the page. That arrival is kept from who listens, and the
		 * test tells what happens to a stylesheet.
		 */
		const hold = (event: Event) => {
			if (!isTold) event.stopImmediatePropagation();
		};

		const settle = (element: HTMLElement, type: 'error' | 'load') => {
			isTold = true;
			element.dispatchEvent(new Event(type));
			isTold = false;
		};

		const stylesheets = () => screen.queryAllByTestId('stylesheet');

		/** The stylesheet a bundler asks for before the code of a chunk. */
		const styled = (href: string) => {
			const link = document.createElement('link');

			link.rel = 'stylesheet';
			link.href = href;
			link.dataset.testid = 'stylesheet';
			document.body.append(link);

			return link;
		};

		/** A part whose first load failed, its stylesheet too. */
		const lose = async () => {
			const importer = flaky();
			const source = onDemand(importer);
			const loading = source.load();
			const lost = styled('/assets/part.css');

			settle(lost, 'error');
			await expect(loading).rejects.toBe(OFFLINE);

			return { importer, lost, source };
		};

		// hooks
		beforeEach(() => {
			vi.useFakeTimers();
			settings.handleDisabledFileLoadingAsSuccess = true;
			document.addEventListener('load', hold, true);
		});

		afterEach(() => {
			settings.handleDisabledFileLoadingAsSuccess = false;
			document.removeEventListener('load', hold, true);
			for (const link of stylesheets()) link.remove();
		});

		// tests
		test('asks for it again, and waits for it, before it loads again', async () => {
			const { importer, lost, source } = await lose();
			const again = source.load();

			await vi.advanceTimersByTimeAsync(0);

			const [fresh] = stylesheets();

			expect(stylesheets()).toHaveLength(1);
			expect(fresh).not.toBe(lost);
			expect(fresh).toHaveAttribute('href', '/assets/part.css');
			expect(importer).toHaveBeenCalledOnce();

			settle(fresh, 'load');

			await expect(again).resolves.toBe(PART);
		});

		test('loads all the same when it fails again, and asks for it once more the next time', async () => {
			const { source } = await lose();
			const again = source.load();

			await vi.advanceTimersByTimeAsync(0);

			const [fresh] = stylesheets();

			settle(fresh, 'error');

			await expect(again).resolves.toBe(PART);

			const next = onDemand(() => Promise.resolve(PART)).load();

			await vi.advanceTimersByTimeAsync(0);

			const [last] = stylesheets();

			expect(last).not.toBe(fresh);

			settle(last, 'load');

			await expect(next).resolves.toBe(PART);
		});

		test('waits for the one another load already asked for again', async () => {
			const { source } = await lose();
			const importer = vi.fn(() => Promise.resolve(PART));
			const again = source.load();
			const other = onDemand(importer).load();

			await vi.advanceTimersByTimeAsync(0);

			expect(stylesheets()).toHaveLength(1);
			expect(importer).not.toHaveBeenCalled();

			settle(stylesheets()[0], 'load');

			await expect(Promise.all([again, other])).resolves.toStrictEqual([
				PART,
				PART,
			]);
		});

		test('stops waiting for one that never answers, and loads without it', async () => {
			const { importer, source } = await lose();
			const other = vi.fn(() => Promise.resolve(PART));
			const again = source.load();
			const next = onDemand(other).load();

			// asked for again, the stylesheet neither arrives nor fails
			await vi.advanceTimersByTimeAsync(STYLESHEET_WAIT - 1);

			expect(importer).toHaveBeenCalledOnce();
			expect(other).not.toHaveBeenCalled();

			await vi.advanceTimersByTimeAsync(1);

			await expect(Promise.all([again, next])).resolves.toStrictEqual([
				PART,
				PART,
			]);
		});

		test('leaves alone one that left the page, and what is not a stylesheet', async () => {
			const source = onDemand(flaky());
			const loading = source.load();
			const gone = styled('/assets/gone.css');
			const image = document.createElement('img');

			document.body.append(image);
			settle(gone, 'error');
			settle(image, 'error');
			gone.remove();
			image.remove();

			await expect(loading).rejects.toBe(OFFLINE);
			await expect(source.load()).resolves.toBe(PART);
			expect(stylesheets()).toHaveLength(0);
		});
	});
});

describe(tellNotLoaded, () => {
	// hooks
	afterEach(() => {
		dismissToast();
	});

	// tests
	test('tells the person with a toast that stays, one however often it failed', () => {
		tellNotLoaded(UI_TEXTS_EN.onDemand);
		tellNotLoaded(UI_TEXTS_EN.onDemand);

		expect(getToasts()).toStrictEqual([
			expect.objectContaining({
				duration: 0,
				message: 'This part of the application could not be loaded',
				tone: 'danger',
				description:
					'Check your connection and try again; if it persists, reload the page.',
			}),
		]);
	});
});
