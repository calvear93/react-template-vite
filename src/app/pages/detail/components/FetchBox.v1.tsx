import { Card } from '#libs/ui-core';
import type { FetchBoxProps } from './FetchBox.tsx';
import styles from './FetchBox.module.css';

export const FetchBox_v1 = ({ logoSrc }: FetchBoxProps) => {
	return (
		<Card title='Fetch box'>
			<img alt='logo' className={styles.logo} src={logoSrc} />
		</Card>
	);
};
