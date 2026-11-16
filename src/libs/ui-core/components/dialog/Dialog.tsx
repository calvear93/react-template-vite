import {
	type ComponentProps,
	type ReactNode,
	type SubmitEvent,
	useId,
	useState,
	useTransition,
} from 'react';
import { useTexts } from '../../i18n/texts.hook.ts';
import { Icon } from '../../icon/Icon.tsx';
import { cx } from '../../internal/cx.ts';
import { Modal, type ModalProps } from '../../internal/modal/Modal.tsx';
import { ScrollArea } from '../../internal/scroll-area/ScrollArea.tsx';
import { ErrorAlert } from '../alert/Alert.tsx';
import { Button, type ButtonProps } from '../button/Button.tsx';
import styles from './Dialog.module.css';

/**
 * A short task or a decision over the page. Modal: the focus stays inside and goes
 * back to what opened it. Escape, the veil and its close button ask to close through
 * `onOpenChange(false)`: the parent owns `open`.
 *
 * For a form that saves, use FormDialog; to confirm what cannot be undone,
 * AlertDialog or `useConfirm()`; for a secondary task beside the page, Drawer.
 *
 * @example
 * ```tsx
 * <Dialog open={isOpen} onOpenChange={setIsOpen} title='Report details'
 *   footer={<Button onClick={() => setIsOpen(false)}>Got it</Button>}>
 *   …
 * </Dialog>
 * ```
 *
 * @returns dialog
 */
export const Dialog = ({
	children,
	className,
	closeLabel,
	description,
	footer,
	locked,
	onOpenChange,
	size = 'md',
	title,
	...props
}: DialogProps) => {
	const texts = useTexts().dialog;
	const id = useId();

	return (
		<Modal
			aria-describedby={description ? `${id}-description` : undefined}
			aria-labelledby={`${id}-title`}
			locked={locked}
			onOpenChange={onOpenChange}
			{...props}
		>
			<div className={cx(styles.panel, styles[size], className)}>
				<h2 className={styles.title} id={`${id}-title`}>
					{title}
				</h2>
				{description && (
					<p className={styles.description} id={`${id}-description`}>
						{description}
					</p>
				)}
				{children && (
					<ScrollArea className={styles.body}>{children}</ScrollArea>
				)}
				{footer && <div className={styles.footer}>{footer}</div>}

				<button
					aria-label={closeLabel ?? texts.close}
					className={styles.close}
					disabled={locked}
					onClick={() => onOpenChange(false)}
					type='button'
				>
					<Icon name='close' size='sm' />
				</button>
			</div>
		</Modal>
	);
};

export interface DialogProps extends Omit<
	ModalProps,
	'aria-describedby' | 'aria-labelledby' | 'title'
> {
	/** Names the dialog. */
	title: ReactNode;
	closeLabel?: string;
	/** A line under the title that describes the dialog. */
	description?: ReactNode;
	/** The actions of the dialog, at its bottom. */
	footer?: ReactNode;
	size?: 'lg' | 'md' | 'sm';
}

/**
 * A dialog with a form that saves. `onSubmit` gets the form's data; while it runs
 * the dialog cannot be closed and its button is busy. If it throws, the error is
 * shown inside and the dialog stays open, so nothing typed is lost; if it
 * resolves, the dialog closes.
 *
 * @example
 * ```tsx
 * <FormDialog open={isOpen} onOpenChange={setIsOpen} title='Add worker'
 *   submitLabel='Add worker'
 *   onSubmit={async (data) => { await api.createWorker(data); }}>
 *   <Field label='Name' required><Input name='name' /></Field>
 *   <Field label='RUT' required><InputRut name='rut' /></Field>
 * </FormDialog>
 * ```
 *
 * @returns dialog with a form
 */
export const FormDialog = ({
	cancelLabel,
	children,
	errorTitle,
	formProps,
	onOpenChange,
	onSubmit,
	submitLabel,
	submitVariant = 'solid',
	...props
}: FormDialogProps) => {
	const texts = useTexts().dialog;
	const formId = useId();
	const [error, setError] = useState<unknown>();
	const [isPending, startTransition] = useTransition();

	const handleOpenChange = (open: boolean) => {
		setError(undefined);
		onOpenChange(open);
	};

	const handleSubmit = (event: SubmitEvent<HTMLFormElement>) => {
		event.preventDefault();

		const form = event.currentTarget;

		setError(undefined);
		startTransition(async () => {
			try {
				await onSubmit(new FormData(form), form);
				handleOpenChange(false);
			} catch (error_) {
				setError(error_);
			}
		});
	};

	return (
		<Dialog
			footer={
				<>
					<Button
						disabled={isPending}
						onClick={() => handleOpenChange(false)}
						variant='ghost'
					>
						{cancelLabel ?? texts.cancel}
					</Button>
					<Button
						form={formId}
						loading={isPending}
						type='submit'
						variant={submitVariant}
					>
						{submitLabel ?? texts.submit}
					</Button>
				</>
			}
			locked={isPending}
			onOpenChange={handleOpenChange}
			{...props}
		>
			<form
				{...formProps}
				className={cx(styles.form, formProps?.className)}
				id={formId}
				onSubmit={handleSubmit}
			>
				{children}
				{error !== undefined && (
					<ErrorAlert error={error} title={errorTitle} />
				)}
			</form>
		</Dialog>
	);
};

export interface FormDialogProps extends Omit<
	DialogProps,
	'footer' | 'locked' | 'onSubmit'
> {
	cancelLabel?: string;
	/** The title of the error when the error thrown has none. */
	errorTitle?: string;
	/** Props for the `<form>` (e.g. `noValidate`, `aria-label`). */
	formProps?: Omit<ComponentProps<'form'>, 'id' | 'onSubmit'>;
	submitLabel?: string;
	submitVariant?: ButtonProps['variant'];
	/** Saves the form. Resolving closes the dialog; throwing shows the error inside. */
	onSubmit: (data: FormData, form: HTMLFormElement) => Promise<unknown>;
}
