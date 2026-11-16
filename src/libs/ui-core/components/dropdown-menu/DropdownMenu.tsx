import {
	type AriaAttributes,
	type ComponentProps,
	type KeyboardEvent,
	type ReactNode,
	use,
	useEffect,
	useId,
	useRef,
} from 'react';
import { type IconName } from '../../icon/icon.registry.ts';
import { Icon } from '../../icon/Icon.tsx';
import { Anchor } from '../../internal/anchor/Anchor.tsx';
import { cx } from '../../internal/cx.ts';
import { Popup } from '../../internal/popup/Popup.tsx';
import { moveRovingFocus } from '../../internal/roving-focus.ts';
import { useControllableState } from '../../internal/use-controllable-state.hook.ts';
import { useOutsidePress } from '../../internal/use-outside-press.hook.ts';
import { Button, type ButtonProps } from '../button/Button.tsx';
import { DropdownMenuContext } from './dropdown-menu.context.ts';
import styles from './DropdownMenu.module.css';

const ITEMS = '[role="menuitem"]';

/**
 * Secondary actions behind one button. The trigger says it has a menu and whether
 * it is open; opening moves the focus to the first item; the arrows move between
 * items (Home and End jump), Escape closes and gives the focus back, Tab and a
 * press outside close.
 *
 * The default trigger is a button with `label` (only its `icon` when it has one);
 * `renderTrigger` draws another one with the props the menu gives it.
 *
 * @example
 * ```tsx
 * <DropdownMenu label='Actions'>
 *   <DropdownMenuItem icon='edit' onSelect={edit}>Edit</DropdownMenuItem>
 *   <DropdownMenuItem icon='download' href='/orders/42.pdf' download>Download</DropdownMenuItem>
 *   <DropdownMenuSeparator />
 *   <DropdownMenuItem icon='trash' tone='danger' onSelect={remove}>Remove access</DropdownMenuItem>
 * </DropdownMenu>
 * ```
 *
 * @returns dropdown menu
 */
export const DropdownMenu = ({
	align = 'start',
	children,
	className,
	defaultOpen = false,
	header,
	icon,
	label,
	onOpenChange,
	open,
	renderTrigger,
	variant = 'ghost',
}: DropdownMenuProps) => {
	const menuId = useId();
	const root = useRef<HTMLSpanElement>(null);
	const panel = useRef<HTMLDivElement>(null);
	const [isOpen, setIsOpen] = useControllableState({
		defaultValue: defaultOpen,
		onChange: onOpenChange,
		value: open,
	});

	const close = (refocus = false) => {
		setIsOpen(false);

		if (refocus)
			root.current
				?.querySelector<HTMLElement>('[aria-haspopup]')
				?.focus();
	};

	useOutsidePress(isOpen, [root], () => setIsOpen(false));

	// opening moves the focus into the menu: its first item
	useEffect(() => {
		if (isOpen)
			panel.current
				?.querySelector<HTMLElement>(
					`${ITEMS}:not([aria-disabled="true"])`,
				)
				?.focus();
	}, [isOpen]);

	const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
		if (
			moveRovingFocus(event, { orientation: 'vertical', selector: ITEMS })
		)
			return;

		if (event.key === 'Tab') close();

		if (event.key === 'Escape') {
			// only the menu closes: not the dialog it may be in
			event.preventDefault();
			event.stopPropagation();
			close(true);
		}
	};

	const triggerProps: DropdownMenuTriggerProps = {
		'aria-controls': isOpen ? menuId : undefined,
		'aria-expanded': isOpen,
		'aria-haspopup': 'menu',
		onClick: () => setIsOpen(!isOpen),
		onKeyDown: (event) => {
			if (event.key !== 'ArrowDown') return;

			event.preventDefault();
			setIsOpen(true);
		},
	};

	return (
		<span className={cx(styles.root, className)} ref={root}>
			{renderTrigger ? (
				renderTrigger(triggerProps)
			) : (
				<Button
					{...triggerProps}
					icon={icon}
					iconEnd={icon ? undefined : 'chevron-down'}
					iconOnly={Boolean(icon)}
					size='sm'
					variant={variant}
				>
					{label}
				</Button>
			)}

			<Popup
				align={align}
				anchor={root}
				className={styles.panel}
				onKeyDown={handleKeyDown}
				open={isOpen}
				ref={panel}
			>
				{header && <div className={styles.header}>{header}</div>}
				<div aria-label={label} id={menuId} role='menu'>
					<DropdownMenuContext value={() => close(true)}>
						{children}
					</DropdownMenuContext>
				</div>
			</Popup>
		</span>
	);
};

/** What the trigger of a DropdownMenu needs: spread them on a button. */
export interface DropdownMenuTriggerProps {
	'aria-controls': string | undefined;
	'aria-expanded': boolean;
	'aria-haspopup': AriaAttributes['aria-haspopup'];
	onClick: () => void;
	onKeyDown: (event: KeyboardEvent<HTMLElement>) => void;
}

export interface DropdownMenuProps {
	/** The items of the menu. */
	children: ReactNode;
	/** The text of the trigger, and the name of the menu. */
	label: string;
	/** `end` lines the panel up with the end of the trigger (a trigger at the right edge). */
	align?: 'end' | 'start';
	className?: string;
	/** Open at first, uncontrolled. */
	defaultOpen?: boolean;
	/** Goes at the top of the panel, out of the items: who the menu is about. */
	header?: ReactNode;
	/** Makes the default trigger a round icon button named by `label`. */
	icon?: IconName;
	/** Open or closed, controlled. */
	open?: boolean;
	variant?: ButtonProps['variant'];
	onOpenChange?: (open: boolean) => void;
	/** Draws another trigger: a button with these props. */
	renderTrigger?: (props: DropdownMenuTriggerProps) => ReactNode;
}

/**
 * An action of a DropdownMenu. `onSelect` runs it; with `href` it is a link.
 * Choosing it closes the menu and gives the focus back to the trigger. A disabled
 * item stays visible and reachable, and does nothing.
 *
 * @returns menu item
 */
export const DropdownMenuItem = ({
	children,
	className,
	disabled = false,
	href,
	icon,
	onSelect,
	tone = 'default',
	...props
}: DropdownMenuItemProps) => {
	const close = use(DropdownMenuContext);
	const shared = {
		'aria-disabled': disabled || undefined,
		role: 'menuitem',
		tabIndex: -1,
		className: cx(
			styles.item,
			tone === 'danger' && styles.danger,
			className,
		),
	} as const;
	const content = (
		<>
			{icon && <Icon className={styles.icon} name={icon} size='sm' />}
			{children}
		</>
	);

	const select = () => {
		close?.();
		onSelect?.();
	};

	if (href !== undefined && !disabled)
		return (
			<Anchor {...props} {...shared} href={href} onClick={select}>
				{content}
			</Anchor>
		);

	return (
		<button
			{...shared}
			onClick={disabled ? undefined : select}
			type='button'
		>
			{content}
		</button>
	);
};

export interface DropdownMenuItemProps extends Omit<
	ComponentProps<'a'>,
	'onSelect'
> {
	children: ReactNode;
	disabled?: boolean;
	icon?: IconName;
	/** `danger`: an item that ends or removes something. */
	tone?: 'danger' | 'default';
	onSelect?: () => void;
}

/**
 * A line between groups of items of a DropdownMenu.
 *
 * @returns separator
 */
export const DropdownMenuSeparator = () => (
	<div className={styles.separator} role='separator' />
);

/**
 * A group of items of a DropdownMenu, named by its label.
 *
 * @returns group
 */
export const DropdownMenuGroup = ({
	children,
	label,
}: DropdownMenuGroupProps) => {
	const labelId = useId();

	return (
		<div aria-labelledby={labelId} role='group'>
			<div className={styles.groupLabel} id={labelId}>
				{label}
			</div>
			{children}
		</div>
	);
};

export interface DropdownMenuGroupProps {
	children: ReactNode;
	label: ReactNode;
}
