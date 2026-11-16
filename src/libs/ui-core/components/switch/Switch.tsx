import {
	type ChangeEvent,
	type ComponentProps,
	type ReactNode,
	useId,
	useState,
} from 'react';
import { cx } from '../../internal/cx.ts';
import { useFieldControl } from '../../internal/field/use-field-control.hook.ts';
import styles from './Switch.module.css';

/**
 * An on/off whose effect is immediate (in a form that is sent later, use a
 * Checkbox). A native checkbox with the switch role, controlled or not.
 * `stateLabels` shows the state in words next to it. Without children it is the
 * control of a Field or of a SettingsRow, which name and describe it.
 *
 * @example
 * ```tsx
 * <Switch checked={enabled} onChange={(event) => setEnabled(event.target.checked)}
 *   stateLabels={['On', 'Off']}>
 *   Email notifications
 * </Switch>
 * ```
 *
 * @returns switch
 */
export const Switch = ({
	checked,
	children,
	className,
	defaultChecked = false,
	description,
	onChange,
	size = 'md',
	stateLabels,
	...props
}: SwitchProps) => {
	const id = useId();
	const [isOnInternal, setIsOnInternal] = useState(defaultChecked);
	const isOn = checked ?? isOnInternal;
	const descriptionId = description ? `${id}-description` : undefined;
	// without a name of its own it is the control of a Field, or of a row of settings
	const field = useFieldControl({
		...props,
		'aria-describedby':
			[props['aria-describedby'], descriptionId]
				.filter(Boolean)
				.join(' ') || undefined,
	});
	const hasText = children !== undefined || description !== undefined;

	const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
		setIsOnInternal(event.target.checked);
		onChange?.(event);
	};

	return (
		<label className={cx(styles.root, styles[size], className)}>
			<input
				aria-labelledby={
					children === undefined ? undefined : `${id}-label`
				}
				role='switch'
				type='checkbox'
				{...field}
				{...(checked === undefined ? { defaultChecked } : { checked })}
				className={styles.input}
				onChange={handleChange}
			/>
			{hasText && (
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
			)}
			{stateLabels && (
				<span aria-hidden className={styles.state}>
					{stateLabels[isOn ? 0 : 1]}
				</span>
			)}
		</label>
	);
};

export interface SwitchProps extends Omit<
	ComponentProps<'input'>,
	'role' | 'size' | 'type'
> {
	/** The name of the switch; without one it takes the label of its Field, or of its settings row. */
	children?: ReactNode;
	/** A second line that explains what it turns on. */
	description?: ReactNode;
	size?: 'md' | 'sm';
	/** The state in words, shown next to the switch: [on, off]. */
	stateLabels?: readonly [on: string, off: string];
}
