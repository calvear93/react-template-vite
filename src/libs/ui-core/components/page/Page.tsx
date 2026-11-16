import { type ComponentProps } from 'react';
import { cx } from '../../internal/cx.ts';
import styles from './Page.module.css';

/**
 * The body of a page inside an AppShell: its blocks (a PageHeader, cards, a
 * table) one under the other with the same gap, centered up to the width of the
 * kit. `narrow` keeps a form or a text at a width that reads well.
 *
 * @example
 * ```tsx
 * <Page>
 *   <PageHeader title='Orders' actions={<Button icon='plus'>New order</Button>} />
 *   <Card>…</Card>
 * </Page>
 * ```
 *
 * @returns page
 */
export const Page = ({ className, narrow = false, ...props }: PageProps) => (
	<div
		className={cx(styles.root, narrow && styles.narrow, className)}
		{...props}
	/>
);

export interface PageProps extends ComponentProps<'div'> {
	/** A reading width (a form, a detail) instead of the full width of the kit. */
	narrow?: boolean;
}
