import { useAtom } from 'jotai';
import styles from './fetch-box.module.scss';
import { asyncAtom } from '../atoms/async.atom.ts';
import Logo from '../../../assets/logo.svg';

export const FetchBox: React.FC = () => {
	const [{ content, loading }, dispatchFetch] = useAtom(asyncAtom);

	return (
		<div className={styles.box}>
			<img className={styles.logo} src={Logo} alt='logo' />

			<button className={styles.button} onClick={dispatchFetch}>
				Fetch
			</button>
			{loading ? <h4>Fetching Data</h4> : <h4>{content.anyProp}</h4>}
		</div>
	);
};
