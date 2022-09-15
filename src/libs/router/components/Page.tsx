import { useDocumentTitle } from '../router.hook';

export interface PageProps extends React.HTMLAttributes<HTMLElement> {
    title: string;
}

/**
 * Page wrapper.
 *
 * @param {PageProps} props
 *
 * @returns {JSX.Element} page
 */
export const Page: React.FC<PageProps> = ({
    title,
    children,
    ...attrs
}): JSX.Element => {
    // sets up page tab title
    useDocumentTitle(title);

    return <section {...attrs}>{children}</section>;
};
