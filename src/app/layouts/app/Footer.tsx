import { useRoutePayload } from '@router';

interface FooterPayload {
    footer?: { text: string };
}

/**
 * Footer for App Layout.
 *
 * @returns {JSX.Element} footer component
 */
export const Footer: React.FC = (): JSX.Element => {
    const { footer: { text } = {} } = useRoutePayload<FooterPayload>();

    return <footer>{text}</footer>;
};
