import { Link, useLoaderData, useParams } from '#libs/router';
import { useInjection } from '../../app.ioc.ts';
import Logo from '../../assets/logo.svg';
import { FetchBox } from './components/FetchBox.tsx';
import styles from './Detail.page.module.css';

export const DetailPage: React.FC = (): React.ReactElement => {
	const { id } = useParams();
	const aMessage = useLoaderData<string>();
	const { example } = useInjection<{ example: string }>('injectionToken');

	// jsx
	return (
		<section className={styles.page}>
			<title>Detail Page</title>

			<Link to='/'>Go To Main</Link>

			<h2>{import.meta.env.APP_ENV}</h2>
			{id && <h2>ID: {id}</h2>}
			<h4>message: {aMessage}</h4>

			<span data-testid='injected-data'>
				Injected example data: <b>{example}</b>
			</span>

			<FetchBox logoSrc={Logo} />
		</section>
	);
};

export default DetailPage;
