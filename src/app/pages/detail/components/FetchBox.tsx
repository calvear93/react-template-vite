import { useAtom } from 'jotai';
import { ReactComponent as Logo } from 'app/assets/logo.svg';
import styles from './fetch-box.module.scss';
import { asyncAtom } from '../atoms/async.atom';

export const FetchBox: React.FC = () => {
	const [{ loading, content }, dispatchFetch] = useAtom(asyncAtom);

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
