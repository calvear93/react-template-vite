import { useLoaderData, useParams } from '#libs/router';
import { Badge, Button, Card, DataGrid, Page, PageHeader } from '#libs/ui-core';
import { useInjection } from '../../app.ioc.ts';
import Logo from '../../assets/logo.svg';
import { FetchBox } from './components/FetchBox.tsx';
import styles from './Detail.page.module.css';

export const DetailPage = () => {
	const { id } = useParams();
	const aMessage = useLoaderData<string>();
	const { example } = useInjection<{ example: string }>('injectionToken');

	// jsx
	return (
		<Page>
			<title>Detail Page</title>

			<PageHeader
				actions={
					<Button href='/' icon='arrow-left' variant='outlined'>
						Go To Main
					</Button>
				}
				breadcrumb={[{ href: '/', label: 'Home' }, { label: 'Detail' }]}
				meta={
					<span className={styles.meta}>
						{id && <Badge tone='primary'>ID: {id}</Badge>}
						<Badge tone='info'>{import.meta.env.APP_ENV}</Badge>
					</span>
				}
				title='Detail'
			/>

			<div className={styles.columns}>
				<Card
					description='What the router and the container gave this page.'
					title='Route'
				>
					<DataGrid
						entries={[
							{ label: 'Route id', value: id },
							{
								label: 'Environment',
								value: import.meta.env.APP_ENV,
							},
							{ label: 'Message of the loader', value: aMessage },
							{
								label: 'Injected example data',
								value: (
									<b data-testid='injected-data'>{example}</b>
								),
							},
						]}
					/>
				</Card>

				<FetchBox logoSrc={Logo} />
			</div>
		</Page>
	);
};

export default DetailPage;
