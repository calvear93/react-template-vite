import { type ReactNode, useId } from 'react';
import { cx } from '../../internal/cx.ts';
import control from '../../internal/control/control.module.css';
import styles from './RadioGroup.module.css';

/**
 * One of a few, all visible: native radios in a fieldset named by its `legend`.
 * `variant='cards'` draws each option as a card, for choices that need a
 * description (the roles of a user). Controlled with `value`, or uncontrolled
 * with `defaultValue`; `name` sends the chosen value with its form.
 *
 * @example
 * ```tsx
 * <RadioGroup
 *   legend='Type of care'
 *   name='kind'
 *   options={[
 *     { value: 'urgent', label: 'Urgent', description: 'Immediate care' },
 *     { value: 'scheduled', label: 'Scheduled' },
 *   ]}
 *   onValueChange={setKind}
 * />
 * ```
 *
 * @returns group of radios
 */
export const RadioGroup = <Value extends string>({
	className,
	defaultValue,
	disabled = false,
	error,
	hint,
	legend,
	name,
	onValueChange,
	options,
	orientation = 'vertical',
	required = false,
	value,
	variant = 'plain',
}: RadioGroupProps<Value>) => {
	const id = useId();
	const hintId = hint ? `${id}-hint` : undefined;
	const errorId = error ? `${id}-error` : undefined;

	return (
		<fieldset
			aria-describedby={
				[hintId, errorId].filter(Boolean).join(' ') || undefined
			}
			className={cx(
				styles.root,
				styles[orientation],
				styles[variant],
				className,
			)}
			data-invalid={error ? true : undefined}
			disabled={disabled}
		>
			<legend className={styles.legend}>
				{legend}
				{required && (
					<span aria-hidden className={styles.mark}>
						*
					</span>
				)}
			</legend>

			<div className={styles.options}>
				{options.map((option, index) => {
					const optionId = `${id}-${index}`;
					const descriptionId = option.description
						? `${optionId}-description`
						: undefined;

					return (
						<label className={styles.option} key={option.value}>
							<input
								aria-describedby={descriptionId}
								aria-labelledby={`${optionId}-label`}
								className={styles.input}
								disabled={option.disabled}
								name={name ?? id}
								required={required}
								type='radio'
								value={option.value}
								{...(value === undefined
									? {
											defaultChecked:
												option.value === defaultValue,
										}
									: { checked: option.value === value })}
								onChange={() => onValueChange?.(option.value)}
							/>
							<span className={styles.text}>
								<span
									className={styles.label}
									id={`${optionId}-label`}
								>
									{option.label}
								</span>
								{option.description && (
									<span
										className={styles.description}
										id={descriptionId}
									>
										{option.description}
									</span>
								)}
							</span>
						</label>
					);
				})}
			</div>

			{hint && (
				<span className={control.hint} id={hintId}>
					{hint}
				</span>
			)}
			<span aria-live='polite' className={control.error} id={errorId}>
				{error}
			</span>
		</fieldset>
	);
};

export interface RadioOption<Value extends string = string> {
	label: ReactNode;
	value: Value;
	description?: ReactNode;
	disabled?: boolean;
}

export interface RadioGroupProps<Value extends string = string> {
	/** What is being chosen: the name of the group. */
	legend: ReactNode;
	options: readonly RadioOption<Value>[];
	className?: string;
	/** The option chosen at first, uncontrolled. */
	defaultValue?: Value;
	disabled?: boolean;
	/** What is wrong and how to fix it. */
	error?: ReactNode;
	hint?: ReactNode;
	/** The name the chosen value is sent with. */
	name?: string;
	orientation?: 'horizontal' | 'vertical';
	required?: boolean;
	/** The option chosen, controlled. */
	value?: Value;
	/** `cards`: each option a card, the chosen one in the brand's pair. */
	variant?: 'cards' | 'plain';
	onValueChange?: (value: Value) => void;
}
