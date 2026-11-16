import { type ReactNode, type SubmitEvent, useId, useState } from 'react';
import { type UiTexts } from '../../i18n/en.ts';
import { useTexts } from '../../i18n/texts.hook.ts';
import { cx } from '../../internal/cx.ts';
import { defined } from '../../internal/defined.ts';
import { Modal, type ModalProps } from '../../internal/modal/Modal.tsx';
import { Button } from '../button/Button.tsx';
import { Field } from '../field/Field.tsx';
import { Input } from '../input/Input.tsx';
import { Textarea } from '../textarea/Textarea.tsx';
import { DialogToneIcon } from './AlertDialog.tsx';
import { type DialogTone } from './dialogs.context.ts';
import styles from './AlertDialog.module.css';

/**
 * Asks for one text: the reason of a rejection, a name. The focus starts in its
 * field and Enter accepts (in a field of several lines, the button does); a text
 * that is missing (`required`) or wrong (`validate`) is said under the field and
 * the dialog stays. Escape, the veil and Cancel leave without an answer.
 *
 * `onSubmit` gets the text, trimmed, then `onOpenChange(false)` asks to close. To
 * ask from a handler without keeping state, use `useDialogs().prompt`. A form of
 * several fields is a FormDialog.
 *
 * @example
 * ```tsx
 * <PromptDialog open={isOpen} onOpenChange={setIsOpen} title='Reject the report'
 *   label='Reason' multiline required confirmLabel='Reject' onSubmit={reject}>
 *   The worker will see this reason.
 * </PromptDialog>
 * ```
 *
 * @returns prompt dialog
 */
export const PromptDialog = ({
	cancelLabel,
	children,
	className,
	confirmLabel,
	defaultValue = '',
	hint,
	label,
	labels,
	multiline = false,
	onOpenChange,
	onSubmit,
	placeholder,
	required = false,
	title,
	tone = 'default',
	validate,
	...props
}: PromptDialogProps) => {
	const id = useId();
	const texts = { ...useTexts().promptDialog, ...defined(labels) };
	const [text, setText] = useState(defaultValue);
	const [error, setError] = useState<string>();
	const [wasOpen, setWasOpen] = useState(props.open);
	const Control = multiline ? Textarea : Input;

	// each time it opens it starts from its first text, with nothing wrong yet
	if (props.open !== wasOpen) {
		setWasOpen(props.open);
		setText(defaultValue);
		setError(undefined);
	}

	const handleSubmit = (event: SubmitEvent<HTMLFormElement>) => {
		const answer = text.trim();
		const problem =
			required && answer === '' ? texts.required : validate?.(answer);

		event.preventDefault();
		setError(problem);

		if (problem !== undefined) return;

		onSubmit?.(answer);
		onOpenChange(false);
	};

	return (
		<Modal
			aria-describedby={children ? `${id}-description` : undefined}
			aria-labelledby={`${id}-title`}
			onOpenChange={onOpenChange}
			{...props}
		>
			<form
				className={cx(styles.panel, className)}
				noValidate
				onSubmit={handleSubmit}
			>
				<DialogToneIcon tone={tone} />
				<h2 className={styles.title} id={`${id}-title`}>
					{title}
				</h2>
				{children && (
					<div
						className={styles.description}
						id={`${id}-description`}
					>
						{children}
					</div>
				)}

				<Field
					className={styles.field}
					error={error}
					hint={hint}
					label={label}
					required={required}
				>
					<Control
						autoComplete='off'
						onChange={(event) => {
							setText(event.target.value);
							setError(undefined);
						}}
						placeholder={placeholder}
						value={text}
					/>
				</Field>

				<div className={styles.actions}>
					<Button onClick={() => onOpenChange(false)} variant='ghost'>
						{cancelLabel ?? texts.cancel}
					</Button>
					<Button
						type='submit'
						variant={tone === 'danger' ? 'destructive' : 'solid'}
					>
						{confirmLabel ?? texts.confirm}
					</Button>
				</div>
			</form>
		</Modal>
	);
};

export interface PromptDialogProps extends Omit<
	ModalProps,
	'aria-describedby' | 'aria-labelledby' | 'onSubmit' | 'role' | 'title'
> {
	/** The label of the field. */
	label: string;
	/** What is asked: the name of the dialog. */
	title: ReactNode;
	cancelLabel?: string;
	confirmLabel?: string;
	defaultValue?: string;
	/** A hint under the field. */
	hint?: ReactNode;
	labels?: Partial<UiTexts['promptDialog']>;
	/** Several lines: a reason, a note. */
	multiline?: boolean;
	placeholder?: string;
	/** An empty text is not an answer. */
	required?: boolean;
	tone?: DialogTone;
	onSubmit?: (text: string) => void;
	/** What is wrong with a text, or nothing when it is right. */
	validate?: (text: string) => string | undefined;
}
