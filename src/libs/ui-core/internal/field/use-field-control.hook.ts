import { type AriaAttributes, use } from 'react';
import { FieldContext } from './field.context.ts';

/** The props of a control a Field completes. */
export interface FieldControlProps {
	'aria-invalid'?: AriaAttributes['aria-invalid'];
	id?: string;
	'aria-describedby'?: string;
	required?: boolean;
}

/**
 * Completes the props of a control with what its Field knows: the id its label points to,
 * the hint and the error that describe it, whether it is invalid or required. What the
 * control was given wins; outside a Field the props come back as they are.
 *
 * @param props - the props of the control
 *
 * @returns the props to spread on the control
 */
export const useFieldControl = <P extends FieldControlProps>(props: P): P => {
	const field = use(FieldContext);

	if (!field) return props;

	const describedBy = [props['aria-describedby'], field.describedBy]
		.filter(Boolean)
		.join(' ');

	return {
		...props,
		'aria-invalid': props['aria-invalid'] ?? (field.invalid || undefined),
		id: props.id ?? field.id,
		'aria-describedby': describedBy || undefined,
		required: props.required ?? (field.required || undefined),
	};
};
