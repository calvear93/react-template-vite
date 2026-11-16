import { type ComponentProps, useId } from 'react';
import { useLocale } from '../../format/locale.hook.ts';
import { byLocale } from '../../format/locale.ts';
import { cx } from '../../internal/cx.ts';
import styles from './Progress.module.css';

/** A share of the whole, as the language of the kit writes a percentage. */
const percentFormat = byLocale(
	(locale) => new Intl.NumberFormat(locale, { style: 'percent' }),
);

/**
 * How far something is: `value` of `max`, with its label and its percentage in
 * words. Without a `value` (or with a `max` of 0 or less) it is indeterminate:
 * something is happening, how much is not known.
 *
 * @example
 * ```tsx
 * <Progress label='Documents uploaded' value={3} max={5} />
 * <Progress label='Sending' />
 * ```
 *
 * @returns progress bar
 */
export const Progress = ({
	className,
	label,
	max = 100,
	tone = 'brand',
	value,
	...props
}: ProgressProps) => {
	const labelId = useId();
	const { locale } = useLocale();
	const isKnown = value !== undefined && Number.isFinite(value) && max > 0;
	const clamped = isKnown ? Math.min(max, Math.max(0, value)) : 0;
	const percent = isKnown ? Math.round((clamped / max) * 100) : 0;

	return (
		<div className={cx(styles.root, styles[tone], className)} {...props}>
			<div className={styles.label}>
				<span id={labelId}>{label}</span>
				{isKnown && (
					<span className={styles.value}>
						{percentFormat(locale).format(percent / 100)}
					</span>
				)}
			</div>

			<div
				aria-labelledby={labelId}
				aria-valuemax={max}
				aria-valuemin={0}
				aria-valuenow={isKnown ? clamped : undefined}
				className={styles.track}
				data-indeterminate={isKnown ? undefined : true}
				role='progressbar'
			>
				<span
					className={styles.indicator}
					style={isKnown ? { inlineSize: `${percent}%` } : undefined}
				/>
			</div>
		</div>
	);
};

export interface ProgressProps extends Omit<ComponentProps<'div'>, 'children'> {
	/** What is progressing: the name of the bar. */
	label: string;
	max?: number;
	/** `danger` paints a progress that failed. */
	tone?: 'brand' | 'danger';
	/** How far, from 0 to `max`. Without it the bar is indeterminate. */
	value?: number;
}
