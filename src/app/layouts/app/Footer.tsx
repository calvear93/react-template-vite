/**
 * Footer for App Layout.
 *
 * @returns footer component
 */
export const Footer = ({ text }: FooterProps) => {
	return <footer>{text}</footer>;
};

interface FooterProps {
	text: string;
}
