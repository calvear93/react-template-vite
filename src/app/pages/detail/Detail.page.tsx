import { Link, Page, useLoaderData, useParams } from '@router';
import styles from './detail.page.module.scss';
import { FetchBox } from './components/FetchBox';

/**
 * Detail page.
 */
export const DetailPage: React.FC = (): React.ReactElement => {
	const { id } = useParams();
	const aMessage = useLoaderData() as string;

	return (
		<Page title='Detail Page' className={styles.page}>
			<Link to='/'>Go To Main</Link>

			<h2>{import.meta.env.VITE_APP_ENV}</h2>
			{id && <h2>ID: {id}</h2>}
			<h4>message: {aMessage}</h4>

			<FetchBox />
		</Page>
	);
};

export default DetailPage;
