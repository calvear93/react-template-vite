import { Button, Card } from '#libs/ui-core';
import { useAtom } from 'jotai';
import { asyncStore } from '../store/async.store.ts';
import type { FetchBoxProps } from './FetchBox.tsx';
import styles from './FetchBox.module.css';

export const FetchBox_v2a = ({ logoSrc }: FetchBoxProps) => {
	const [{ content, loading }, dispatchFetch] = useAtom(asyncStore);

	return (
		<Card
			actions={
				<Button loading={loading} onClick={dispatchFetch}>
					Fetch
				</Button>
			}
			title='Fetch box'
		>
			<div className={styles.box}>
				<img alt='logo' className={styles.logo} src={logoSrc} />
				<h4 className={styles.result}>
					{loading ? 'Fetching Data' : content.anyProp}
				</h4>
			</div>
		</Card>
	);
};
