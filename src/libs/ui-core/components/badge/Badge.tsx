import { type ComponentProps } from 'react';
import { cx } from '../../internal/cx.ts';
import styles from './Badge.module.css';

/**
 * A short state or category. It always carries its word: the tone only supports it.
 * `neutral` is for what is not a state (a role, a category); `primary` is the solid
 * one, for a count; `dot` adds the dot of its tone.
 *
 * @example
 * ```tsx
 * <Badge tone='success' dot>Active</Badge>
 * <Badge tone='primary'>12</Badge>
 * ```
 *
 * @returns badge
 */
export const Badge = ({
	children,
	className,
	dot = false,
	size = 'md',
	tone = 'neutral',
	...props
}: BadgeProps) => (
	<span
		className={cx(styles.root, styles[tone], styles[size], className)}
		{...props}
	>
		{dot && <span aria-hidden className={styles.dot} />}
		{children}
	</span>
);

export interface BadgeProps extends ComponentProps<'span'> {
	tone?:
		| 'brand'
		| 'danger'
		| 'info'
		| 'neutral'
		| 'primary'
		| 'success'
		| 'warning';
	/** A dot of the tone before the text. */
	dot?: boolean;
	size?: 'lg' | 'md' | 'sm';
}
