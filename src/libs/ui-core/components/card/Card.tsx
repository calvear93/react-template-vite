import { type ComponentProps, type ReactNode, useId } from 'react';
import { cx } from '../../internal/cx.ts';
import styles from './Card.module.css';

/**
 * A surface that groups one area: its title (a heading that names the region),
 * description and a label of context in the header, the actions at the right,
 * the content and a footer at the bottom.
 *
 * @example
 * ```tsx
 * <Card title='Worker details' description='As they appear in the contract'
 *   actions={<Button size='sm' variant='outlined'>Edit</Button>}>
 *   <DataGrid entries={entries} />
 * </Card>
 * ```
 *
 * @returns card
 */
export const Card = ({
	actions,
	children,
	className,
	description,
	elevation = 'sm',
	footer,
	headingLevel = 2,
	label,
	title,
	...props
}: CardProps) => {
	const titleId = useId();
	const Heading = `h${headingLevel}` as const;
	const hasHeader = Boolean(title ?? actions ?? label ?? description);

	return (
		<section
			aria-labelledby={title ? titleId : undefined}
			className={cx(styles.root, styles[elevation], className)}
			{...props}
		>
			{hasHeader && (
				<div className={styles.header}>
					<div className={styles.titles}>
						{label && <span className={styles.label}>{label}</span>}
						{title && (
							<Heading className={styles.title} id={titleId}>
								{title}
							</Heading>
						)}
						{description && (
							<p className={styles.description}>{description}</p>
						)}
					</div>
					{actions && <div className={styles.actions}>{actions}</div>}
				</div>
			)}

			{children && <div className={styles.content}>{children}</div>}
			{footer && <div className={styles.footer}>{footer}</div>}
		</section>
	);
};

export interface CardProps extends Omit<ComponentProps<'section'>, 'title'> {
	/** Buttons at the right of the header. */
	actions?: ReactNode;
	description?: ReactNode;
	/** The shadow of the card: none on a surface of its own, more for what floats. */
	elevation?: 'lg' | 'md' | 'none' | 'sm';
	/** Anchored at the bottom of the card. */
	footer?: ReactNode;
	headingLevel?: 2 | 3 | 4 | 5 | 6;
	/** A short context above the title. */
	label?: ReactNode;
	/** Names the card. */
	title?: ReactNode;
}
