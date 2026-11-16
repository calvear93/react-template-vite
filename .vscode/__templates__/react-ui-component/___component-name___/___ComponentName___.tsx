import { type ComponentProps } from 'react';
import { cx } from '../../internal/cx.ts';
import styles from './___ComponentName___.module.css';

/**
 * ___ComponentName___ of the UI kit.
 *
 * @example
 * ```tsx
 * <___ComponentName___>content</___ComponentName___>
 * ```
 *
 * @returns component
 */
export const ___ComponentName___ = ({
	className,
	...props
}: ___ComponentName___Props) => (
	<div className={cx(styles.root, className)} {...props} />
);

export interface ___ComponentName___Props extends ComponentProps<'div'> {}
