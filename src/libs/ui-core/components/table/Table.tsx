import { type ComponentProps, type ReactNode, useId } from 'react';
import { cx } from '../../internal/cx.ts';
import { ScrollArea } from '../../internal/scroll-area/ScrollArea.tsx';
import styles from './Table.module.css';

/**
 * A simple table for a few rows that need no sorting, paging or row actions:
 * titles and cells. Its caption is shown above it and names it. Wider than its
 * place, it scrolls sideways inside its own box, which a keyboard reaches. For a
 * list of items use DataTable.
 *
 * @example
 * ```tsx
 * <Table caption='Contributions of the period'
 *   headers={['Month', 'Workers', 'Amount']}
 *   rows={[['October', 42, '$1,250,000'], ['November', 44, '$1,310,000']]} />
 * ```
 *
 * @returns table
 */
export const Table = ({
	caption,
	className,
	density = 'comfortable',
	headers,
	rows,
	...props
}: TableProps) => {
	const captionId = useId();

	return (
		<ScrollArea
			aria-labelledby={caption ? captionId : undefined}
			className={cx(styles.root, styles[density], className)}
			{...props}
		>
			<table className={styles.table}>
				{caption && (
					<caption className={styles.caption} id={captionId}>
						{caption}
					</caption>
				)}
				<thead>
					<tr>
						{headers.map((header, index) => (
							// columns are fixed: the index is a stable key
							<th
								className={styles.header}
								key={index}
								scope='col'
							>
								{header}
							</th>
						))}
					</tr>
				</thead>
				<tbody>
					{rows.map((cells, rowIndex) => (
						// a static table: rows and cells keep their place
						<tr className={styles.row} key={rowIndex}>
							{cells.map((cell, index) => (
								<td className={styles.cell} key={index}>
									{cell}
								</td>
							))}
						</tr>
					))}
				</tbody>
			</table>
		</ScrollArea>
	);
};

export interface TableProps extends Omit<ComponentProps<'div'>, 'children'> {
	/** The title of each column. */
	headers: readonly ReactNode[];
	/** The cells of each row, in the order of the headers. */
	rows: readonly (readonly ReactNode[])[];
	/** Names the table, above it. */
	caption?: ReactNode;
	density?: 'comfortable' | 'compact';
}
