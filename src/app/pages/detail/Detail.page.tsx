import { Link, useParams } from '@router';
import { FetchBox } from './components/FetchBox';
import styles from './detail.page.module.scss';

/**
 * Detail page.
 *
 * @returns {JSX.Element} detail page
 */
export const DetailPage: React.FC = (): JSX.Element => {
    const { id } = useParams();

    return (
        <section className={styles.page}>
            <Link to='/'>Go To Main</Link>

            <h2>{import.meta.env.VITE_APP_ENV}</h2>
            <h3>ID: {id}</h3>

            <FetchBox />
        </section>
    );
};

// for lazy loading
export default DetailPage;
