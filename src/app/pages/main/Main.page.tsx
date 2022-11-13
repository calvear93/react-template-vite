import { useEffect } from 'react';
import { generatePath, Link, Page } from '@router';
import { routes } from 'app/app.routes';
import { useStoreActions, useStoreState } from 'app/App.store';
import styles from './main.page.module.scss';

// constants
const detailPath = routes.app.Detail[0];
const detailPathWithId = (id: number) =>
	generatePath(routes.app.Detail[1], { id });

/**
 * Main page.
 *
 * @returns {JSX.Element} main page
 */
export const MainPage: React.FC = (): JSX.Element => {
	const message = useStoreState(({ sample: { state } }) => state.message);
	const update = useStoreActions(({ sample: { update } }) => update);

	useEffect(() => {
		update(200);
	}, [update]);

	return (
		<Page title='Main Page' className={styles.page}>
			<Link to={detailPath}>Go To Detail</Link>
			<Link to={detailPathWithId(123)}>Go To Detail 123</Link>

			<h2>{import.meta.env.VITE_APP_ENV}</h2>
			<h3 className='font-bold text-green-700'>{message}</h3>
		</Page>
	);
};

// for lazy loading
export default MainPage;
