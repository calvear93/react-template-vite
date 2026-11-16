import { useEffect, useRef } from 'react';

/**
 * The hidden input a composite control (DatePicker, Combobox, MultiSelect) sends
 * its normalized value with; several values go in one input each, under the same
 * name (`FormData.getAll`). It tells its form when the value changes, with a
 * native `change` event that bubbles: what a form that applies by itself
 * (FilterBar) listens to, since the visible part of the control has no name.
 *
 * With several values the event comes from an input without a name, which sends
 * nothing and is always there: the form is told when the last value goes too.
 *
 * It is the part of the control its form sees, so it takes what the control was
 * told about that: `disabled` (a disabled control sends nothing) and `form` (the
 * form it belongs to, when it is not the one around it).
 *
 * @returns hidden input
 */
export const HiddenInput = ({
	disabled,
	form,
	name,
	value,
}: HiddenInputProps) => {
	const input = useRef<HTMLInputElement>(null);
	const sent = typeof value === 'string' ? value : value.join('\n');
	const previous = useRef(sent);

	useEffect(() => {
		if (previous.current === sent) return;

		previous.current = sent;
		input.current?.dispatchEvent(new Event('change', { bubbles: true }));
	}, [sent]);

	if (typeof value === 'string')
		return (
			<input
				disabled={disabled}
				form={form}
				name={name}
				ref={input}
				type='hidden'
				value={value}
			/>
		);

	return (
		<>
			{value.map((item) => (
				<input
					disabled={disabled}
					form={form}
					key={item}
					name={name}
					type='hidden'
					value={item}
				/>
			))}
			<input ref={input} type='hidden' />
		</>
	);
};

export interface HiddenInputProps {
	/** The name the value is sent with. */
	name: string;
	/** The value, or the values: one input each. */
	value: string | readonly string[];
	/** The control is disabled: it sends nothing. */
	disabled?: boolean;
	/** The id of the form the control belongs to, when it is not the one around it. */
	form?: string;
}
