import { type ComponentProps } from 'react';
import { cx } from '../internal/cx.ts';
import { type IconName, ICONS } from './icon.registry.ts';
import styles from './Icon.module.css';

/**
 * An icon of the design system: a 24x24 line drawing in the color of its text.
 * It decorates by default (hidden from assistive technology); `label` makes it
 * informative, with that accessible name.
 *
 * @example
 * ```tsx
 * <Icon name='search' />
 * <Icon name='alert-triangle' size='sm' label='Needs attention' />
 * ```
 *
 * @returns icon
 */
export const Icon = ({
	className,
	label,
	name,
	size = 'md',
	...props
}: IconProps) => (
	<svg
		className={cx(styles.root, styles[size], className)}
		fill='none'
		stroke='currentColor'
		strokeLinecap='round'
		strokeLinejoin='round'
		viewBox='0 0 24 24'
		{...(label
			? { 'aria-label': label, role: 'img' }
			: { 'aria-hidden': true, focusable: false })}
		{...props}
	>
		{ICONS[name].map(([Shape, attributes], index) => (
			// the shapes of an icon never reorder: the index is a stable key
			<Shape key={index} {...attributes} fill='none' />
		))}
	</svg>
);

export interface IconProps extends Omit<ComponentProps<'svg'>, 'name'> {
	name: IconName;
	/** The accessible name of an icon that says something by itself. */
	label?: string;
	size?: 'lg' | 'md' | 'sm' | 'xs';
}
