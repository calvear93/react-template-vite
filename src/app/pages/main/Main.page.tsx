import { generatePath, Link, Page } from '@router';
import { useEffect } from 'react';
import { routes } from 'app/app.routes';
import { useAppDispatch } from 'app/App.store';
import { sampleSlice, useSampleSelector } from 'app/slices';
import styles from './main.page.module.scss';

// constants
const detailPath = routes.app.Detail[0];
const detailPathWithId = (id: number) =>
    generatePath(routes.app.Detail[1], { id });

// store actions
const { sample: sampleAction } = sampleSlice.actions;

/**
 * Main page.
 *
 * @returns {JSX.Element} main page
 */
export const MainPage: React.FC = (): JSX.Element => {
    const dispatch = useAppDispatch();
    const { message } = useSampleSelector();

    useEffect(() => {
        dispatch(sampleAction(200));
    }, []);

    return (
        <Page title='Main Page' className={styles.page}>
            <Link to={detailPath}>Go To Detail</Link>
            <Link to={detailPathWithId(123)}>Go To Detail 123</Link>
            <h2>{import.meta.env.VITE_APP_ENV}</h2>
            <h3>{message}</h3>
        </Page>
    );
};

// for lazy loading
export default MainPage;
