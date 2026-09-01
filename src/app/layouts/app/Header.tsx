/**
 * Header for App Layout.
 *
 * @returns header component
 */
export const Header = ({ title }: HeaderProps) => {
	return <header>{title}</header>;
};

interface HeaderProps {
	title: string;
}
