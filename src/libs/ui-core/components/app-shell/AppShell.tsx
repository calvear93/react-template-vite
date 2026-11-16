import { type ReactNode, useId, useRef } from 'react';
import { type UiTexts } from '../../i18n/en.ts';
import { useTexts } from '../../i18n/texts.hook.ts';
import { type IconName } from '../../icon/icon.registry.ts';
import { Icon } from '../../icon/Icon.tsx';
import { Anchor } from '../../internal/anchor/Anchor.tsx';
import { cx } from '../../internal/cx.ts';
import { defined } from '../../internal/defined.ts';
import { Button } from '../button/Button.tsx';
import { Tooltip } from '../tooltip/Tooltip.tsx';
import { useAppShell } from './app-shell.hook.ts';
import styles from './AppShell.module.css';

/**
 * A link of the menu. Folded to its icon it shows its name on hover and on focus:
 * the name it already has (its label is still there, unseen), so the hint is not
 * read again.
 */
const ShellLink = ({
	isFolded,
	item,
	onFollow,
}: {
	isFolded: boolean;
	item: AppShellItem;
	onFollow: () => void;
}) => (
	<Tooltip
		className={styles.itemTip}
		content={item.label}
		describes={false}
		disabled={!isFolded}
		side='right'
	>
		<Anchor
			aria-current={item.current ? 'page' : undefined}
			className={styles.item}
			href={item.href}
			onClick={onFollow}
		>
			<Icon
				className={styles.itemIcon}
				name={item.icon ?? 'chevron-right'}
				size='sm'
			/>
			<span className={styles.itemLabel}>{item.label}</span>
		</Anchor>
	</Tooltip>
);

/**
 * The frame of an application: the header across the page (the `logo` of the app,
 * a link to its home; its name in a notch at its center; `utilities` at its end),
 * the side bar with the menu by sections, and the content, the only area that
 * scrolls. The side bar folds to its icons (remembered per browser; each link
 * then shows its name on hover and on focus); below 900 px it becomes a panel over
 * the page, opened from the header: while it is open the rest of the page is
 * inert, and it closes on navigation, with Escape, with its own button or with a
 * press outside. The first Tab stop is a link that skips to the content.
 *
 * The links go through the link component of UiProvider: a router link marks the
 * current page by itself; `current` does it for a plain anchor. Give `pageKey`
 * (the path) so a new page starts at its top with the focus on its content.
 *
 * @example
 * ```tsx
 * <AppShell
 *   title='My application'
 *   logo={<img alt='' src={logo} />}
 *   subtitle='Area · Acme'
 *   pageKey={pathname}
 *   menu={[{ title: 'Management', items: [{ href: '/orders', label: 'Orders', icon: 'list' }] }]}
 *   utilities={<UserMenu name={user.name}>…</UserMenu>}
 * >
 *   {children}
 * </AppShell>
 * ```
 *
 * @returns application shell
 */
export const AppShell = ({
	children,
	className,
	home = '/',
	labels,
	logo,
	menu,
	pageKey,
	subtitle,
	title,
	utilities,
}: AppShellProps) => {
	const mainId = useId();
	const sidebarId = useId();
	const texts = { ...useTexts().appShell, ...defined(labels) };
	const main = useRef<HTMLElement>(null);
	const sidebar = useRef<HTMLElement>(null);
	const navigation = useRef<HTMLElement>(null);
	const menuButton = useRef<HTMLButtonElement>(null);
	const { closeMenu, isFolded, isMenuOpen, toggleFold, toggleMenu } =
		useAppShell({ main, menuButton, navigation, pageKey, sidebar });
	// the logo is the way home: drawn in the header and at the top of the menu panel
	const homeLink = logo && (
		<Anchor aria-label={texts.home} className={styles.logo} href={home}>
			{logo}
		</Anchor>
	);

	return (
		<div
			className={cx(styles.root, className)}
			data-folded={isFolded}
			data-menu-open={isMenuOpen}
		>
			<a
				className={styles.skip}
				href={`#${mainId}`}
				inert={isMenuOpen}
				onClick={(event) => {
					// the focus goes to the content without touching the route
					event.preventDefault();
					main.current?.focus();
				}}
			>
				{texts.skip}
			</a>

			<header className={styles.header} inert={isMenuOpen}>
				<Button
					aria-controls={sidebarId}
					aria-expanded={isMenuOpen}
					className={styles.menuButton}
					icon='menu'
					iconOnly
					onClick={toggleMenu}
					ref={menuButton}
					size='sm'
					variant='ghost'
				>
					{texts.menu}
				</Button>
				{homeLink}

				<div className={styles.title}>
					<span className={styles.app}>{title}</span>
					{subtitle && (
						<span className={styles.area}>{subtitle}</span>
					)}
				</div>

				<div className={styles.utilities}>{utilities}</div>
			</header>

			<aside className={styles.sidebar} id={sidebarId} ref={sidebar}>
				<div className={styles.sidebarHead}>
					{homeLink ?? <span />}
					<Button
						icon='close'
						iconOnly
						onClick={() => closeMenu(true)}
						size='sm'
						variant='ghost'
					>
						{texts.closeMenu}
					</Button>
				</div>

				<nav
					aria-label={texts.navigation}
					className={styles.navigation}
					ref={navigation}
				>
					{menu.map((section) => (
						<div
							className={styles.section}
							key={section.title ?? section.items[0]?.href}
						>
							{section.title && (
								<h2 className={styles.sectionTitle}>
									{section.title}
								</h2>
							)}
							<ul className={styles.items}>
								{section.items.map((item) => (
									<li key={item.href}>
										<ShellLink
											isFolded={isFolded}
											item={item}
											onFollow={() => closeMenu()}
										/>
									</li>
								))}
							</ul>
						</div>
					))}
				</nav>

				<div className={styles.foot}>
					<button
						aria-expanded={!isFolded}
						aria-label={texts.sidebar}
						className={styles.fold}
						onClick={toggleFold}
						title={isFolded ? texts.unfold : texts.fold}
						type='button'
					>
						<Icon name='panel-left' />
					</button>
				</div>
			</aside>

			<div aria-hidden className={styles.veil} />

			<main
				className={styles.content}
				id={mainId}
				inert={isMenuOpen}
				ref={main}
				tabIndex={-1}
			>
				{children}
			</main>
		</div>
	);
};

/** A link of the menu of an AppShell. */
export interface AppShellItem {
	href: string;
	label: string;
	/** Marks the item as the current page, whatever the link component makes of the route. */
	current?: boolean;
	icon?: IconName;
}

/** A group of links of the menu of an AppShell, under its title when it has one. */
export interface AppShellSection {
	items: readonly AppShellItem[];
	title?: string;
}

export interface AppShellProps {
	/** The page. */
	children: ReactNode;
	/** The menu of the side bar, by sections. */
	menu: readonly AppShellSection[];
	/** The name of the application. */
	title: string;
	className?: string;
	/** Where the logo leads. */
	home?: string;
	labels?: Partial<UiTexts['appShell']>;
	/** The logo of the application (an image, an svg): a link to its home. */
	logo?: ReactNode;
	/** What tells a page from the next (the path): a new one starts at its top. */
	pageKey?: string;
	/** The area the application belongs to, under its name. */
	subtitle?: string;
	/** The end of the header: the environment, the user and their menu. */
	utilities?: ReactNode;
}
