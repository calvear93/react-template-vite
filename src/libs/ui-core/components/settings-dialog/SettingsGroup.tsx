import { type ReactNode, useId } from 'react';
import { cx } from '../../internal/cx.ts';
import { FieldContext } from '../../internal/field/field.context.ts';
import styles from './SettingsDialog.module.css';

/**
 * Options of a settings category that belong together: one surface, a row each,
 * under an optional title.
 *
 * @returns group of settings
 */
export const SettingsGroup = ({
	children,
	className,
	title,
}: SettingsGroupProps) => {
	const id = useId();

	return (
		<section
			aria-labelledby={title ? id : undefined}
			className={cx(styles.group, className)}
		>
			{title && (
				<h4 className={styles.groupTitle} id={id}>
					{title}
				</h4>
			)}
			<div className={styles.rows}>{children}</div>
		</section>
	);
};

/**
 * One option of a settings group: its name and what it does on one side, its
 * control on the other. The control takes the name and the hint of its row, as in
 * a Field (a Switch, a Select, an Input). A control that is a group and names
 * itself (SegmentedControl, RadioGroup) takes `group`: give it the same text as
 * its legend.
 *
 * @example
 * ```tsx
 * <SettingsRow label='Weekly email' hint='A summary every Monday'>
 *   <Switch checked={weekly} onChange={toggleWeekly} />
 * </SettingsRow>
 * ```
 *
 * @returns row of settings
 */
export const SettingsRow = ({
	children,
	className,
	group = false,
	hint,
	label,
}: SettingsRowProps) => {
	const id = useId();
	const hintId = hint ? `${id}-hint` : undefined;
	const Name = group ? 'span' : 'label';

	return (
		<div className={cx(styles.row, className)}>
			<div className={styles.rowText}>
				<Name
					className={styles.rowLabel}
					htmlFor={group ? undefined : id}
				>
					{label}
				</Name>
				{hint && (
					<span className={styles.rowHint} id={hintId}>
						{hint}
					</span>
				)}
			</div>
			<div className={styles.rowControl}>
				{group ? (
					children
				) : (
					<FieldContext
						value={{
							id,
							invalid: false,
							describedBy: hintId,
							required: false,
						}}
					>
						{children}
					</FieldContext>
				)}
			</div>
		</div>
	);
};

export interface SettingsGroupProps {
	/** The rows of the group. */
	children: ReactNode;
	className?: string;
	title?: string;
}

export interface SettingsRowProps {
	/** The control of the option. */
	children: ReactNode;
	/** The name of the option. */
	label: string;
	className?: string;
	/** The control is a group that names itself: the row does not label it. */
	group?: boolean;
	/** What the option does, under its name. */
	hint?: ReactNode;
}
