import { Header } from './Header.tsx';
import { Footer } from './Footer.tsx';
import styles from './App.layout.module.scss';

/**
 * App layout (wrapper for pages with header/footer).
 *
 * @returns app layout
 */
export const AppLayout: React.FC<AppLayoutProps> = ({
	children,
}): React.ReactElement => (
	<main className={styles.layout}>
		<Header title='App' />

		{children}

		<Footer text='Footer' />
	</main>
);

export interface AppLayoutProps extends React.PropsWithChildren {}
