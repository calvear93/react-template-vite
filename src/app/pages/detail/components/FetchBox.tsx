import { ReactComponent as Logo } from 'app/assets/logo.svg';
import { useAsyncFetch } from '../hooks/useAsyncFetch.hook';
import styles from './fetch-box.module.scss';

export const FetchBox: React.FC = () => {
    const [{ loading, content }, dispatchFetch] = useAsyncFetch();

    return (
        <div className={styles.box}>
            <Logo style={{ height: 128, width: 128 }} className={styles.logo} />
            <button className={styles.button} onClick={dispatchFetch}>
                Fetch
            </button>
            {loading ? <h4>Fetching Data</h4> : <h4>{content.anyProp}</h4>}
        </div>
    );
};
