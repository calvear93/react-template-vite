import { Header } from './Header';
import { Footer } from './Footer';
import styles from './app.layout.module.scss';

export interface AppLayoutProps extends React.PropsWithChildren {}

/**
 * App layout (wrapper for pages with header/footer).
 *
 * @returns app layout
 */
export const AppLayout: React.FC<AppLayoutProps> = ({
	children,
}): JSX.Element => (
	<main className={styles.layout}>
		<Header title='App' />

		{children}

		<Footer text='Footer' />
	</main>
);

export default AppLayout;
