import { useEffect } from 'react';
import { useAtom } from 'jotai';
import { sampleAtom } from 'app/atoms/sample.atom';
import { Link, Page } from '@router';
import styles from './main.page.module.scss';
import viteLogoUrl from '../../assets/vite.png';
import { ReactComponent as Logo } from '../../assets/logo.svg';

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
			<Link to='/detail'>Go To Detail</Link>
			<Link to='/detail/123'>Go To Detail 123</Link>

			<h1 className='text-brand font-bold underline'>
				hello world
				<div className='mdi-alarm text-orange-400' />
			</h1>

			<h2>{import.meta.env.VITE_APP_ENV}</h2>
			<h3 className='font-bold text-green-700'>{message}</h3>

			<Logo width='10%' />
			<img width='10%' src={viteLogoUrl} alt='vite logo' />
		</Page>
	);
};

export default MainPage;
