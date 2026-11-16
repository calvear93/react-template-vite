import { type ComponentProps, type ReactNode } from 'react';
import { type UiTexts } from '../../i18n/en.ts';
import { useTexts } from '../../i18n/texts.hook.ts';
import { Icon } from '../../icon/Icon.tsx';
import { cx } from '../../internal/cx.ts';
import { defined } from '../../internal/defined.ts';
import { VisuallyHidden } from '../visually-hidden/VisuallyHidden.tsx';
import styles from './Stepper.module.css';

/**
 * The steps of a process. The progress is said in words («Step 2 of 4: …»), never
 * only with color or position; the step in progress is `aria-current`, and the
 * state of each step (`done`, `error`, `disabled`) is drawn and said.
 *
 * `compact` shows only the summary, for a narrow area.
 *
 * @example
 * ```tsx
 * <Stepper current={1} steps={[
 *   { title: 'Worker details', state: 'done' },
 *   { title: 'Description of the accident' },
 *   { title: 'Documents' },
 *   { title: 'Review and submit' },
 * ]} />
 * ```
 *
 * @returns stepper
 */
export const Stepper = ({
	className,
	compact = false,
	current,
	labels,
	orientation = 'horizontal',
	steps,
	summary,
	...props
}: StepperProps) => {
	const stateLabels = { ...useTexts().stepper, ...defined(labels) };
	const { position } = useTexts().stepperSummary;
	const title = steps[current]?.title;

	return (
		<div className={cx(styles.root, className)} {...props}>
			<p className={styles.summary}>
				{summary ? (
					summary(current + 1, steps.length, title)
				) : (
					<>
						{position(current + 1, steps.length)}: {title}
					</>
				)}
			</p>

			{!compact && (
				<ol className={cx(styles.list, styles[orientation])}>
					{steps.map((step, index) => (
						<li
							aria-current={
								index === current ? 'step' : undefined
							}
							className={styles.step}
							data-state={step.state}
							// the steps of a process do not reorder: the index is a stable key
							key={index}
						>
							<span aria-hidden className={styles.marker}>
								{step.state === 'done' && (
									<Icon name='check' size='sm' />
								)}
								{step.state === 'error' && (
									<Icon name='alert-triangle' size='sm' />
								)}
								{step.state !== 'done' &&
									step.state !== 'error' &&
									index + 1}
							</span>
							<span className={styles.text}>
								<span className={styles.title}>
									{step.title}
									{step.state && (
										<VisuallyHidden>
											{' '}
											({stateLabels[step.state]})
										</VisuallyHidden>
									)}
								</span>
								{step.description && (
									<span className={styles.description}>
										{step.description}
									</span>
								)}
							</span>
						</li>
					))}
				</ol>
			)}
		</div>
	);
};

export interface Step {
	title: ReactNode;
	description?: ReactNode;
	/** Pending when it has none. */
	state?: keyof UiTexts['stepper'];
}

export interface StepperProps extends Omit<
	ComponentProps<'div'>,
	'children' | 'summary'
> {
	/** The index of the step in progress, from 0. */
	current: number;
	steps: readonly Step[];
	/** Only the summary in words. */
	compact?: boolean;
	/** The words of each state, for assistive technology. */
	labels?: Partial<Record<keyof UiTexts['stepper'], string>>;
	orientation?: 'horizontal' | 'vertical';
	/** The progress in words. Default: «Step 2 of 4: title». */
	summary?: (current: number, total: number, title: ReactNode) => ReactNode;
}
