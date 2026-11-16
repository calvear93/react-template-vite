import { Badge, Button, Card, Icon, Page, PageHeader } from '#libs/ui-core';
import { useAtom } from 'jotai';
import { useEffect } from 'react';
import Logo from '../../assets/logo.svg';
import viteLogoUrl from '../../assets/vite.png';
import { sampleStore } from '../../store/sample.store.ts';
import styles from './Main.page.module.css';

export const MainPage = () => {
	const [message, setStatus] = useAtom(sampleStore);

	// effects
	useEffect(() => {
		setStatus(200);
	}, [setStatus]);

	// jsx
	return (
		<Page>
			<title>Main Page</title>

			<PageHeader
				actions={
					<>
						<Button href='/detail' variant='outlined'>
							Go To Detail
						</Button>
						<Button href='/detail/123'>Go To Detail 123</Button>
					</>
				}
				meta={<Badge tone='info'>{import.meta.env.APP_ENV}</Badge>}
				title='Hello world'
			/>

			<div className={styles.cards}>
				<Card
					description='What the sample store says of the last request.'
					title='Store'
				>
					<p className={styles.status}>
						<Icon name='check-circle' size='sm' />
						{message}
					</p>
				</Card>

				<Card description='Served from src/app/assets.' title='Assets'>
					<div className={styles.logos}>
						<img alt='logo' src={Logo} />
						<img alt='vite logo' src={viteLogoUrl} />
					</div>
				</Card>
			</div>
		</Page>
	);
};

export default MainPage;
