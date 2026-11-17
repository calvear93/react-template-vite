import { act, cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { afterEach, describe, expect, test, vi } from 'vitest';
import { type SettingsDialogProps } from './SettingsDialog.tsx';

const IDLE = 2000;
const OFFLINE = new Error('offline');
const OPEN = 'Open';
const CLOSE = 'Close';
const TITLE = 'Settings';
const dialog = () => screen.queryByRole('dialog', { name: TITLE });
const opener = () => screen.getByRole('button', { name: OPEN });

/**
 * The dialog in a kit whose window is not loaded yet (the setup of the tests loads
 * it, as an idle browser does): each time its code is asked for is an attempt,
 * which the test makes arrive (`resolve`) or fail (`reject`).
 */
const renderUnloaded = async (props: Partial<SettingsDialogProps> = {}) => {
	const attempts: PromiseWithResolvers<boolean>[] = [];
	const onOpenChange = vi.fn();

	vi.resetModules();
	vi.doMock(import('./SettingsWindow.tsx'), async (importOriginal) => {
		const attempt = Promise.withResolvers<boolean>();

		attempts.push(attempt);
		await attempt.promise;

		return importOriginal();
	});

	const [{ SettingsDialog }, { SETTINGS_WINDOW }, { Toaster }] =
		await Promise.all([
			import('./SettingsDialog.tsx'),
			import('./settings-dialog.hook.ts'),
			import('../toast/Toaster.tsx'),
		]);

	/** Makes an attempt arrive or fail, and waits until the page took it. */
	const settle = async (
		attempt: PromiseWithResolvers<boolean>,
		error?: Error,
	) => {
		await act(async () => {
			if (error) attempt.reject(error);
			else attempt.resolve(true);

			// every call gets the answer of the load on its way: the one the page waits for
			try {
				await SETTINGS_WINDOW.load();
			} catch {
				// the failure is what the test is about
			}
		});
	};

	const Opener = () => {
		const [isOpen, setIsOpen] = useState(false);

		return (
			<>
				<button onClick={() => setIsOpen(true)} type='button'>
					{OPEN}
				</button>
				<button onClick={() => setIsOpen(false)} type='button'>
					{CLOSE}
				</button>
				<SettingsDialog
					onOpenChange={(open) => {
						onOpenChange(open);
						setIsOpen(open);
					}}
					open={isOpen}
					{...props}
				/>
				<Toaster />
			</>
		);
	};

	return { attempts, onOpenChange, props, settle, ...render(<Opener />) };
};

describe('SettingsDialog, its window loaded on demand', () => {
	// hooks
	afterEach(() => {
		cleanup();
		vi.doUnmock(import('./SettingsWindow.tsx'));
		vi.useRealTimers();
		vi.unstubAllGlobals();
	});

	// tests
	test('asks for its window when it first opens, not before', async () => {
		const { attempts } = await renderUnloaded();

		expect(attempts).toHaveLength(0);

		await userEvent.click(opener());

		expect(attempts).toHaveLength(1);
		expect(dialog()).not.toBeInTheDocument();
	});

	test('shows a window opened before it arrived once it does, the focus on its category', async () => {
		const { attempts, settle } = await renderUnloaded({
			defaultSection: 'accessibility',
		});

		await userEvent.click(opener());
		await settle(attempts[0]);

		expect(dialog()).toBeVisible();
		expect(
			screen.getByRole('tab', { name: 'Accessibility' }),
		).toHaveFocus();

		await userEvent.keyboard('{Escape}');

		expect(dialog()).not.toBeInTheDocument();
		expect(opener()).toHaveFocus();
	});

	test('closes and tells the person when its window could not be loaded', async () => {
		const { attempts, onOpenChange, settle } = await renderUnloaded();

		await userEvent.click(opener());
		await settle(attempts[0], OFFLINE);

		expect(onOpenChange).toHaveBeenCalledExactlyOnceWith(false);
		expect(dialog()).not.toBeInTheDocument();
		expect(screen.getByRole('alert')).toHaveTextContent(
			'This part of the application could not be loaded',
		);
	});

	test('loads its window again the next time it opens after a load that failed', async () => {
		const { attempts, settle } = await renderUnloaded();

		await userEvent.click(opener());
		await settle(attempts[0], OFFLINE);
		await userEvent.click(opener());

		expect(attempts).toHaveLength(2);

		await settle(attempts[1]);

		expect(dialog()).toBeVisible();
		expect(screen.getByRole('tab', { name: 'Appearance' })).toHaveFocus();
	});

	test('says nothing of a load that failed once it was closed', async () => {
		const { attempts, onOpenChange, settle } = await renderUnloaded();

		await userEvent.click(opener());
		await userEvent.click(screen.getByRole('button', { name: CLOSE }));
		await settle(attempts[0], OFFLINE);

		expect(onOpenChange).not.toHaveBeenCalled();
		expect(screen.queryByRole('alert')).not.toBeInTheDocument();
	});

	test('fetches its window ahead once the browser is idle', async () => {
		vi.useFakeTimers();

		const { attempts } = await renderUnloaded();

		await vi.advanceTimersByTimeAsync(IDLE);

		expect(attempts).toHaveLength(1);
		expect(dialog()).not.toBeInTheDocument();
	});

	test('takes the category to open on when it first opens, not when its window arrived', async () => {
		const idle: (() => void)[] = [];

		vi.stubGlobal('requestIdleCallback', (task: () => void) =>
			idle.push(task),
		);
		vi.stubGlobal('cancelIdleCallback', vi.fn());

		const { attempts, props, settle } = await renderUnloaded();

		// the browser was idle: the window is there before it was ever opened
		idle[0]();
		await vi.waitFor(() => {
			expect(attempts).toHaveLength(1);
		});
		await settle(attempts[0]);
		props.defaultSection = 'accessibility';
		await userEvent.click(opener());

		expect(
			screen.getByRole('tab', { name: 'Accessibility' }),
		).toHaveFocus();
	});

	test('does not fetch it ahead for a page that was left', async () => {
		vi.useFakeTimers();

		const { attempts, unmount } = await renderUnloaded();

		unmount();
		await vi.advanceTimersByTimeAsync(IDLE);

		expect(attempts).toHaveLength(0);
	});
});
