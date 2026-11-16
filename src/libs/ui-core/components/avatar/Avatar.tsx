import { type ComponentProps } from 'react';
import { initials } from '../../format/name.ts';
import { cx } from '../../internal/cx.ts';
import styles from './Avatar.module.css';

/**
 * A person: the initials of the name always underneath, the photo over them when
 * there is one (so a photo that fails to load never leaves a hole). Decorative: it
 * goes next to the person's name, which is what assistive technology reads.
 *
 * @example
 * ```tsx
 * <Avatar name='Jane Cooper' />
 * <Avatar name={user.name} src={user.photoUrl} size='lg' />
 * ```
 *
 * @returns avatar
 */
export const Avatar = ({
	className,
	name,
	size = 'md',
	src,
	...props
}: AvatarProps) => (
	<span
		aria-hidden
		className={cx(styles.root, styles[size], className)}
		{...props}
	>
		<span className={styles.initials}>{initials(name)}</span>
		{src && <img alt='' className={styles.photo} src={src} />}
	</span>
);

export interface AvatarProps extends Omit<ComponentProps<'span'>, 'children'> {
	/** The person's name: its initials are drawn. */
	name: string | null | undefined;
	size?: 'lg' | 'md' | 'sm';
	/** The URL of the person's photo. */
	src?: string;
}
