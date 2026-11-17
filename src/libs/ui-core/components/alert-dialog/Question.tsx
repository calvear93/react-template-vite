import { AlertDialog } from './AlertDialog.tsx';
import { ChoiceDialog } from './ChoiceDialog.tsx';
import {
	type AlertOptions,
	type ChoiceOptions,
	type ConfirmOptions,
	type PromptOptions,
} from './dialogs.context.ts';
import { PromptDialog } from './PromptDialog.tsx';

/** A question of `useDialogs()`: which dialog asks it, and with what. */
export type Request =
	| { kind: 'alert'; options: AlertOptions }
	| { kind: 'choose'; options: ChoiceOptions }
	| { kind: 'confirm'; options: ConfirmOptions }
	| { kind: 'prompt'; options: PromptOptions };

/** What an alert dialog takes from a notice, or from a confirmation. */
const alertProps = (
	request: Extract<Request, { kind: 'alert' | 'confirm' }>,
) => {
	if (request.kind === 'alert')
		return { confirmLabel: request.options.closeLabel, notice: true };

	const { cancelLabel, confirmLabel, requireText } = request.options;

	return { cancelLabel, confirmLabel, requireText };
};

/**
 * The dialog of a question of `useDialogs()`. With the three dialogs it chooses
 * from, it is loaded on demand by DialogsProvider: nothing of the first screen
 * imports it.
 *
 * @returns the dialog of the question
 */
export const Question = ({ isOpen, onAnswer, request }: QuestionProps) => {
	const shared = { open: isOpen, onOpenChange: () => onAnswer() };

	if (request.kind === 'choose') {
		const { message, ...options } = request.options;

		return (
			<ChoiceDialog {...shared} {...options} onChoose={onAnswer}>
				{message}
			</ChoiceDialog>
		);
	}

	if (request.kind === 'prompt') {
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
			title={request.options.title}
			tone={request.options.tone}
		>
			{request.options.message}
		</AlertDialog>
	);
};

export interface QuestionProps {
	isOpen: boolean;
	/** The question on screen, or the last one while its dialog leaves. */
	request: Request;
	/** Tells the answer; nothing for a question that was cancelled. */
	onAnswer: (value?: unknown) => void;
}
