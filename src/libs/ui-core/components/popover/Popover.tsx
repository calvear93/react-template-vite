import {
	type AriaAttributes,
	type FocusEvent,
	type KeyboardEvent,
	type ReactNode,
	useEffect,
	useId,
	useRef,
} from 'react';
import { type IconName } from '../../icon/icon.registry.ts';
import { cx } from '../../internal/cx.ts';
import { Popup } from '../../internal/popup/Popup.tsx';
import { useControllableState } from '../../internal/use-controllable-state.hook.ts';
import { useOutsidePress } from '../../internal/use-outside-press.hook.ts';
import { Button, type ButtonProps } from '../button/Button.tsx';
import styles from './Popover.module.css';

const FOCUSABLE =
	'a[href], button:not(:disabled), input:not(:disabled, [type="hidden"]), select:not(:disabled), textarea:not(:disabled), [tabindex="0"]';

/**
 * A panel that hangs from a button, with any content: a few filters, the detail
 * of a figure, a short form. A dialog that is not modal: the page stays in use,
 * the focus goes into the panel when it opens (its first control) and back to
 * the button on Escape, and it closes on a press or a focus elsewhere. In the top
 * layer, so nothing clips it.
 *
 * For a list of actions use DropdownMenu; for a hint on a control, Tooltip; for a
 * task that must be finished or cancelled, Dialog.
 *
 * @example
 * ```tsx
 * <Popover label='Filters' icon='filter'>
 *   <Field label='Status'><Select options={states} /></Field>
 *   <Button size='sm'>Apply</Button>
 * </Popover>
 * ```
 *
 * @returns button with its popover
 */
export const Popover = ({
	align = 'start',
	children,
	className,
	defaultOpen = false,
	icon,
	label,
	onOpenChange,
	open,
	renderTrigger,
	variant = 'outlined',
}: PopoverProps) => {
	const panelId = useId();
	const root = useRef<HTMLSpanElement>(null);
	const panel = useRef<HTMLDivElement>(null);
	const [isOpen, setIsOpen] = useControllableState({
		defaultValue: defaultOpen,
		onChange: onOpenChange,
		value: open,
	});

	useOutsidePress(isOpen, [root], () => setIsOpen(false));

	// opening moves the focus into the panel: its first control, or the panel itself
	useEffect(() => {
		if (!isOpen) return;

		const node = panel.current;

		(node?.querySelector<HTMLElement>(FOCUSABLE) ?? node)?.focus();
	}, [isOpen]);

	const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
		if (event.key !== 'Escape' || event.defaultPrevented) return;

		// only the popover closes: not the dialog it may be in
		event.preventDefault();
		event.stopPropagation();
		setIsOpen(false);
		root.current?.querySelector<HTMLElement>('[aria-haspopup]')?.focus();
	};

	const handleBlur = (event: FocusEvent) => {
		if (isOpen && !root.current?.contains(event.relatedTarget))
			setIsOpen(false);
	};

	const triggerProps: PopoverTriggerProps = {
		'aria-controls': isOpen ? panelId : undefined,
		'aria-expanded': isOpen,
		'aria-haspopup': 'dialog',
		onClick: () => setIsOpen(!isOpen),
	};

	return (
		<span
			className={cx(styles.root, className)}
			onBlur={handleBlur}
			ref={root}
		>
			{renderTrigger ? (
				renderTrigger(triggerProps)
			) : (
				<Button
					{...triggerProps}
					icon={icon}
					iconEnd={icon ? undefined : 'chevron-down'}
					size='sm'
					variant={variant}
				>
					{label}
				</Button>
			)}

			<Popup
				align={align}
				anchor={root}
				aria-label={label}
				aria-modal={false}
				className={styles.panel}
				id={panelId}
				onKeyDown={handleKeyDown}
				open={isOpen}
				ref={panel}
				role='dialog'
				tabIndex={-1}
			>
				{children}
			</Popup>
		</span>
	);
};

/** What the trigger of a Popover needs: spread them on a button. */
export interface PopoverTriggerProps {
	'aria-controls': string | undefined;
	'aria-expanded': boolean;
	'aria-haspopup': AriaAttributes['aria-haspopup'];
	onClick: () => void;
}

export interface PopoverProps {
	/** What the panel holds. */
	children: ReactNode;
	/** The text of the button, and the name of the panel. */
	label: string;
	/** The edge of the button the panel lines up with. */
	align?: 'end' | 'start';
	className?: string;
	defaultOpen?: boolean;
	/** An icon before the text of the button. */
	icon?: IconName;
	/** Whether it is open. Makes it controlled. */
	open?: boolean;
	variant?: ButtonProps['variant'];
	onOpenChange?: (open: boolean) => void;
	/** Draws another trigger: a button that spreads the props it is given. */
	renderTrigger?: (props: PopoverTriggerProps) => ReactNode;
}
