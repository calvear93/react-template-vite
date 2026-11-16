import { type ComponentProps, createContext, type ElementType } from 'react';

/** What the kit gives to a link: the props of an anchor, always with its `href`. */
export interface LinkProps extends ComponentProps<'a'> {
	href: string;
}

/**
 * The component the kit renders for an internal link. The default is a plain anchor;
 * an app with a client router gives its own through UiProvider (`link`).
 */
export type LinkComponent = ElementType<LinkProps>;

export const LinkContext = createContext<LinkComponent>('a');
