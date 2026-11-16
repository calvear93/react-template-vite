import { type ComponentProps, type ReactNode } from 'react';
import { type UiTexts } from '../../i18n/en.ts';
import { useTexts } from '../../i18n/texts.hook.ts';
import { type IconName } from '../../icon/icon.registry.ts';
import { Icon } from '../../icon/Icon.tsx';
import { cx } from '../../internal/cx.ts';
import { defined } from '../../internal/defined.ts';
import { VisuallyHidden } from '../visually-hidden/VisuallyHidden.tsx';
import styles from './Timeline.module.css';

/**
 * What happened, in order: an ordered list of milestones, each with its date and
 * detail. The state of a milestone (`done`, `current`, or pending without one) is
 * drawn in its marker (a check, a clock, an empty ring: never by color alone) and
 * said in words; the current one is `aria-current`.
 *
 * @example
 * ```tsx
 * <Timeline items={[
 *   { title: 'Report received', date: '11/02/2026 09:14', state: 'done' },
 *   { title: 'Under medical evaluation', date: 'Since 11/03/2026', state: 'current' },
 *   { title: 'Resolution' },
 * ]} />
 * ```
 *
 * @returns timeline
 */
export const Timeline = ({
	className,
	items,
	labels,
	...props
}: TimelineProps) => {
	const stateLabels = { ...useTexts().timeline, ...defined(labels) };

	return (
		<ol className={cx(styles.root, className)} {...props}>
			{items.map(({ date, detail, icon, state, title }, index) => (
				<li
					aria-current={state === 'current' ? 'step' : undefined}
					className={styles.item}
					data-state={state ?? 'pending'}
					// milestones are appended in order: the index is a stable key
					key={index}
				>
					<span aria-hidden className={styles.rail}>
						<span className={styles.marker}>
							{icon && <Icon name={icon} size='sm' />}
							{!icon && state === 'done' && (
								<Icon name='check' size='sm' />
							)}
							{!icon && state === 'current' && (
								<Icon name='clock' size='sm' />
							)}
						</span>
						<span className={styles.connector} />
					</span>

					<div className={styles.body}>
						<div className={styles.title}>
							{title}
							<VisuallyHidden>
								{' '}
								({stateLabels[state ?? 'pending']})
							</VisuallyHidden>
						</div>
						{date && <p className={styles.date}>{date}</p>}
						{detail && (
							<div className={styles.detail}>{detail}</div>
						)}
					</div>
				</li>
			))}
		</ol>
	);
};

export interface TimelineItem {
	title: ReactNode;
	date?: ReactNode;
	detail?: ReactNode;
	/** An icon in the marker instead of the one of its state. */
	icon?: IconName;
	/** Done, the current one, or pending when it has none. */
	state?: 'current' | 'done';
}

export interface TimelineProps extends Omit<ComponentProps<'ol'>, 'children'> {
	items: readonly TimelineItem[];
	/** The words of each state, for assistive technology. */
	labels?: Partial<Record<keyof UiTexts['timeline'], string>>;
}
