import { Link, Page, useLoaderData, useParams } from '#libs/router';
import { FetchBox } from './components/FetchBox.tsx';
import styles from './detail.page.module.scss';

/**
 * Detail page.
 */
export const DetailPage: React.FC = (): React.ReactElement => {
	const { id } = useParams();
	const aMessage = useLoaderData<string>();

	// jsx
	return (
		<Page className={styles.page} title='Detail Page'>
			<Link to='/'>Go To Main</Link>

			<h2>{import.meta.env.APP_ENV}</h2>
			{id && <h2>ID: {id}</h2>}
			<h4>message: {aMessage}</h4>

			<FetchBox />
		</Page>
	);
};

export default DetailPage;
