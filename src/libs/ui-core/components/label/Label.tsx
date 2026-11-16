import { type ComponentProps } from 'react';
import { useTexts } from '../../i18n/texts.hook.ts';
import { cx } from '../../internal/cx.ts';
import styles from './Label.module.css';

/**
 * The name of a control. Field draws it for you; use it alone only for a control
 * that is not inside a Field. `required` adds the mark (the control carries the
 * native `required`, which is what assistive technology reads).
 *
 * @example
 * ```tsx
 * <Label htmlFor='email' required>Email</Label>
 * <input id='email' required />
 * ```
 *
 * @returns label
 */
export const Label = ({
	children,
	className,
	optional = false,
	optionalLabel,
	required = false,
	...props
}: LabelProps) => {
	const texts = useTexts().label;

	return (
		<label className={cx(styles.root, className)} {...props}>
			{children}
			{required && (
				<span aria-hidden className={styles.mark}>
					*
				</span>
			)}
			{optional && !required && (
				<span className={styles.optional}>
					{' '}
					{optionalLabel ?? texts.optional}
				</span>
			)}
		</label>
	);
};

export interface LabelProps extends ComponentProps<'label'> {
	/** Says the control may be left empty. */
	optional?: boolean;
	optionalLabel?: string;
	/** Adds the mark of a required control. */
	required?: boolean;
}
