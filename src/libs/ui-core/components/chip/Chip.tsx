import { type ComponentProps } from 'react';
import { useTexts } from '../../i18n/texts.hook.ts';
import { Icon } from '../../icon/Icon.tsx';
import { cx } from '../../internal/cx.ts';
import styles from './Chip.module.css';

/**
 * A tag for a choice already made: a filter applied, a person added. With `onRemove`
 * it carries a button that says what it removes. `count` adds a number.
 *
 * @example
 * ```tsx
 * <Chip count={12}>Pending</Chip>
 * <Chip onRemove={() => remove(person)}>Jane Cooper</Chip>
 * ```
 *
 * @returns chip
 */
export const Chip = ({
	children,
	className,
	count,
	onRemove,
	removeLabel,
	size = 'md',
	...props
}: ChipProps) => {
	const texts = useTexts().chip;
	const removeName =
		removeLabel ??
		(typeof children === 'string'
			? texts.removeItem(children)
			: texts.remove);

	return (
		<span
			className={cx(
				styles.root,
				styles[size],
				onRemove && styles.removable,
				className,
			)}
			{...props}
		>
			<span className={styles.label}>{children}</span>
			{count !== undefined && (
				<span className={styles.count}>{count}</span>
			)}
			{onRemove && (
				<button
					aria-label={removeName}
					className={styles.remove}
					onClick={onRemove}
					type='button'
				>
					<Icon name='close' size='xs' />
				</button>
			)}
		</span>
	);
};

export interface ChipProps extends ComponentProps<'span'> {
	/** A number next to the label. */
	count?: number;
	/** The name of the remove button. Default: «Remove» and the chip's text. */
	removeLabel?: string;
	size?: 'md' | 'sm';
	/** Makes the chip removable. */
	onRemove?: () => void;
}
