interface HeaderProps {
	title: string;
}

/**
 * Header for App Layout.
 *
 * @returns header component
 */
export const Header: React.FC<HeaderProps> = ({ title }): JSX.Element => {
	return <header>{title}</header>;
};
