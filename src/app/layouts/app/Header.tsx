interface HeaderProps {
    title: string;
}

/**
 * Header for App Layout.
 *
 * @returns {JSX.Element} header component
 */
export const Header: React.FC<HeaderProps> = ({ title }): JSX.Element => {
    // const { header: { title } = {} } = useRoutePayload<HeaderPayload>();

    return <header>{title}</header>;
};
