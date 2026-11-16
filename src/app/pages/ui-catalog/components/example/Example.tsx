import { type PropsWithChildren, type ReactNode, useId } from 'react';
import styles from './Example.module.css';

/**
 * An example of the catalog: a titled card with the live components inside,
 * and a note on when to use them.
 *
 * @returns example
 */
export const Example = ({
	children,
	layout = 'row',
	note,
	title,
}: ExampleProps) => {
	const titleId = useId();

	return (
		<section aria-labelledby={titleId} className={styles.example}>
			<header className={styles.header}>
				<h2 className={styles.title} id={titleId}>
					{title}
				</h2>
				{note && <p className={styles.note}>{note}</p>}
			</header>

			<div className={`${styles.stage}  ${styles[layout]}`}>
				{children}
			</div>
		</section>
	);
};

export interface ExampleProps extends PropsWithChildren {
	title: string;
	/** How the examples lay out: side by side (wrapping), stacked, in a grid of small cells or in columns of fields. */
	layout?: 'columns' | 'grid' | 'row' | 'stack';
	note?: ReactNode;
}
