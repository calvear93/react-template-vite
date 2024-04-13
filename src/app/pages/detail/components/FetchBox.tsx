import { useAtom } from 'jotai';
import Logo from '../../../assets/logo.svg';
import { asyncAtom } from '../atoms/async.atom.ts';
import styles from './fetch-box.module.scss';

export const FetchBox: React.FC = () => {
	const [{ content, loading }, dispatchFetch] = useAtom(asyncAtom);

	return (
		<div className={styles.box}>
			<img alt='logo' className={styles.logo} src={Logo} />

			<button className={styles.button} onClick={dispatchFetch}>
				Fetch
			</button>
			{loading ? <h4>Fetching Data</h4> : <h4>{content.anyProp}</h4>}
		</div>
	);
};
