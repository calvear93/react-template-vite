import { type ComponentProps, type ReactNode } from 'react';
import { useTexts } from '../../i18n/texts.hook.ts';
import { cx } from '../../internal/cx.ts';
import styles from './DataGrid.module.css';

const isEmpty = (value: ReactNode) =>
	value === null || value === undefined || value === '';

/**
 * The record of one item: label and value pairs in two columns (one when it is
 * narrow). An empty value shows a faint dash («no data» is not data); a boolean
 * reads «Yes» or «No», never a dash. `wide` spans both columns.
 *
 * @example
 * ```tsx
 * <DataGrid entries={[
 *   { label: 'RUT', value: formatRut(worker.rut) },
 *   { label: 'Email', value: worker.email },
 *   { label: 'Active', value: worker.active },
 *   { label: 'Notes', value: worker.notes, wide: true },
 * ]} />
 * ```
 *
 * @returns data grid
 */
export const DataGrid = ({
	booleanLabels,
	className,
	emptyLabel = '—',
	entries,
	...props
}: DataGridProps) => {
	const texts = useTexts().dataGrid;
	const [yes, no] = booleanLabels ?? [texts.yes, texts.no];

	return (
		<div className={cx(styles.root, className)} {...props}>
			<dl className={styles.grid}>
				{entries
					.filter((entry) => !!entry)
					.map(({ label, value, wide }, index) => (
						// the pairs of a record never reorder: the index is a stable key
						<div
							className={cx(styles.pair, wide && styles.wide)}
							key={index}
						>
							<dt className={styles.label}>{label}</dt>
							<dd
								className={styles.value}
								data-empty={isEmpty(value) || undefined}
							>
								{typeof value === 'boolean' &&
									(value ? yes : no)}
								{typeof value !== 'boolean' &&
									(isEmpty(value) ? emptyLabel : value)}
							</dd>
						</div>
					))}
			</dl>
		</div>
	);
};

export interface DataGridEntry {
	label: ReactNode;
	value: ReactNode;
	/** Spans both columns. */
	wide?: boolean;
}

export interface DataGridProps extends Omit<ComponentProps<'div'>, 'children'> {
	/** The pairs of the record; a falsy entry is skipped. */
	entries: readonly (DataGridEntry | false | null | undefined)[];
	/** What a boolean value reads as: [true, false]. */
	booleanLabels?: readonly [yes: string, no: string];
	/** What an empty value shows. */
	emptyLabel?: string;
}
