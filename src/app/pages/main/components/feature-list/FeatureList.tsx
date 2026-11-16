import { Button, Icon, type IconName } from '#libs/ui-core';
import { type ReactNode, useId } from 'react';
import styles from './FeatureList.module.css';

/**
 * What something brings, as a grouped list: one row per feature, with its icon, its
 * name and what it is, and at its end where it can be seen (a link) or what it says
 * of itself (`aside`).
 *
 * @example
 * ```tsx
 * <FeatureList
 *   title='What is in the box'
 *   items={[{ icon: 'link', title: 'Typed routes', description: 'Lazy pages and loaders.',
 *     href: '/detail', linkLabel: 'Try a route' }]}
 * />
 * ```
 *
 * @returns feature list
 */
export const FeatureList = ({ items, title }: FeatureListProps) => {
	const titleId = useId();

	return (
		<section className={styles.root}>
			<h2 className={styles.title} id={titleId}>
				{title}
			</h2>

			<ul aria-labelledby={titleId} className={styles.list}>
				{items.map((item) => (
					<li className={styles.row} key={item.title}>
						<span aria-hidden className={styles.icon}>
							<Icon name={item.icon} size='sm' />
						</span>
						<span className={styles.text}>
							<span className={styles.name}>{item.title}</span>
							<span className={styles.description}>
								{item.description}
							</span>
						</span>
						<span className={styles.end}>
							{item.aside}
							{item.href && (
								<Button
									href={item.href}
									iconEnd='chevron-right'
									size='sm'
									variant='ghost'
								>
									{item.linkLabel}
								</Button>
							)}
						</span>
					</li>
				))}
			</ul>
		</section>
	);
};

/** A feature of a FeatureList. */
export interface FeatureItem {
	/** What it is, in a line. */
	description: string;
	icon: IconName;
	/** Its name: what tells it from the others. */
	title: string;
	/** What it says of itself, at the end of its row (a state, a figure). */
	aside?: ReactNode;
	/** Where it can be seen. */
	href?: string;
	/** The text of its link. */
	linkLabel?: string;
}

export interface FeatureListProps {
	items: readonly FeatureItem[];
	/** Names the list. */
	title: string;
}
