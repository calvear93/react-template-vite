import { act, cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, test, vi } from 'vitest';
import { type Dialogs } from './dialogs.context.ts';

const IDLE = 2000;
const OFFLINE = new Error('offline');
const ASK = 'Ask';
const TITLE = 'Remove the access?';
const button = (name: string) => screen.getByRole('button', { name });

/**
 * The provider in a kit whose dialogs are not loaded yet (the setup of the tests
 * loads them, as an idle browser does): each time their code is asked for is an
 * attempt, which the test makes arrive (`resolve`) or fail (`reject`).
 */
const renderUnloaded = async (
	ask: (dialogs: Dialogs) => Promise<unknown> = ({ confirm }) =>
		confirm({ title: TITLE }),
) => {
	const attempts: PromiseWithResolvers<boolean>[] = [];
	const answers: unknown[] = [];

	vi.resetModules();
	vi.doMock(import('./Question.tsx'), async (importOriginal) => {
		const attempt = Promise.withResolvers<boolean>();

		attempts.push(attempt);
		await attempt.promise;

		return importOriginal();
	});

	const [{ DialogsProvider, QUESTION }, { useDialogs }, { Toaster }] =
		await Promise.all([
			import('./Dialogs.provider.tsx'),
			import('./dialogs.hook.ts'),
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
				await QUESTION.load();
			} catch {
				// the failure is what the test is about
			}
		});
	};

	const Asker = () => {
		const dialogs = useDialogs();

		return (
			<button
				onClick={async () => {
					answers.push(await ask(dialogs));
				}}
				type='button'
			>
				{ASK}
			</button>
		);
	};

	const view = render(
		<DialogsProvider>
			<Asker />
			<Toaster />
		</DialogsProvider>,
	);

	return { answers, attempts, settle, ...view };
};

describe('the dialogs of useDialogs(), loaded on demand', () => {
	// hooks
	afterEach(() => {
		cleanup();
		vi.doUnmock(import('./Question.tsx'));
		vi.useRealTimers();
	});

	// tests
	test('asks for their code with the first question, not before', async () => {
		const { attempts } = await renderUnloaded();

		expect(attempts).toHaveLength(0);

		await userEvent.click(button(ASK));

		expect(attempts).toHaveLength(1);
	});

	test('shows a question asked before its dialog arrived once it does, the focus where it starts', async () => {
		const { answers, attempts, settle } = await renderUnloaded();

		await userEvent.click(button(ASK));

		expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();

		await settle(attempts[0]);

		expect(screen.getByRole('alertdialog', { name: TITLE })).toBeVisible();
		expect(button('Cancel')).toHaveFocus();

		await userEvent.click(button('Confirm'));

		await vi.waitFor(() => {
			expect(answers).toStrictEqual([true]);
		});
		expect(button(ASK)).toHaveFocus();
	});

	test('shows only the last of the questions asked meanwhile, the others cancelled', async () => {
		const { answers, attempts, settle } = await renderUnloaded(
			({ confirm, prompt }) =>
				Promise.all([
					confirm({ title: TITLE }),
					prompt({ label: 'Reason', title: 'Reject' }),
				]),
		);

		await userEvent.click(button(ASK));
		await settle(attempts[0]);

		expect(attempts).toHaveLength(1);
		expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
		expect(screen.getByRole('textbox', { name: 'Reason' })).toHaveFocus();

		await userEvent.keyboard('Out of time{Enter}');

		await vi.waitFor(() => {
			expect(answers).toStrictEqual([[false, 'Out of time']]);
		});
	});

	test.each<[string, (dialogs: Dialogs) => Promise<unknown>, unknown]>([
		['a confirmation', ({ confirm }) => confirm({ title: TITLE }), false],
		['a notice', ({ alert }) => alert({ title: TITLE }), undefined],
		[
			'a text',
			({ prompt }) => prompt({ label: 'Reason', title: TITLE }),
			undefined,
		],
		[
			'a choice',
			({ choose }) =>
				choose({
					options: [{ label: 'Yes', value: 'yes' }],
					title: TITLE,
				}),
			undefined,
		],
	])(
		'cancels %s whose dialog could not be loaded, and tells the person',
		async (_kind, ask, cancelled) => {
			const { answers, attempts, settle } = await renderUnloaded(ask);

			await userEvent.click(button(ASK));
			await settle(attempts[0], OFFLINE);

			await vi.waitFor(() => {
				expect(answers).toStrictEqual([cancelled]);
			});
			expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
			expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
			expect(screen.getByRole('alert')).toHaveTextContent(
				'This part of the application could not be loaded',
			);
		},
	);

	test('loads again with the next question after a load that failed', async () => {
		const { answers, attempts, settle } = await renderUnloaded();

		await userEvent.click(button(ASK));
		await settle(attempts[0], OFFLINE);
		await userEvent.click(button(ASK));

		expect(attempts).toHaveLength(2);

		await settle(attempts[1]);
		await userEvent.click(button('Confirm'));

		await vi.waitFor(() => {
			expect(answers).toStrictEqual([false, true]);
		});
	});

	test('tells of a load that failed once, for the question that was waiting', async () => {
		const { answers, attempts, settle } = await renderUnloaded(
			({ alert, confirm }) =>
				Promise.all([
					confirm({ title: TITLE }),
					alert({ title: 'Session about to expire' }),
				]),
		);

		await userEvent.click(button(ASK));
		await settle(attempts[0], OFFLINE);

		await vi.waitFor(() => {
			expect(answers).toStrictEqual([[false, undefined]]);
		});
		expect(screen.getAllByRole('alert')).toHaveLength(1);
	});

	test('fetches their code ahead once the browser is idle', async () => {
		vi.useFakeTimers();

		const { attempts } = await renderUnloaded();

		await vi.advanceTimersByTimeAsync(IDLE);

		expect(attempts).toHaveLength(1);
	});

	test('does not fetch it ahead for a page that was left', async () => {
		vi.useFakeTimers();

		const { attempts, unmount } = await renderUnloaded();

		unmount();
		await vi.advanceTimersByTimeAsync(IDLE);

		expect(attempts).toHaveLength(0);
	});
});
