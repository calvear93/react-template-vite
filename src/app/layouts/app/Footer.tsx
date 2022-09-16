interface FooterProps {
    text: string;
}

/**
 * Footer for App Layout.
 *
 * @returns {JSX.Element} footer component
 */
export const Footer: React.FC<FooterProps> = ({ text }): JSX.Element => {
    return <footer>{text}</footer>;
};
