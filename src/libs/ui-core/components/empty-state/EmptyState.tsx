import { type ComponentProps, type ReactNode } from 'react';
import { type IconName } from '../../icon/icon.registry.ts';
import { Icon } from '../../icon/Icon.tsx';
import { cx } from '../../internal/cx.ts';
import styles from './EmptyState.module.css';

/**
 * A list or a section without items. An empty state is an answer: the `title`
 * says why it is empty, the text what to do, the `action` does it. `compact`
 * (no icon, less air) is for inside a card or a panel. An error is an Alert.
 *
 * @example
 * ```tsx
 * <EmptyState title='No reports yet'
 *   action={<Button href='/reports/new'>File a report</Button>}>
 *   When you file one, it will appear here with its status.
 * </EmptyState>
 * ```
 *
 * @returns empty state
 */
export const EmptyState = ({
	action,
	children,
	className,
	compact = false,
	headingLevel = 3,
	icon = 'inbox',
	title,
	...props
}: EmptyStateProps) => {
	const Heading = `h${headingLevel}` as const;

	return (
		<div
			className={cx(styles.root, compact && styles.compact, className)}
			{...props}
		>
			{!compact && <Icon className={styles.icon} name={icon} size='lg' />}
			<Heading className={styles.title}>{title}</Heading>
			{children && <p className={styles.text}>{children}</p>}
			{action && <div className={styles.action}>{action}</div>}
		</div>
	);
};

export interface EmptyStateProps extends Omit<ComponentProps<'div'>, 'title'> {
	/** Why it is empty. */
	title: ReactNode;
	/** A button or a link that does what the text says. */
	action?: ReactNode;
	/** No icon and less air. */
	compact?: boolean;
	headingLevel?: 2 | 3 | 4 | 5 | 6;
	icon?: IconName;
}
