import { type ComponentProps } from 'react';
import { cx } from '../../internal/cx.ts';
import styles from './StatusDot.module.css';

/**
 * A dot of state, for a live state next to its text. Alone, it needs a `label`:
 * the state said in words for assistive technology. `pulse` marks what is
 * happening now.
 *
 * @example
 * ```tsx
 * <StatusDot tone='success' /> Online
 * <StatusDot tone='danger' label='Offline' />
 * ```
 *
 * @returns dot
 */
export const StatusDot = ({
	className,
	label,
	pulse = false,
	tone = 'success',
	...props
}: StatusDotProps) => (
	<span
		className={cx(
			styles.root,
			styles[tone],
			pulse && styles.pulse,
			className,
		)}
		{...(label
			? { 'aria-label': label, role: 'img' }
			: { 'aria-hidden': true })}
		{...props}
	/>
);

export interface StatusDotProps extends Omit<
	ComponentProps<'span'>,
	'children'
> {
	/** The state in words, for a dot that stands alone. */
	label?: string;
	/** Beats, for a state that is live. */
	pulse?: boolean;
	tone?: 'danger' | 'neutral' | 'success' | 'warning';
}
