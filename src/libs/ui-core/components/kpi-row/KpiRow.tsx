import { type ComponentProps, type ReactNode } from 'react';
import { useTexts } from '../../i18n/texts.hook.ts';
import { Icon } from '../../icon/Icon.tsx';
import { Anchor } from '../../internal/anchor/Anchor.tsx';
import { cx } from '../../internal/cx.ts';
import styles from './KpiRow.module.css';

const Kpi = ({ item, linkLabel }: { item: KpiItem; linkLabel: string }) => {
	const content = (
		<>
			<span className={styles.head}>
				<span className={styles.label}>{item.label}</span>
				{item.badge && (
					<span
						className={cx(
							styles.badge,
							styles[item.badgeTone ?? 'info'],
						)}
					>
						{item.badge}
					</span>
				)}
			</span>
			<span className={styles.value}>{item.value}</span>
			{item.sub && <span className={styles.sub}>{item.sub}</span>}
			{(item.href ?? item.onClick) && (
				<span className={styles.link}>
					{item.linkLabel ?? linkLabel}
					<Icon name='arrow-right' size='sm' />
				</span>
			)}
		</>
	);

	if (item.href)
		return (
			<Anchor
				className={cx(styles.item, styles.actionable)}
				href={item.href}
			>
				{content}
			</Anchor>
		);

	if (item.onClick)
		return (
			<button
				className={cx(styles.item, styles.actionable)}
				onClick={item.onClick}
				type='button'
			>
				{content}
			</button>
		);

	return <div className={styles.item}>{content}</div>;
};

/**
 * Figures that lead: the state of something at a glance. With `href` or
 * `onClick` the whole figure leads somewhere and says so («View details»); the
 * `badge` is a short word next to the label, never the only place of a state.
 *
 * @example
 * ```tsx
 * <KpiRow items={[
 *   { label: 'Open reports', value: 12, sub: '3 due soon', href: '/reports' },
 *   { label: 'Days without accidents', value: 148, badge: 'Record', badgeTone: 'success' },
 * ]} />
 * ```
 *
 * @returns row of figures
 */
export const KpiRow = ({
	className,
	items,
	linkLabel,
	...props
}: KpiRowProps) => {
	const texts = useTexts().kpiRow;

	return (
		<div className={cx(styles.root, className)} {...props}>
			{items
				.filter((item) => !!item)
				.map((item, index) => (
					// figures are a fixed set: the index is a stable key
					<Kpi
						item={item}
						key={index}
						linkLabel={linkLabel ?? texts.link}
					/>
				))}
		</div>
	);
};

export interface KpiItem {
	label: ReactNode;
	value: ReactNode;
	/** A short word next to the label. */
	badge?: ReactNode;
	badgeTone?: 'info' | 'success' | 'warning';
	/** Where the figure leads. */
	href?: string;
	/** The text of this figure's link. Default: the one of the row. */
	linkLabel?: string;
	/** A second line under the value. */
	sub?: ReactNode;
	onClick?: () => void;
}

export interface KpiRowProps extends Omit<ComponentProps<'div'>, 'children'> {
	/** The figures; a falsy item is skipped. */
	items: readonly (KpiItem | false | null | undefined)[];
	/** The text that says an actionable figure leads somewhere. */
	linkLabel?: string;
}
