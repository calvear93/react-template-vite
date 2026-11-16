import { type ComponentProps, type ReactNode, useId } from 'react';
import { cx } from '../../internal/cx.ts';
import styles from './Checkbox.module.css';

/**
 * A yes/no, or one of several of a few. The whole row toggles it. A native
 * checkbox (controlled or not); its text is its name and the `description`
 * describes it. `className` goes to the row; the other props and the `ref`, to
 * the `<input>`.
 *
 * @example
 * ```tsx
 * <Checkbox name='terms' required description='You can withdraw it at any time'>
 *   I authorize the use of my data for this request
 * </Checkbox>
 * ```
 *
 * @returns checkbox
 */
export const Checkbox = ({
	children,
	className,
	description,
	size = 'md',
	...props
}: CheckboxProps) => {
	const id = useId();
	const descriptionId = description ? `${id}-description` : undefined;

	return (
		<label className={cx(styles.root, styles[size], className)}>
			<input
				aria-describedby={descriptionId}
				aria-labelledby={`${id}-label`}
				type='checkbox'
				{...props}
				className={styles.input}
			/>
			<span className={styles.text}>
				<span className={styles.label} id={`${id}-label`}>
					{children}
				</span>
				{description && (
					<span className={styles.description} id={descriptionId}>
						{description}
					</span>
				)}
			</span>
		</label>
	);
};

export interface CheckboxProps extends Omit<
	ComponentProps<'input'>,
	'size' | 'type'
> {
	/** The name of the checkbox. */
	children: ReactNode;
	/** A second line that explains the choice. */
	description?: ReactNode;
	size?: 'md' | 'sm';
}
