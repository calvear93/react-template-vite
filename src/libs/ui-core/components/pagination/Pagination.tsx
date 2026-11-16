import { type ComponentProps, type ReactNode } from 'react';
import { type UiTexts } from '../../i18n/en.ts';
import { useTexts } from '../../i18n/texts.hook.ts';
import { type IconName } from '../../icon/icon.registry.ts';
import { Icon } from '../../icon/Icon.tsx';
import { Anchor } from '../../internal/anchor/Anchor.tsx';
import { cx } from '../../internal/cx.ts';
import { defined } from '../../internal/defined.ts';
import { paginationWindow } from './pagination-window.ts';
import styles from './Pagination.module.css';

/**
 * The pages of a list. With `href` its controls are links (the route holds the
 * page); with `onPageChange`, buttons. At the ends the previous and next controls
 * are disabled, never removed, so nothing moves under the pointer.
 *
 * `brief` says the position in words («Page 2 of 9») instead of the numbers, for
 * a narrow area; `edges` adds the first and the last page, for long lists.
 *
 * @example
 * ```tsx
 * <Pagination page={page} pages={12} onPageChange={setPage} />
 * <Pagination page={page} pages={12} href={(target) => `/reports?page=${target}`} edges />
 * ```
 *
 * @returns pagination
 */
export const Pagination = ({
	brief = false,
	className,
	edges = false,
	href,
	labels,
	onPageChange,
	page,
	pages,
	...props
}: PaginationProps) => {
	const texts = { ...useTexts().pagination, ...defined(labels) };
	const total = Math.max(Math.trunc(pages) || 1, 1);
	const current = Math.min(Math.max(Math.trunc(page) || 1, 1), total);

	const control = (
		target: number,
		label: string,
		content: ReactNode,
		{ isCurrent = false, isDisabled = false } = {},
	) => {
		const shared = {
			'aria-label': label,
			className: cx(styles.control, isCurrent && styles.current),
		};

		if (href && !isDisabled && !isCurrent)
			return (
				<Anchor key={label} {...shared} href={href(target)}>
					{content}
				</Anchor>
			);

		return (
			<button
				key={label}
				{...shared}
				aria-current={isCurrent ? 'page' : undefined}
				disabled={isDisabled || (!onPageChange && !isCurrent)}
				onClick={isCurrent ? undefined : () => onPageChange?.(target)}
				type='button'
			>
				{content}
			</button>
		);
	};

	// a step that leads nowhere (the page it is on, or beyond the ends) is disabled
	const step = (target: number, label: string, icon: IconName) =>
		control(target, label, <Icon name={icon} size='sm' />, {
			isDisabled: target < 1 || target > total || target === current,
		});

	return (
		<nav
			aria-label={texts.navigation}
			className={cx(styles.root, className)}
			{...props}
		>
			{edges && step(1, texts.first, 'chevrons-left')}
			{step(current - 1, texts.previous, 'chevron-left')}

			{brief ? (
				<span className={styles.position}>
					{texts.position(current, total)}
				</span>
			) : (
				paginationWindow(current, total).map((number, index) =>
					number === null ? (
						// an elision sits between two fixed numbers: its place is its key
						<span
							aria-hidden
							className={styles.gap}
							key={`gap-${index}`}
						>
							…
						</span>
					) : (
						control(number, texts.page(number), number, {
							isCurrent: number === current,
						})
					),
				)
			)}

			{step(current + 1, texts.next, 'chevron-right')}
			{edges && step(total, texts.last, 'chevrons-right')}
		</nav>
	);
};

export interface PaginationProps extends Omit<
	ComponentProps<'nav'>,
	'children'
> {
	/** The current page, from 1. */
	page: number;
	/** How many pages there are. */
	pages: number;
	/** The position in words instead of the page numbers. */
	brief?: boolean;
	/** Adds the first and the last page around the previous and the next one. */
	edges?: boolean;
	/** The texts of the controls. */
	labels?: Partial<UiTexts['pagination']>;
	/** Makes the controls links: the URL of a page. */
	href?: (page: number) => string;
	/** Makes the controls buttons: called with the page chosen. */
	onPageChange?: (page: number) => void;
}
