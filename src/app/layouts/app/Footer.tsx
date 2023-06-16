interface FooterProps {
	text: string;
}

/**
 * Footer for App Layout.
 *
 * @returns footer component
 */
export const Footer: React.FC<FooterProps> = ({ text }): React.ReactElement => {
	return <footer>{text}</footer>;
};
