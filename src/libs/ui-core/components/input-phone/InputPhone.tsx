import { type ComponentProps, type CSSProperties, useId } from 'react';
import { cx } from '../../internal/cx.ts';
import { useFieldControl } from '../../internal/field/use-field-control.hook.ts';
import control from '../../internal/control/control.module.css';
import styles from './InputPhone.module.css';

/**
 * A phone number. With a `prefix` (the code of a country, of a mobile) it is shown
 * and never typed, so the person types only their number. A native input
 * (controlled or not): its value is the number without the prefix; `maxLength`
 * limits how many digits it takes. `className` goes to the wrapper; the other
 * props and the `ref`, to the `<input>`.
 *
 * @example
 * ```tsx
 * <Field label='Mobile' hint='10 digits, without the +1'>
 *   <InputPhone name='mobile' prefix='+1' maxLength={10} />
 * </Field>
 * ```
 *
 * @returns phone input
 */
export const InputPhone = ({
	className,
	prefix,
	size = 'md',
	...props
}: InputPhoneProps) => {
	const prefixId = useId();
	const field = useFieldControl({
		...props,
		// the prefix is read with the field: it is part of the number
		'aria-describedby':
			[prefix && prefixId, props['aria-describedby']]
				.filter(Boolean)
				.join(' ') || undefined,
	});

	return (
		<span
			className={cx(styles.root, className)}
			style={
				{ '--ui-phone-prefix': prefix?.length ?? 0 } as CSSProperties
			}
		>
			{prefix && (
				<span className={styles.prefix} id={prefixId}>
					{prefix}
				</span>
			)}
			<input
				autoComplete={prefix ? 'tel-national' : 'tel'}
				inputMode='tel'
				type='tel'
				{...field}
				className={cx(
					control.control,
					control[size],
					styles.input,
					prefix && styles.prefixed,
				)}
			/>
		</span>
	);
};

export interface InputPhoneProps extends Omit<
	ComponentProps<'input'>,
	'prefix' | 'size' | 'type'
> {
	/** What every number starts with (`+1`, `+569`): shown in the field, and not typed. */
	prefix?: string;
	size?: 'lg' | 'md' | 'sm';
}
