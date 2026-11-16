import { type ReactNode } from 'react';
import { useLocale } from '../../format/locale.hook.ts';
import { shortName } from '../../format/name.ts';
import { useTexts } from '../../i18n/texts.hook.ts';
import { Icon } from '../../icon/Icon.tsx';
import { cx } from '../../internal/cx.ts';
import { Avatar } from '../avatar/Avatar.tsx';
import { DropdownMenu } from '../dropdown-menu/DropdownMenu.tsx';
import styles from './UserMenu.module.css';

/**
 * The signed-in person at the end of the header: their first name and surname
 * (never the full name), what they are in the application, and their avatar, as
 * one button that opens their menu. The menu starts with who it is; its items are
 * its children (DropdownMenuItem). On a narrow screen only the avatar shows.
 *
 * @example
 * ```tsx
 * <UserMenu name={user.name} detail={user.email} roleLabel='Administrator' photo={user.photoUrl}>
 *   <DropdownMenuItem icon='settings' onSelect={openSettings}>Settings</DropdownMenuItem>
 *   <DropdownMenuSeparator />
 *   <DropdownMenuItem icon='logout' tone='danger' onSelect={signOut}>Sign out</DropdownMenuItem>
 * </UserMenu>
 * ```
 *
 * @returns user menu
 */
export const UserMenu = ({
	children,
	className,
	detail,
	label,
	name,
	photo,
	roleLabel,
}: UserMenuProps) => {
	const { locale } = useLocale();
	const texts = useTexts().userMenu;
	const short = shortName(name, {}, locale) || name;

	return (
		<DropdownMenu
			align='end'
			className={cx(styles.root, className)}
			header={
				<>
					<strong className={styles.fullName}>{name}</strong>
					{detail && <span className={styles.detail}>{detail}</span>}
				</>
			}
			label={label ?? texts.menuOf(short)}
			renderTrigger={(trigger) => (
				<button
					{...trigger}
					aria-label={label ?? texts.menuOf(short)}
					className={styles.trigger}
					title={name}
					type='button'
				>
					<span className={styles.texts}>
						<span className={styles.name}>{short}</span>
						{roleLabel && (
							<span className={styles.role}>{roleLabel}</span>
						)}
					</span>
					<Avatar name={short} size='sm' src={photo} />
					<Icon
						className={styles.chevron}
						name='chevron-down'
						size='sm'
					/>
				</button>
			)}
		>
			{children}
		</DropdownMenu>
	);
};

export interface UserMenuProps {
	/** The items of the menu (DropdownMenuItem, DropdownMenuSeparator…). */
	children: ReactNode;
	/** The person's name, in either order («Jane Mary Cooper», «Cooper, Jane Mary»). */
	name: string;
	className?: string;
	/** A second line in the menu: the email or the user name. */
	detail?: ReactNode;
	/** The name of the button and of its menu. Default: «Menu of Jane Cooper». */
	label?: string;
	/** The URL of the person's photo. */
	photo?: string;
	/** What the person is in the application («Administrator»), under their name. */
	roleLabel?: ReactNode;
}
