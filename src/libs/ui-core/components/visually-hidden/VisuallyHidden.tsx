import { type ComponentProps } from 'react';
import { cx } from '../../internal/cx.ts';
import styles from './VisuallyHidden.module.css';

/**
 * Text only assistive technology reads: the name of an icon button, the caption of a table,
 * a change announced without moving the focus.
 *
 * @example
 * ```tsx
 * <VisuallyHidden role='status'>3 results</VisuallyHidden>
 * ```
 *
 * @returns visually hidden text
 */
export const VisuallyHidden = ({
	className,
	...props
}: VisuallyHiddenProps) => (
	<span className={cx(styles.root, className)} {...props} />
);

export interface VisuallyHiddenProps extends ComponentProps<'span'> {}
