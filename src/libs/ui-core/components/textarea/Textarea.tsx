import { type ComponentProps } from 'react';
import { cx } from '../../internal/cx.ts';
import { useFieldControl } from '../../internal/field/use-field-control.hook.ts';
import control from '../../internal/control/control.module.css';
import styles from './Textarea.module.css';

/**
 * Free text in several lines. A native textarea (controlled or not). `autoGrow`
 * makes it as tall as its text where the browser can, instead of a resize handle.
 *
 * @example
 * ```tsx
 * <Field label='Description of the accident' hint='What happened, where and when'>
 *   <Textarea name='description' autoGrow />
 * </Field>
 * ```
 *
 * @returns textarea
 */
export const Textarea = ({
	autoGrow = false,
	className,
	size = 'md',
	...props
}: TextareaProps) => (
	<textarea
		rows={3}
		{...useFieldControl(props)}
		className={cx(
			control.control,
			styles.root,
			styles[size],
			autoGrow && styles.autoGrow,
			className,
		)}
	/>
);

export interface TextareaProps extends ComponentProps<'textarea'> {
	/** Grows with its text (browsers with `field-sizing`); elsewhere it stays resizable. */
	autoGrow?: boolean;
	size?: 'lg' | 'md' | 'sm';
}
