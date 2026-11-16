import { type ReactNode, useId } from 'react';
import { useTexts } from '../../i18n/texts.hook.ts';
import { Icon } from '../../icon/Icon.tsx';
import { cx } from '../../internal/cx.ts';
import { Modal, type ModalProps } from '../../internal/modal/Modal.tsx';
import { ScrollArea } from '../../internal/scroll-area/ScrollArea.tsx';
import styles from './Drawer.module.css';

/**
 * A side panel over the page, for a secondary task that keeps the page in view:
 * a fixed header and footer, a body that scrolls. Modal, like Dialog: Escape, the
 * veil and its close button ask to close through `onOpenChange(false)`.
 *
 * The parent decides: to keep it open over unsaved data, answer the request in
 * `onOpenChange` (e.g. `if (await confirm(…)) setIsOpen(false)`).
 *
 * @example
 * ```tsx
 * <Drawer open={isOpen} onOpenChange={setIsOpen} title='Filters'
 *   footer={<Button onClick={apply}>Apply filters</Button>}>
 *   …
 * </Drawer>
 * ```
 *
 * @returns drawer
 */
export const Drawer = ({
	children,
	className,
	closeLabel,
	footer,
	onOpenChange,
	side = 'right',
	size = 'md',
	title,
	...props
}: DrawerProps) => {
	const texts = useTexts().drawer;
	const titleId = useId();

	return (
		<Modal
			aria-labelledby={titleId}
			className={styles.stage}
			onOpenChange={onOpenChange}
			{...props}
		>
			<div
				className={cx(
					styles.panel,
					styles[side],
					styles[size],
					className,
				)}
			>
				<div className={styles.header}>
					<h2 className={styles.title} id={titleId}>
						{title}
					</h2>
					<button
						aria-label={closeLabel ?? texts.close}
						className={styles.close}
						onClick={() => onOpenChange(false)}
						type='button'
					>
						<Icon name='close' size='sm' />
					</button>
				</div>

				<ScrollArea className={styles.body}>{children}</ScrollArea>
				{footer && <div className={styles.footer}>{footer}</div>}
			</div>
		</Modal>
	);
};

export interface DrawerProps extends Omit<
	ModalProps,
	'aria-labelledby' | 'title'
> {
	/** Names the panel. */
	title: ReactNode;
	closeLabel?: string;
	/** The actions of the panel, fixed at its bottom. */
	footer?: ReactNode;
	side?: 'left' | 'right';
	size?: 'lg' | 'md' | 'sm' | 'xl';
}
