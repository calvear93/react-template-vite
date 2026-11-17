import { type PropsWithChildren, useEffect, useRef, useState } from 'react';
import { useTexts } from '../../i18n/texts.hook.ts';
import {
	onDemand,
	tellNotLoaded,
	useOnDemand,
} from '../../internal/on-demand.ts';
import {
	type ChoiceOptions,
	type Dialogs,
	DialogsContext,
} from './dialogs.context.ts';
import { type QuestionProps, type Request } from './Question.tsx';

/**
 * The dialogs of the questions: no page shows one when it opens, so their code and
 * their styles arrive with the first question, or ahead once the browser is idle.
 */
export const QUESTION = onDemand(() => import('./Question.tsx'));

/** The dialog of the question on screen, once its code is there. */
const LoadedQuestion = (props: QuestionProps) => {
	const loaded = useOnDemand(QUESTION);

	return loaded ? <loaded.Question {...props} /> : null;
};

/**
 * Renders the dialogs of `useDialogs()` and `useConfirm()`: one for the whole tree,
 * one question at a time. Mounted by UiProvider.
 *
 * @returns provider of the dialogs
 */
export const DialogsProvider = ({ children }: PropsWithChildren) => {
	// the last question stays while its dialog leaves the screen: closed, not emptied
	const [request, setRequest] = useState<Request>();
	const [isOpen, setIsOpen] = useState(false);
	const resolver = useRef<(answer?: unknown) => void>(null);
	const { onDemand: notLoaded } = useTexts();

	useEffect(() => QUESTION.prefetch(), []);

	// answering closes the dialog, whose own request to close finds nothing left to answer
	const answer = (value?: unknown) => {
		resolver.current?.(value);
		resolver.current = null;
		setIsOpen(false);
	};

	const ask = <Answer,>(next: Request, cancelled: Answer) =>
		new Promise<Answer>((resolve) => {
			const settle = (value: unknown = cancelled) =>
				resolve(value as Answer);

			const load = async () => {
				try {
					await QUESTION.load();
				} catch {
					// a question another one replaced meanwhile was already cancelled
					if (resolver.current !== settle) return;

					// without its dialog nobody can answer: cancelled, and said
					answer();
					tellNotLoaded(notLoaded);
				}
			};

			// a question still open is cancelled by the one that replaces it
			resolver.current?.();
			resolver.current = settle;
			setRequest(next);
			setIsOpen(true);
			void load();
		});

	const dialogs: Dialogs = {
		alert: (options) => ask({ kind: 'alert', options }, undefined),
		confirm: (options) => ask({ kind: 'confirm', options }, false),
		prompt: (options) => ask({ kind: 'prompt', options }, undefined),
		choose: <Value extends string>(options: ChoiceOptions<Value>) =>
			ask<Value | undefined>({ kind: 'choose', options }, undefined),
	};

	return (
		<DialogsContext value={dialogs}>
			{children}
			{request && (
				<LoadedQuestion
					isOpen={isOpen}
					onAnswer={answer}
					request={request}
				/>
			)}
		</DialogsContext>
	);
};
