import { type ComponentProps } from 'react';
import { cx } from '../../internal/cx.ts';
import styles from './Skeleton.module.css';

/**
 * A placeholder with the shape of content that is loading, so the page does not
 * jump when it arrives. Decorative: say that it is loading with a Spinner or an
 * `aria-busy` region next to it.
 *
 * @example
 * ```tsx
 * <Skeleton width='12rem' />
 * <Skeleton height='96px' />
 * ```
 *
 * @returns skeleton
 */
export const Skeleton = ({
	className,
	height = '1rem',
	style,
	width = '100%',
	...props
}: SkeletonProps) => (
	<span
		aria-hidden
		className={cx(styles.root, className)}
		style={{ blockSize: height, inlineSize: width, ...style }}
		{...props}
	/>
);

export interface SkeletonProps extends Omit<
	ComponentProps<'span'>,
	'children'
> {
	/** A CSS length. Default: one line of text. */
	height?: string;
	/** A CSS length. Default: the width of its container. */
	width?: string;
}
