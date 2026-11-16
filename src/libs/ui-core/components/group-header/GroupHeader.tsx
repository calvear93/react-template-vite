import { type ComponentProps, type ReactNode } from 'react';
import { type IconName } from '../../icon/icon.registry.ts';
import { Icon } from '../../icon/Icon.tsx';
import { cx } from '../../internal/cx.ts';
import styles from './GroupHeader.module.css';

/**
 * The heading of a group inside an area: its title, a context next to it (a
 * count, a date), the rule that separates the group and an action at the end.
 *
 * @example
 * ```tsx
 * <GroupHeader title='Documents' context='3 of 5'
 *   action={<Button size='sm' variant='link'>View all</Button>} />
 * ```
 *
 * @returns group header
 */
export const GroupHeader = ({
	action,
	className,
	context,
	headingLevel = 3,
	highlighted = false,
	icon,
	title,
	...props
}: GroupHeaderProps) => {
	const Heading = `h${headingLevel}` as const;

	return (
		<div
			className={cx(
				styles.root,
				highlighted && styles.highlighted,
				className,
			)}
			{...props}
		>
			{icon && <Icon className={styles.icon} name={icon} size='sm' />}
			<Heading className={styles.title}>{title}</Heading>
			{context && <span className={styles.context}>{context}</span>}
			<span aria-hidden className={styles.rule} />
			{action}
		</div>
	);
};

export interface GroupHeaderProps extends Omit<
	ComponentProps<'div'>,
	'children' | 'title'
> {
	title: ReactNode;
	/** A button or a link at the end of the rule. */
	action?: ReactNode;
	/** A short text next to the title: a count, a date. */
	context?: ReactNode;
	headingLevel?: 2 | 3 | 4 | 5 | 6;
	/** Raises the title a step, in the heading voice. */
	highlighted?: boolean;
	icon?: IconName;
}
