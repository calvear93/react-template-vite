import { Footer } from './Footer';
import { Header } from './Header';
import styles from './app.layout.module.scss';

export interface AppLayoutProps {
	children?: React.ReactNode;
}

/**
 * App layout (wrapper for pages with header/footer).
 *
 * @returns {JSX.Element} app layout
 */
export const AppLayout: React.FC<AppLayoutProps> = ({
	children
}): JSX.Element => (
	<main className={styles.layout}>
		<Header title='App' />

		{children}

		<Footer text='Footer' />
	</main>
);

export default AppLayout;
