import { useAtom } from 'jotai';
import Logo from 'app/assets/logo.svg?react';
import styles from './fetch-box.module.scss';
import { asyncAtom } from '../atoms/async.atom';

export const FetchBox: React.FC = () => {
	const [{ content, loading }, dispatchFetch] = useAtom(asyncAtom);

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
