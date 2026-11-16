import { createContext, type ReactNode } from 'react';
import { type IconName } from '../../icon/icon.registry.ts';

/** What a dialog is about, said by its icon too: nothing in particular, or one of the states. */
export type DialogTone = 'danger' | 'default' | 'info' | 'success' | 'warning';

/** What every question of `useDialogs()` takes. */
interface QuestionOptions {
	/** The question, or what happened: the name of the dialog. */
	title: ReactNode;
	/** What it means, under the title. */
	message?: ReactNode;
	tone?: DialogTone;
}

export interface AlertOptions extends QuestionOptions {
	/** The text of its only button. */
	closeLabel?: string;
}

export interface ConfirmOptions extends QuestionOptions {
	cancelLabel?: string;
	/** The effect of confirming («Remove access», not «OK»). */
	confirmLabel?: string;
	/**
	 * What cannot be undone asks for this text (a folio, a name) to be typed before it
	 * can be confirmed.
	 */
	requireText?: string;
}

/** One of the answers of a choice. */
export interface ChoiceOption<Value extends string = string> {
	label: string;
	value: Value;
	/** What choosing it does: makes the options a list instead of a row of buttons. */
	description?: ReactNode;
	icon?: IconName;
	/** `danger` for the answer that destroys something. */
	tone?: 'danger' | 'default';
}

export interface ChoiceOptions<
	Value extends string = string,
> extends QuestionOptions {
	/** The answers: the last one is the main action of a row of buttons. */
	options: readonly ChoiceOption<Value>[];
	cancelLabel?: string;
}

export interface PromptOptions extends QuestionOptions {
	/** The label of the field. */
	label: string;
	cancelLabel?: string;
	confirmLabel?: string;
	defaultValue?: string;
	/** A hint under the field. */
	hint?: ReactNode;
	/** Several lines: a reason, a note. */
	multiline?: boolean;
	placeholder?: string;
	/** An empty text is not an answer. */
	required?: boolean;
	/** What is wrong with a text, or nothing when it is right. */
	validate?: (text: string) => string | undefined;
}

export type Confirm = (options: ConfirmOptions) => Promise<boolean>;

/** The questions an app asks from a handler; each resolves with the answer. */
export interface Dialogs {
	/** Yes or no: resolves `true` only when confirmed. */
	confirm: Confirm;
	/** Something that has to be read: resolves once it was. */
	alert: (options: AlertOptions) => Promise<void>;
	/** A text: resolves with it, trimmed, or nothing when cancelled. */
	prompt: (options: PromptOptions) => Promise<string | undefined>;
	/** One of several answers: resolves with its value, or nothing when cancelled. */
	choose: <Value extends string>(
		options: ChoiceOptions<Value>,
	) => Promise<Value | undefined>;
}

export const DialogsContext = createContext<Dialogs | null>(null);
