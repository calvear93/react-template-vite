import { type ComponentProps, type ReactNode } from 'react';
import { cx } from '../../internal/cx.ts';
import { Breadcrumb, type BreadcrumbItem } from '../breadcrumb/Breadcrumb.tsx';
import styles from './PageHeader.module.css';

const isTrail = (
	breadcrumb: PageHeaderProps['breadcrumb'],
): breadcrumb is readonly BreadcrumbItem[] => Array.isArray(breadcrumb);

/**
 * The heading of a page: its title (the `<h1>` of the page), with the trail that
 * leads to it, a line under the title and its actions at the end. `breadcrumb`
 * takes the trail as data (the last item is this page) or any node. It is not a
 * `<header>`: the banner of the page is the one of its shell.
 *
 * @example
 * ```tsx
 * <PageHeader
 *   title='Report ACH-2026-001482'
 *   meta='Filed on November 5, 2026'
 *   breadcrumb={[{ label: 'Reports', href: '/reports' }, { label: 'ACH-2026-001482' }]}
 *   actions={<Button icon='edit'>Edit</Button>}
 * />
 * ```
 *
 * @returns page header
 */
export const PageHeader = ({
	actions,
	breadcrumb,
	className,
	meta,
	title,
	...props
}: PageHeaderProps) => (
	<div className={cx(styles.root, className)} {...props}>
		{isTrail(breadcrumb) ? <Breadcrumb items={breadcrumb} /> : breadcrumb}

		<div className={styles.row}>
			<div className={styles.texts}>
				<h1 className={styles.title}>{title}</h1>
				{meta && <div className={styles.meta}>{meta}</div>}
			</div>
			{actions && <div className={styles.actions}>{actions}</div>}
		</div>
	</div>
);

export interface PageHeaderProps extends Omit<
	ComponentProps<'div'>,
	'children' | 'title'
> {
	/** The title of the page. */
	title: ReactNode;
	/** The actions of the page (buttons), at the end of the title. */
	actions?: ReactNode;
	/** The trail to this page: its items (the last one is this page), or a node. */
	breadcrumb?: ReactNode | readonly BreadcrumbItem[];
	/** A line under the title. */
	meta?: ReactNode;
}
