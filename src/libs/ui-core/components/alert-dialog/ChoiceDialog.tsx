import { type ReactNode, useId, useRef } from 'react';
import { useTexts } from '../../i18n/texts.hook.ts';
import { Icon } from '../../icon/Icon.tsx';
import { cx } from '../../internal/cx.ts';
import { Modal, type ModalProps } from '../../internal/modal/Modal.tsx';
import { Button } from '../button/Button.tsx';
import { DialogToneIcon } from './AlertDialog.tsx';
import { type ChoiceOption, type DialogTone } from './dialogs.context.ts';
import styles from './AlertDialog.module.css';

/** The variant of the button of an answer in a row: the last one is the main action. */
const variantOf = (option: ChoiceOption, isMain: boolean) => {
	if (option.tone === 'danger') return 'destructive';

	return isMain ? 'solid' : 'outlined';
};

/**
 * A question with several answers: what to do with unsaved changes, how to
 * export. Up to three plain answers are a row of buttons, the last one the main
 * action; more of them, or answers that explain themselves (`description`), are a
 * list. It interrupts like an AlertDialog: the focus starts on Cancel, the veil
 * does not close it, Escape cancels.
 *
 * `onChoose` tells the answer, then `onOpenChange(false)` asks to close. To ask
 * from a handler without keeping state, use `useDialogs().choose`.
 *
 * @example
 * ```tsx
 * <ChoiceDialog open={isOpen} onOpenChange={setIsOpen} title='There are unsaved changes'
 *   options={[
 *     { value: 'discard', label: 'Discard', tone: 'danger' },
 *     { value: 'save', label: 'Save and leave' },
 *   ]}
 *   onChoose={leave}>
 *   If you leave now, they are lost.
 * </ChoiceDialog>
 * ```
 *
 * @returns choice dialog
 */
export const ChoiceDialog = <Value extends string = string>({
	cancelLabel,
	children,
	className,
	onChoose,
	onOpenChange,
	options,
	title,
	tone = 'default',
	...props
}: ChoiceDialogProps<Value>) => {
	const texts = useTexts().choiceDialog;
	const id = useId();
	const cancel = useRef<HTMLButtonElement>(null);
	const isList =
		options.length > 3 || options.some((option) => option.description);

	const choose = (value: Value) => {
		onChoose?.(value);
		onOpenChange(false);
	};

	return (
		<Modal
			aria-describedby={children ? `${id}-description` : undefined}
			aria-labelledby={`${id}-title`}
			dismissOnVeil={false}
			initialFocus={cancel}
			onOpenChange={onOpenChange}
			role='alertdialog'
			{...props}
		>
			<div className={cx(styles.panel, isList && styles.wide, className)}>
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

				{isList && (
					<div className={styles.options}>
						{options.map((option) => (
							<button
								className={styles.option}
								data-tone={option.tone}
								key={option.value}
								onClick={() => choose(option.value)}
								type='button'
							>
								{option.icon && <Icon name={option.icon} />}
								<span className={styles.optionText}>
									<span className={styles.optionLabel}>
										{option.label}
									</span>
									{option.description && (
										<span
											className={styles.optionDescription}
										>
											{option.description}
										</span>
									)}
								</span>
								<Icon
									className={styles.optionArrow}
									name='chevron-right'
									size='sm'
								/>
							</button>
						))}
					</div>
				)}

				<div className={styles.actions}>
					<Button
						onClick={() => onOpenChange(false)}
						ref={cancel}
						variant='ghost'
					>
						{cancelLabel ?? texts.cancel}
					</Button>
					{!isList &&
						options.map((option, index) => (
							<Button
								icon={option.icon}
								key={option.value}
								onClick={() => choose(option.value)}
								variant={variantOf(
									option,
									index === options.length - 1,
								)}
							>
								{option.label}
							</Button>
						))}
				</div>
			</div>
		</Modal>
	);
};

export interface ChoiceDialogProps<Value extends string = string> extends Omit<
	ModalProps,
	| 'aria-describedby'
	| 'aria-labelledby'
	| 'dismissOnVeil'
	| 'initialFocus'
	| 'role'
	| 'title'
> {
	/** The answers: the last one is the main action of a row of buttons. */
	options: readonly ChoiceOption<Value>[];
	/** The question: the name of the dialog. */
	title: ReactNode;
	cancelLabel?: string;
	tone?: DialogTone;
	onChoose?: (value: Value) => void;
}
