import { type ComponentProps } from 'react';
import { cx } from '../../internal/cx.ts';
import { useFieldControl } from '../../internal/field/use-field-control.hook.ts';
import control from '../../internal/control/control.module.css';

/**
 * Free text in one line. A native input: `value`, `defaultValue`, `onChange`,
 * `name` and `ref` work as usual, so it also runs uncontrolled inside a form.
 * Inside a Field it takes its label, description and invalid state from it.
 *
 * @example
 * ```tsx
 * <Field label='Name'>
 *   <Input name='name' autoComplete='given-name' />
 * </Field>
 * ```
 *
 * @returns input
 */
export const Input = ({ className, size = 'md', ...props }: InputProps) => (
	<input
		type='text'
		{...useFieldControl(props)}
		className={cx(control.control, control[size], className)}
	/>
);

export interface InputProps extends Omit<ComponentProps<'input'>, 'size'> {
	size?: 'lg' | 'md' | 'sm';
}
