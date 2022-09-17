import { Link, Page, useParams } from '@router';
import { routes } from 'app/app.routes';
import { FetchBox } from './components/FetchBox';
import styles from './detail.page.module.scss';

// constants
const rootPath = routes.app.Main[0];

/**
 * Detail page.
 *
 * @returns {JSX.Element} detail page
 */
export const DetailPage: React.FC = (): JSX.Element => {
    const { id } = useParams();

    return (
        <Page title='Detail Page' className={styles.page}>
            <Link to={rootPath}>Go To Main</Link>

            <h2>{import.meta.env.VITE_APP_ENV}</h2>
            {id && <h3>ID: {id}</h3>}

            <FetchBox />
        </Page>
    );
};

// for lazy loading
export default DetailPage;
