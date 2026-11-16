import { createElement, use } from 'react';
import { LinkContext, type LinkProps } from './link.context.ts';

const EXTERNAL = /^(?:[a-z][\d+\-.a-z]*:|\/\/)/iu;

/**
 * The link of every component of the kit that navigates. An internal `href` goes through the
 * link component of UiProvider (the app's router); one that leaves the app (another origin,
 * mailto:, tel:), opens elsewhere (`target`) or downloads stays a plain anchor.
 *
 * @returns anchor
 */
export const Anchor = ({ children, href, ...props }: LinkProps) => {
	const link = use(LinkContext);
	const isPlain =
		EXTERNAL.test(href) ||
		props.target !== undefined ||
		props.download !== undefined;

	return createElement(isPlain ? 'a' : link, { href, ...props }, children);
};
