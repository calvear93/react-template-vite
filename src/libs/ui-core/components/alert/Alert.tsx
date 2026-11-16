import { type ComponentProps, type ReactNode } from 'react';
import { useTexts } from '../../i18n/texts.hook.ts';
import { type IconName } from '../../icon/icon.registry.ts';
import { Icon } from '../../icon/Icon.tsx';
import { cx } from '../../internal/cx.ts';
import { type Tone, TONE_ICONS } from '../../internal/tone.ts';
import styles from './Alert.module.css';

/**
 * What the person must read before going on. Never by color alone: its icon and
 * its title say the tone too. A `danger` alert is announced at once (role alert);
 * the others, when assistive technology is idle (role status). For a confirmation
 * that goes by itself use a toast; for a note that asks for nothing, InfoNote.
 *
 * `onClose` adds the close button: the parent takes the alert away.
 *
 * @example
 * ```tsx
 * <Alert tone='warning' title='2 documents are missing'
 *   actions={<Button size='sm' variant='outlined'>Upload documents</Button>}>
 *   You can send them until November 30.
 * </Alert>
 * ```
 *
 * @returns alert
 */
export const Alert = ({
	actions,
	children,
	className,
	closeLabel,
	icon,
	onClose,
	title,
	tone = 'info',
	...props
}: AlertProps) => {
	const texts = useTexts().alert;

	return (
		<div
			className={cx(styles.root, styles[tone], className)}
			role={tone === 'danger' ? 'alert' : 'status'}
			{...props}
		>
			<span aria-hidden className={styles.icon}>
				<Icon name={icon ?? TONE_ICONS[tone]} size='sm' />
			</span>

			<div className={styles.body}>
				{title && <p className={styles.title}>{title}</p>}
				{children && <div className={styles.text}>{children}</div>}
				{actions && <div className={styles.actions}>{actions}</div>}
			</div>

			{onClose && (
				<button
					aria-label={closeLabel ?? texts.close}
					className={styles.close}
					onClick={onClose}
					type='button'
				>
					<Icon name='close' size='sm' />
				</button>
			)}
		</div>
	);
};

export type AlertTone = Tone;

export interface AlertProps extends Omit<ComponentProps<'div'>, 'title'> {
	/** Buttons under the text. */
	actions?: ReactNode;
	closeLabel?: string;
	/** Another icon than the one of the tone. */
	icon?: IconName;
	title?: ReactNode;
	tone?: AlertTone;
	/** Shows the close button. */
	onClose?: () => void;
}

/** The parts of an error an ErrorAlert shows. */
export interface ErrorLike {
	/** A code to give when asking for help (the correlation id of the request). */
	correlationId?: string;
	message?: string;
	title?: string;
}

const partOf = (error: unknown, key: keyof ErrorLike) => {
	const value =
		typeof error === 'object' && error !== null
			? (error as Record<string, unknown>)[key]
			: undefined;

	return typeof value === 'string' && value ? value : undefined;
};

/**
 * The alert of an action that failed: what happened, the message of the error and,
 * when it has one, the support code to give when asking for help.
 *
 * @example
 * ```tsx
 * {status === 'error' && <ErrorAlert error={error} />}
 * ```
 *
 * @returns alert
 */
export const ErrorAlert = ({
	error,
	supportLabel,
	title,
	...props
}: ErrorAlertProps) => {
	const texts = useTexts().alert;
	const message = partOf(error, 'message');
	const code = partOf(error, 'correlationId');

	return (
		<Alert
			title={partOf(error, 'title') ?? title ?? texts.errorTitle}
			tone='danger'
			{...props}
		>
			{message && <p className={styles.line}>{message}</p>}
			{code && (
				<p className={styles.support}>
					{supportLabel ?? texts.support}: <code>{code}</code>
				</p>
			)}
		</Alert>
	);
};

export interface ErrorAlertProps extends Omit<
	AlertProps,
	'children' | 'title' | 'tone'
> {
	/** An Error, or an object with `title`, `message` and `correlationId`. */
	error: unknown;
	supportLabel?: string;
	/** The title when the error has none. */
	title?: string;
}
