import { type ReactNode, useId } from 'react';
import { cx } from '../../internal/cx.ts';
import { FieldContext } from '../../internal/field/field.context.ts';
import {
	type FieldControlProps,
	useFieldControl,
} from '../../internal/field/use-field-control.hook.ts';
import { Label } from '../label/Label.tsx';
import control from '../../internal/control/control.module.css';
import styles from './Field.module.css';

const ForeignControl = ({
	render,
}: {
	render: (props: FieldControlProps) => ReactNode;
}) => render(useFieldControl({}));

/**
 * A labelled control: its label, its hint and its error, tied to the control so
 * assistive technology reads them with it. The controls of the kit (Input, Select,
 * Textarea, DatePicker…) take their id, description, invalid state and `required`
 * from the Field around them; any other control takes them through the function
 * form of `children`.
 *
 * An error says what happened and how to fix it; requirements go in the `hint`,
 * before the attempt.
 *
 * @example
 * ```tsx
 * <Field label='Email' hint='We will only use it for this request' error={errors.email} required>
 *   <Input name='email' type='email' />
 * </Field>
 *
 * <Field label='Color'>
 *   {(props) => <input type='color' {...props} />}
 * </Field>
 * ```
 *
 * @returns field
 */
export const Field = ({
	id,
	children,
	className,
	error,
	hint,
	label,
	optional = false,
	required = false,
}: FieldProps) => {
	const generatedId = useId();
	const controlId = id ?? generatedId;
	const hintId = `${controlId}-hint`;
	const errorId = `${controlId}-error`;
	const describedBy =
		[hint && hintId, error && errorId].filter(Boolean).join(' ') ||
		undefined;

	return (
		<div className={cx(styles.root, className)}>
			<Label htmlFor={controlId} optional={optional} required={required}>
				{label}
			</Label>

			<FieldContext
				value={{
					id: controlId,
					invalid: Boolean(error),
					describedBy,
					required,
				}}
			>
				{typeof children === 'function' ? (
					<ForeignControl render={children} />
				) : (
					children
				)}
			</FieldContext>

			{hint && (
				<span className={control.hint} id={hintId}>
					{hint}
				</span>
			)}
			<span aria-live='polite' className={control.error} id={errorId}>
				{error}
			</span>
		</div>
	);
};

export interface FieldProps {
	/** The id of the control. Default: a generated one. */
	id?: string;
	/** The control, or a function that renders one with the props the field gives it. */
	children: ReactNode | ((control: FieldControlProps) => ReactNode);
	/** The name of the control. */
	label: ReactNode;
	className?: string;
	/** What is wrong and how to fix it. Marks the control as invalid. */
	error?: ReactNode;
	/** What the control expects, said before the attempt. */
	hint?: ReactNode;
	/** Says the control may be left empty. */
	optional?: boolean;
	required?: boolean;
}
