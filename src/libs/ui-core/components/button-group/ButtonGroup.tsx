import { type ComponentProps } from 'react';
import { cx } from '../../internal/cx.ts';
import styles from './ButtonGroup.module.css';

/**
 * Options of one decision side by side, joined in one piece. Its `label` names
 * the group for assistive technology; each button keeps its own Tab stop.
 *
 * @example
 * ```tsx
 * <ButtonGroup label='View'>
 *   <Button variant='outlined'>List</Button>
 *   <Button variant='outlined'>Cards</Button>
 * </ButtonGroup>
 * ```
 *
 * @returns group of buttons
 */
export const ButtonGroup = ({
	className,
	label,
	...props
}: ButtonGroupProps) => (
	<div
		aria-label={label}
		className={cx(styles.root, className)}
		role='group'
		{...props}
	/>
);

export interface ButtonGroupProps extends ComponentProps<'div'> {
	/** What the buttons decide, for assistive technology. */
	label: string;
}
