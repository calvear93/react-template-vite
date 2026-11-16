import {
	type ComponentProps,
	type KeyboardEvent,
	type RefObject,
	useEffect,
	useRef,
} from 'react';
import { cx } from '../cx.ts';
import { usePresence } from '../use-presence.hook.ts';
import styles from './Modal.module.css';

const FIELDS =
	'input:not([type="hidden"]):not(:disabled), select:not(:disabled), textarea:not(:disabled)';

/**
 * The modal surface under Dialog, AlertDialog and Drawer, on the native `<dialog>`
 * (`showModal()`: the focus stays inside, the rest of the page is inert, it lives in
 * the top layer). It is controlled: `open` shows it, and every way out (Escape, the
 * veil, the browser's own close request) only asks through `onOpenChange(false)`.
 *
 * It adds what the platform leaves out: the focus goes to `initialFocus`, or to the
 * first field, when it opens, and back to what opened it when it closes; `locked`
 * keeps it open while something is pending. Only a close it did not ask for itself
 * (the browser's) is told to the parent. Closed, it stays for the moment its
 * way out takes (`data-leaving`), still modal, and then leaves the page. The
 * `onClose`, `onCancel` and `onKeyDown` it is given run before its own.
 *
 * @returns modal dialog
 */
export const Modal = ({
	children,
	className,
	dismissOnVeil = true,
	initialFocus,
	locked = false,
	onOpenChange,
	open,
	...props
}: ModalProps) => {
	const dialog = useRef<HTMLDialogElement>(null);
	const isClosing = useRef(false);
	const { isLeaving, isPresent } = usePresence(open, dialog);

	useEffect(() => {
		const node = dialog.current;

		if (!node || !isPresent) return;

		const opener = document.activeElement;

		if (!node.open) node.showModal();

		// shown: a close of its own that never said so (its dialog left the page first) is
		// forgotten, or it would pass for the next close of the browser
		isClosing.current = false;

		const target =
			initialFocus?.current ?? node.querySelector<HTMLElement>(FIELDS);

		if (target) target.focus();
		else if (!node.contains(document.activeElement)) node.focus();

		return () => {
			if (node.open) {
				// its own close, not the browser's. A browser fires `close` later, once this
				// has ended: the mark stays until that event takes it
				isClosing.current = true;
				node.close();
			}

			// back to what opened it, if it is still in the page
			if (opener instanceof HTMLElement && opener.isConnected)
				opener.focus();
		};
	}, [initialFocus, isPresent]);

	// the dialog is its own veil: a press and release on it, not on what is inside, asks to
	// close (a text selection dragged out of the panel ends on the veil, and must not)
	useEffect(() => {
		const node = dialog.current;

		if (!node || !open || !dismissOnVeil || locked) return;

		let isPressedOnVeil = false;

		const handlePointerDown = (event: PointerEvent) => {
			isPressedOnVeil = event.target === node;
		};

		const handleClick = (event: MouseEvent) => {
			if (event.target === node && isPressedOnVeil) onOpenChange(false);

			isPressedOnVeil = false;
		};

		node.addEventListener('pointerdown', handlePointerDown);
		node.addEventListener('click', handleClick);

		return () => {
			node.removeEventListener('pointerdown', handlePointerDown);
			node.removeEventListener('click', handleClick);
		};
	}, [dismissOnVeil, locked, onOpenChange, open]);

	const requestClose = () => {
		if (!locked) onOpenChange(false);
	};

	const handleKeyDown = (event: KeyboardEvent<HTMLDialogElement>) => {
		props.onKeyDown?.(event);

		if (event.key !== 'Escape' || event.defaultPrevented) return;

		// handled here: no native close request follows, so a second Escape cannot
		// close a dialog that refused the first
		event.preventDefault();
		event.stopPropagation();
		requestClose();
	};

	if (!isPresent) return null;

	return (
		<dialog
			{...props}
			className={cx(styles.root, className)}
			data-leaving={isLeaving || undefined}
			onCancel={(event) => {
				props.onCancel?.(event);
				event.preventDefault();
				requestClose();
			}}
			onClose={(event) => {
				const node = event.currentTarget;
				const isOwn = isClosing.current;

				props.onClose?.(event);
				isClosing.current = false;

				// the close of its own clean-up, one that arrives once it shows again (its
				// effects run twice when it is mounted open in development), or that of a
				// dialog that already left the page: nobody closed it
				if (isOwn || node.open || !node.isConnected) return;

				// closed by the browser all the same: stay open if locked, else tell the parent
				if (locked) node.showModal();
				else onOpenChange(false);
			}}
			onKeyDown={handleKeyDown}
			ref={dialog}
			tabIndex={-1}
		>
			{children}
		</dialog>
	);
};

export interface ModalProps extends Omit<ComponentProps<'dialog'>, 'open'> {
	open: boolean;
	/** A click on the veil asks to close. */
	dismissOnVeil?: boolean;
	/** What takes the focus when it opens. Default: its first field, or the dialog. */
	initialFocus?: RefObject<HTMLElement | null>;
	/** Nothing closes it: something is pending. */
	locked?: boolean;
	onOpenChange: (open: boolean) => void;
}
