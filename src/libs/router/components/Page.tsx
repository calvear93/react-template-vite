import { useEffect } from 'react';

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
    useEffect(() => {
        document.title = title ?? '';
    }, [title]);

    return <section {...attrs}>{children}</section>;
};
