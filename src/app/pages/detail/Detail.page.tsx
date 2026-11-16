import { useLoaderData, useParams } from '#libs/router';
import {
	Badge,
	Button,
	DataGrid,
	InfoNote,
	Page,
	PageHeader,
} from '#libs/ui-core';
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
		<Page className={styles.page} narrow>
			<title>Detail Page</title>

			<PageHeader
				actions={
					<Button href='/' icon='arrow-left' variant='outlined'>
						Go To Main
					</Button>
				}
				meta={<Badge tone='info'>{import.meta.env.APP_ENV}</Badge>}
				title='Detail'
			/>

			<h2>{import.meta.env.APP_ENV}</h2>
			{id && <h2>ID: {id}</h2>}

			<DataGrid
				entries={[{ label: 'Message of the loader', value: aMessage }]}
			/>

			<InfoNote>
				<span data-testid='injected-data'>
					Injected example data: <b>{example}</b>
				</span>
			</InfoNote>

			<FetchBox logoSrc={Logo} />
		</Page>
	);
};

export default DetailPage;
