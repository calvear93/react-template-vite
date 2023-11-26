import { useEffect } from 'react';
import { useAtom } from 'jotai';
import { Link, Page } from '@router';
import styles from './main.page.module.scss';
import { sampleAtom } from '../../atoms/sample.atom.ts';
import viteLogoUrl from '../../assets/vite.png';
import Logo from '../../assets/logo.svg';

/**
 * Main page.
 */
export const MainPage: React.FC = (): React.ReactElement => {
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

			<img width='10%' src={Logo} alt='logo' />
			<img width='10%' src={viteLogoUrl} alt='vite logo' />
		</Page>
	);
};

export default MainPage;
