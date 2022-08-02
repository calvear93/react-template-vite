import { useRoutePayload } from '@router';

interface HeaderPayload {
    header?: { title: string };
}

/**
 * Header for App Layout.
 *
 * @returns {JSX.Element} header component
 */
export const Header: React.FC = (): JSX.Element => {
    const { header: { title } = {} } = useRoutePayload<HeaderPayload>();

    return <header>{title}</header>;
};
