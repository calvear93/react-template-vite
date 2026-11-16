import { Button, Card, Skeleton } from '#libs/ui-core';
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
			description='A request of the page, kept in its store.'
			title='Fetch box'
		>
			<div className={styles.box}>
				<img alt='logo' className={styles.logo} src={logoSrc} />

				<div className={styles.answer}>
					<span className={styles.label}>Answer</span>
					{loading ? (
						<Skeleton height='1.5rem' width='9ch' />
					) : (
						<h4 className={styles.result}>
							{content.anyProp ?? 'Nothing fetched yet'}
						</h4>
					)}
				</div>
			</div>
		</Card>
	);
};
