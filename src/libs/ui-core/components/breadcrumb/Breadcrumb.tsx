import { type ComponentProps, type ReactNode } from 'react';
import { useTexts } from '../../i18n/texts.hook.ts';
import { Anchor } from '../../internal/anchor/Anchor.tsx';
import { cx } from '../../internal/cx.ts';
import styles from './Breadcrumb.module.css';

/**
 * The way back up: the trail from the start to the current page. The last item is
 * the current page (no link); the others link to their level.
 *
 * @example
 * ```tsx
 * <Breadcrumb items={[
 *   { label: 'Home', href: '/' },
 *   { label: 'Reports', href: '/reports' },
 *   { label: 'ACH-2026-001482' },
 * ]} />
 * ```
 *
 * @returns breadcrumb
 */
export const Breadcrumb = ({
	className,
	items,
	label,
	...props
}: BreadcrumbProps) => {
	const texts = useTexts().breadcrumb;

	return (
		<nav
			aria-label={label ?? texts.label}
			className={cx(styles.root, className)}
			{...props}
		>
			<ol className={styles.list}>
				{items.map((item, index) => {
					const isCurrent = index === items.length - 1;

					return (
						// a trail does not reorder: the index is a stable key
						<li className={styles.item} key={index}>
							{isCurrent || item.href === undefined ? (
								<span
									aria-current={
										isCurrent ? 'page' : undefined
									}
									className={cx(isCurrent && styles.current)}
								>
									{item.label}
								</span>
							) : (
								<Anchor
									className={styles.link}
									href={item.href}
								>
									{item.label}
								</Anchor>
							)}
							{!isCurrent && (
								<span aria-hidden className={styles.separator}>
									/
								</span>
							)}
						</li>
					);
				})}
			</ol>
		</nav>
	);
};

export interface BreadcrumbItem {
	label: ReactNode;
	/** Where the level leads. The last item never links: it is the current page. */
	href?: string;
}

export interface BreadcrumbProps extends Omit<
	ComponentProps<'nav'>,
	'children'
> {
	/** The trail, from the start to the current page. */
	items: readonly BreadcrumbItem[];
	/** The name of the navigation, for assistive technology. */
	label?: string;
}
