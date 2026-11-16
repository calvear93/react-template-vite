import { type ComponentProps, type ReactNode } from 'react';
import { type IconName } from '../../icon/icon.registry.ts';
import { Icon } from '../../icon/Icon.tsx';
import { cx } from '../../internal/cx.ts';
import { TONE_ICONS } from '../../internal/tone.ts';
import styles from './InfoNote.module.css';

/**
 * A note that goes with content and never asks for anything: a clarification, a
 * legal remark, where a figure comes from. It is not announced. For what the
 * person must act on, use an Alert.
 *
 * @example
 * ```tsx
 * <InfoNote title='Legal deadline'>
 *   The report must be filed within 24 hours of the accident.
 * </InfoNote>
 * ```
 *
 * @returns note
 */
export const InfoNote = ({
	children,
	className,
	icon,
	title,
	tone = 'neutral',
	...props
}: InfoNoteProps) => (
	<div className={cx(styles.root, styles[tone], className)} {...props}>
		<Icon
			className={styles.icon}
			name={icon ?? TONE_ICONS[tone]}
			size='sm'
		/>

		<div className={styles.content}>
			{title && <p className={styles.title}>{title}</p>}
			{children}
		</div>
	</div>
);

export interface InfoNoteProps extends Omit<ComponentProps<'div'>, 'title'> {
	icon?: IconName;
	title?: ReactNode;
	tone?: 'info' | 'neutral' | 'warning';
}
