import { useDocumentTitle } from '../router.hook';

export interface PageProps extends React.HTMLAttributes<HTMLElement> {
	title: string;
}

/**
 * Page wrapper.
 *
 * @param props - component props
 *
 * @returns page
 */
export const Page: React.FC<PageProps> = ({
	title,
	children,
	...attrs
}): React.ReactElement => {
	// sets up page tab title
	useDocumentTitle(title);

	return <section {...attrs}>{children}</section>;
};
