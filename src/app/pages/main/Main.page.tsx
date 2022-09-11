import { Link } from '@router';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { sampleSlice, useSampleSelector } from 'app/slices';
import styles from './main.page.module.scss';

const { sample: sampleAction } = sampleSlice.actions;

/**
 * Main page.
 *
 * @returns {JSX.Element} main page
 */
export const MainPage: React.FC = (): JSX.Element => {
    const dispatch = useDispatch();
    const { message } = useSampleSelector();

    useEffect(() => {
        dispatch(sampleAction(200));
    }, []);

    return (
        <section className={styles.page}>
            <Link to='/detail'>Go To Detail</Link>
            <Link to='/detail/123'>Go To Detail 123</Link>
            <h2>{import.meta.env.VITE_APP_ENV}</h2>
            <h3>{message}</h3>
        </section>
    );
};

// for lazy loading
export default MainPage;
