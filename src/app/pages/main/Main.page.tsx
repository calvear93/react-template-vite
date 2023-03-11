import { useEffect } from 'react';
import { useAtom } from 'jotai';
import { sampleAtom } from 'app/atoms/sample.atom';
import { routes } from 'app/app.routes';
import { generatePath, Link, Page } from '@router';
import styles from './main.page.module.scss';

// constants
const detailPath = routes.app.Detail[0];
const detailPathWithId = (id: number) =>
	generatePath(routes.app.Detail[1], { id });

/**
 * Main page.
 */
export const MainPage: React.FC = (): JSX.Element => {
	const [message, setStatus] = useAtom(sampleAtom);

	// effects
	useEffect(() => {
		setStatus(200);
	}, [setStatus]);

	// jsx
	return (
		<Page title='Main Page' className={styles.page}>
			<Link to={detailPath}>Go To Detail</Link>
			<Link to={detailPathWithId(123)}>Go To Detail 123</Link>

			<h1 className='text-brand font-bold underline'>
				hello world
				<div className='mdi-alarm text-orange-400' />
			</h1>

			<h2>{import.meta.env.VITE_APP_ENV}</h2>
			<h3 className='font-bold text-green-700'>{message}</h3>
		</Page>
	);
};

export default MainPage;
