import { Link } from '#libs/router';
import { useAtom } from 'jotai';
import { useEffect } from 'react';
import Logo from '../../assets/logo.svg';
import viteLogoUrl from '../../assets/vite.png';
import { sampleAtom } from '../../atoms/sample.atom.ts';
import styles from './Main.page.module.css';

export const MainPage: React.FC = (): React.ReactElement => {
	const [message, setStatus] = useAtom(sampleAtom);

	// effects
	useEffect(() => {
		setStatus(200);
	}, [setStatus]);

	// jsx
	return (
		<section className={styles.page}>
			<title>Main Page</title>

			<Link to='/detail'>Go To Detail</Link>
			<Link to='/detail/123'>Go To Detail 123</Link>

			<h1 className='text-primary font-bold underline'>
				hello world
				<div className='i-mdi-alarm text-size-4xl text-orange-400' />
			</h1>

			<h2>{import.meta.env.APP_ENV}</h2>
			<h3 className='text-green-700 font-bold'>{message}</h3>

			<img alt='logo' src={Logo} width='10%' />
			<img alt='vite logo' src={viteLogoUrl} width='10%' />
		</section>
	);
};

export default MainPage;
