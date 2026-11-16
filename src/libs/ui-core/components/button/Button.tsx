import { type ComponentProps, type ReactNode } from 'react';
import { type IconName } from '../../icon/icon.registry.ts';
import { Icon } from '../../icon/Icon.tsx';
import { Anchor } from '../../internal/anchor/Anchor.tsx';
import { cx } from '../../internal/cx.ts';
import { VisuallyHidden } from '../visually-hidden/VisuallyHidden.tsx';
import styles from './Button.module.css';

const Content = ({
	children,
	icon,
	iconEnd,
	iconOnly,
	loading,
}: Pick<
	ButtonOwnProps,
	'children' | 'icon' | 'iconEnd' | 'iconOnly' | 'loading'
>) => {
	const iconSize = iconOnly ? 'md' : 'sm';

	return (
		<>
			{icon && (
				<Icon className={styles.icon} name={icon} size={iconSize} />
			)}
			{iconOnly ? (
				<VisuallyHidden>{children}</VisuallyHidden>
			) : (
				<span className={styles.label}>{children}</span>
			)}
			{iconEnd && (
				<Icon className={styles.icon} name={iconEnd} size={iconSize} />
			)}
			{loading && <span aria-hidden className={styles.spinner} />}
		</>
	);
};

const LinkButton = ({
	children,
	disabled = false,
	href,
	loading,
	...props
}: LinkButtonProps) => {
	// a link that cannot be followed: no href, said as disabled
	if (disabled || loading)
		return (
			<span
				aria-busy={props['aria-busy']}
				aria-disabled='true'
				className={props.className}
				data-loading={loading || undefined}
				role='link'
				title={props.title}
			>
				{children}
			</span>
		);

	return (
		<Anchor {...props} href={href}>
			{children}
		</Anchor>
	);
};

/**
 * Every action of a screen. One `solid` per area (the main action); `outlined` or `filled`
 * for the secondary ones, `ghost` for the way out, `destructive` for what removes. With
 * `href` it navigates: it is a link drawn as a button, through the app's router.
 *
 * `loading` keeps its width, announces it is busy and ignores clicks; `iconOnly` draws a
 * round icon button whose content is its accessible name.
 *
 * @example
 * ```tsx
 * <Button onClick={save} loading={isPending}>Save changes</Button>
 * <Button variant='outlined' icon='download' href='/orders/export'>Export</Button>
 * <Button variant='ghost' icon='trash' iconOnly>Remove access</Button>
 * ```
 *
 * @returns button
 */
export const Button = ({
	block = false,
	children,
	className,
	icon,
	iconEnd,
	iconOnly = false,
	loading = false,
	size = 'md',
	variant = 'solid',
	...props
}: ButtonProps) => {
	const shared = {
		'aria-busy': loading || undefined,
		'data-loading': loading || undefined,
		title: iconOnly && typeof children === 'string' ? children : undefined,
		className: cx(
			styles.root,
			styles[variant],
			styles[size],
			block && styles.block,
			iconOnly && styles.iconOnly,
			className,
		),
	};
	const content = (
		<Content
			icon={icon}
			iconEnd={iconEnd}
			iconOnly={iconOnly}
			loading={loading}
		>
			{children}
		</Content>
	);

	if (props.href !== undefined)
		return (
			<LinkButton {...shared} {...props} loading={loading}>
				{content}
			</LinkButton>
		);

	const { onClick, ...button } = props;

	return (
		<button
			type='button'
			{...shared}
			{...button}
			aria-disabled={loading || button['aria-disabled']}
			onClick={(event) => {
				if (loading) event.preventDefault();
				else onClick?.(event);
			}}
		>
			{content}
		</button>
	);
};

interface ButtonOwnProps {
	/** The text of the button: the effect it has («Record attempt», not «Continue»). */
	children: ReactNode;
	variant?:
		| 'destructive'
		| 'filled'
		| 'ghost'
		| 'inverse'
		| 'link'
		| 'outlined'
		| 'solid';
	/** Takes the width of its container. */
	block?: boolean;
	className?: string;
	/** An icon before the text. */
	icon?: IconName;
	/** An icon after the text. */
	iconEnd?: IconName;
	/** A round button with only its icon; the children become its accessible name. */
	iconOnly?: boolean;
	/** Busy: keeps its width, shows a spinner and ignores clicks. */
	loading?: boolean;
	size?: 'lg' | 'md' | 'sm';
}

type LinkButtonProps = Omit<ComponentProps<'a'>, 'href'> & {
	href: string;
	loading: boolean;
	/** A link that cannot be followed now. */
	disabled?: boolean;
};

export type ButtonProps = ButtonOwnProps &
	(
		| (Omit<ComponentProps<'a'>, keyof ButtonOwnProps | 'href'> & {
				href: string;
				/** A link that cannot be followed now. */
				disabled?: boolean;
		  })
		| (Omit<ComponentProps<'button'>, keyof ButtonOwnProps> & {
				href?: undefined;
		  })
	);
