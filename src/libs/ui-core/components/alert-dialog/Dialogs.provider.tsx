import { type PropsWithChildren, useRef, useState } from 'react';
import { AlertDialog } from './AlertDialog.tsx';
import { ChoiceDialog } from './ChoiceDialog.tsx';
import {
	type AlertOptions,
	type ChoiceOptions,
	type ConfirmOptions,
	type Dialogs,
	DialogsContext,
	type PromptOptions,
} from './dialogs.context.ts';
import { PromptDialog } from './PromptDialog.tsx';

/** The question on screen: which dialog asks it, and with what. */
type Request =
	| { kind: 'alert'; options: AlertOptions }
	| { kind: 'choose'; options: ChoiceOptions }
	| { kind: 'confirm'; options: ConfirmOptions }
	| { kind: 'prompt'; options: PromptOptions };

/** What an alert dialog takes from a notice, from a confirmation, or from no question at all. */
const alertProps = (request: Request | undefined) => {
	if (request?.kind === 'alert')
		return { confirmLabel: request.options.closeLabel, notice: true };

	if (request?.kind === 'confirm') {
		const { cancelLabel, confirmLabel, requireText } = request.options;

		return { cancelLabel, confirmLabel, requireText };
	}

	return {};
};

/** The dialog of the question on screen; the one of a confirmation while there is none. */
const Question = ({
	isOpen,
	onAnswer,
	request,
}: {
	isOpen: boolean;
	request: Request | undefined;
	onAnswer: (value?: unknown) => void;
}) => {
	const shared = { open: isOpen, onOpenChange: () => onAnswer() };

	if (request?.kind === 'choose') {
		const { message, ...options } = request.options;

		return (
			<ChoiceDialog {...shared} {...options} onChoose={onAnswer}>
				{message}
			</ChoiceDialog>
		);
	}

	if (request?.kind === 'prompt') {
		const { message, ...options } = request.options;

		return (
			<PromptDialog {...shared} {...options} onSubmit={onAnswer}>
				{message}
			</PromptDialog>
		);
	}

	return (
		<AlertDialog
			{...shared}
			{...alertProps(request)}
			onConfirm={() => onAnswer(true)}
			title={request?.options.title}
			tone={request?.options.tone}
		>
			{request?.options.message}
		</AlertDialog>
	);
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

	const ask = <Answer,>(next: Request, cancelled: Answer) =>
		new Promise<Answer>((resolve) => {
			// a question still open is cancelled by the one that replaces it
			resolver.current?.();
			resolver.current = (answer = cancelled) =>
				resolve(answer as Answer);
			setRequest(next);
			setIsOpen(true);
		});

	// answering closes the dialog, whose own request to close finds nothing left to answer
	const answer = (value?: unknown) => {
		resolver.current?.(value);
		resolver.current = null;
		setIsOpen(false);
	};

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
			<Question isOpen={isOpen} onAnswer={answer} request={request} />
		</DialogsContext>
	);
};
