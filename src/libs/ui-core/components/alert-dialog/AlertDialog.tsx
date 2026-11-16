import { type ReactNode, useId, useRef, useState } from 'react';
import { type UiTexts } from '../../i18n/en.ts';
import { useTexts } from '../../i18n/texts.hook.ts';
import { Icon } from '../../icon/Icon.tsx';
import { cx } from '../../internal/cx.ts';
import { defined } from '../../internal/defined.ts';
import { Modal, type ModalProps } from '../../internal/modal/Modal.tsx';
import { TONE_ICONS } from '../../internal/tone.ts';
import { Button } from '../button/Button.tsx';
import { Field } from '../field/Field.tsx';
import { Input } from '../input/Input.tsx';
import { type DialogTone } from './dialogs.context.ts';
import styles from './AlertDialog.module.css';

/** The same text, whatever its case and the spaces around it. */
const matches = (typed: string, expected: string) =>
	typed.trim().toLowerCase() === expected.trim().toLowerCase();

/**
 * The icon of what a dialog is about, in a tinted circle: the state is not told
 * by a colour alone. Nothing for the default tone.
 *
 * @returns icon of the tone
 */
export const DialogToneIcon = ({ tone }: { tone: DialogTone }) =>
	tone === 'default' ? null : (
		<span aria-hidden className={cx(styles.icon, styles[tone])}>
			<Icon name={TONE_ICONS[tone]} />
		</span>
	);

/**
 * A question that interrupts, or something that has to be read: the focus starts
 * on the safe answer, the veil does not close it, and Escape cancels. Its buttons
 * say the effect («Remove access», not «OK»); its `tone` shows an icon.
 *
 * - Confirming what cannot be undone: the default, with Cancel.
 * - `requireText`: what is irreversible asks for a text (a folio, a name) to be
 *   typed before it can be confirmed.
 * - `notice`: one button, nothing to decide.
 *
 * `onConfirm` and `onCancel` tell the answer, then `onOpenChange(false)` asks to
 * close. To ask from a handler without keeping state, use `useDialogs()`.
 *
 * @example
 * ```tsx
 * <AlertDialog open={isOpen} onOpenChange={setIsOpen} tone='danger'
 *   title='Remove access for Jane Cooper?' confirmLabel='Remove access'
 *   onConfirm={removeAccess}>
 *   She will no longer see the company records. You can give her access again later.
 * </AlertDialog>
 *
 * <AlertDialog open={isOpen} onOpenChange={setIsOpen} tone='danger'
 *   title='Delete the company' confirmLabel='Delete' requireText='ACME-0042'
 *   onConfirm={removeCompany}>
 *   Its branches and its reports are deleted. This cannot be undone.
 * </AlertDialog>
 * ```
 *
 * @returns alert dialog
 */
export const AlertDialog = ({
	cancelLabel,
	children,
	className,
	confirmLabel,
	labels,
	notice = false,
	onCancel,
	onConfirm,
	onOpenChange,
	requireText,
	title,
	tone = 'default',
	...props
}: AlertDialogProps) => {
	const id = useId();
	const texts = { ...useTexts().alertDialog, ...defined(labels) };
	const cancel = useRef<HTMLButtonElement>(null);
	const confirm = useRef<HTMLButtonElement>(null);
	const field = useRef<HTMLInputElement>(null);
	const [typed, setTyped] = useState('');
	const [wasOpen, setWasOpen] = useState(props.open);
	const canConfirm = requireText === undefined || matches(typed, requireText);
	// the text to type is what the person came to do; otherwise the safe answer
	const safe = notice ? confirm : cancel;

	// each time it opens, the text is to be typed again
	if (props.open !== wasOpen) {
		setWasOpen(props.open);
		setTyped('');
	}

	const answer = (isConfirmed: boolean) => {
		if (isConfirmed) onConfirm?.();
		else onCancel?.();

		onOpenChange(false);
	};

	return (
		<Modal
			aria-describedby={children ? `${id}-description` : undefined}
			aria-labelledby={`${id}-title`}
			dismissOnVeil={false}
			initialFocus={requireText === undefined ? safe : field}
			onOpenChange={() => answer(notice)}
			role='alertdialog'
			{...props}
		>
			<div className={cx(styles.panel, className)}>
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

				{requireText !== undefined && (
					<Field
						className={styles.field}
						label={texts.requireText(requireText)}
					>
						<Input
							autoComplete='off'
							onChange={(event) => setTyped(event.target.value)}
							onKeyDown={(event) => {
								if (event.key === 'Enter' && canConfirm)
									answer(true);
							}}
							ref={field}
							spellCheck={false}
							value={typed}
						/>
					</Field>
				)}

				<div className={styles.actions}>
					{!notice && (
						<Button
							onClick={() => answer(false)}
							ref={cancel}
							variant='ghost'
						>
							{cancelLabel ?? texts.cancel}
						</Button>
					)}
					<Button
						disabled={!canConfirm}
						onClick={() => answer(true)}
						ref={confirm}
						variant={tone === 'danger' ? 'destructive' : 'solid'}
					>
						{confirmLabel ?? (notice ? texts.close : texts.confirm)}
					</Button>
				</div>
			</div>
		</Modal>
	);
};

export interface AlertDialogProps extends Omit<
	ModalProps,
	| 'aria-describedby'
	| 'aria-labelledby'
	| 'dismissOnVeil'
	| 'initialFocus'
	| 'role'
	| 'title'
> {
	/** The question, or what happened: the name of the dialog. */
	title: ReactNode;
	cancelLabel?: string;
	/** The effect of confirming; «Got it» for a notice. */
	confirmLabel?: string;
	labels?: Partial<UiTexts['alertDialog']>;
	/** Something to read, nothing to decide: one button, and Escape is that button. */
	notice?: boolean;
	/** A text that has to be typed before it can be confirmed. */
	requireText?: string;
	/** What it is about: an icon, and a destructive confirm button for `danger`. */
	tone?: DialogTone;
	onCancel?: () => void;
	onConfirm?: () => void;
}
