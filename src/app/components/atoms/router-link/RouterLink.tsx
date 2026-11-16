import { Link, useLocation, useResolvedPath } from '#libs/router';
import { type LinkProps } from '#libs/ui-core';

/**
 * Whether a route is the one shown, or one that holds it: the rule of the
 * router's own `NavLink` (`/orders` is current on `/orders/12`; `/` only on `/`).
 *
 * @param pathname - the path shown
 * @param to - the path of the link
 *
 * @returns whether the link leads to where the person is
 */
const isCurrent = (pathname: string, to: string) => {
	const shown = pathname.toLowerCase();
	const target = to.toLowerCase();

	return (
		shown === target ||
		(target !== '/' &&
			shown.startsWith(target.endsWith('/') ? target : `${target}/`))
	);
};

/**
 * The link the UI kit renders for an internal `href`: the router's, so following
 * it does not reload the app. It marks itself as the current page when its route
 * is the active one; a link that is told whether it is (`aria-current`) is not
 * asked to work it out.
 *
 * It is the same element either way: a link that becomes the current page is not
 * replaced, so it keeps the focus it had when it was followed.
 *
 * @example
 * ```tsx
 * <UiProvider link={RouterLink}>…</UiProvider>
 * ```
 *
 * @returns router link
 */
export const RouterLink = ({
	'aria-current': current,
	href,
	...props
}: LinkProps) => {
	const { pathname } = useLocation();
	const to = useResolvedPath(href).pathname;
	const marked = isCurrent(pathname, to) ? 'page' : undefined;

	return <Link aria-current={current ?? marked} to={href} {...props} />;
};
