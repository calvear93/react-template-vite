import { createContext } from 'react';

/** What a Field tells the control inside it. */
export interface FieldContextValue {
	/** The id of the control: the label points to it. */
	id: string;
	/** The field has an error. */
	invalid: boolean;
	/** The ids of the hint and the error of the field. */
	describedBy: string | undefined;
	required: boolean;
}

export const FieldContext = createContext<FieldContextValue | null>(null);
