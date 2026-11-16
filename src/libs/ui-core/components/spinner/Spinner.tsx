import { type ComponentProps } from 'react';
import { useTexts } from '../../i18n/texts.hook.ts';
import { cx } from '../../internal/cx.ts';
import { VisuallyHidden } from '../visually-hidden/VisuallyHidden.tsx';
import styles from './Spinner.module.css';

/**
 * Something is loading. It always says so in words: the `label` is announced to
 * assistive technology, and shown next to the spinner with `showLabel`. `block`
 * centers it in the area that is loading.
 *
 * @example
 * ```tsx
 * <Spinner />
 * <Spinner block label='Loading orders' showLabel />
 * ```
 *
 * @returns spinner
 */
export const Spinner = ({
	block = false,
	className,
	label: given,
	showLabel = false,
	...props
}: SpinnerProps) => {
	const texts = useTexts().spinner;
	const label = given ?? texts.label;

	return (
		<span
			className={cx(styles.root, block && styles.block, className)}
			role='status'
			{...props}
		>
			{showLabel ? (
				<span className={styles.label}>{label}</span>
			) : (
				<VisuallyHidden>{label}</VisuallyHidden>
			)}
		</span>
	);
};

export interface SpinnerProps extends Omit<ComponentProps<'span'>, 'children'> {
	/** Centers the spinner in the area that is loading, with air around it. */
	block?: boolean;
	/** What is loading, in words. */
	label?: string;
	/** Shows the label next to the spinner. */
	showLabel?: boolean;
}
