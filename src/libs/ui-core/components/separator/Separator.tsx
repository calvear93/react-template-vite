import { type ComponentProps } from 'react';
import { cx } from '../../internal/cx.ts';
import styles from './Separator.module.css';

/**
 * A line between two things. Decorative by default (hidden from assistive
 * technology); `decorative={false}` makes it a real change of topic.
 *
 * @example
 * ```tsx
 * <Separator />
 * <Separator orientation='vertical' />
 * ```
 *
 * @returns separator
 */
export const Separator = ({
	className,
	decorative = true,
	orientation = 'horizontal',
	...props
}: SeparatorProps) => (
	<hr
		className={cx(styles.root, styles[orientation], className)}
		{...(decorative
			? { 'aria-hidden': true }
			: { 'aria-orientation': orientation })}
		{...props}
	/>
);

export interface SeparatorProps extends ComponentProps<'hr'> {
	/** Only a visual line (default). False: a separator assistive technology announces. */
	decorative?: boolean;
	orientation?: 'horizontal' | 'vertical';
}
