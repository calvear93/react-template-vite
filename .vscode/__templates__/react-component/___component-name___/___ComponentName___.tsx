import { useState } from 'react';
import styles from './___ComponentName___.module.css';

/**
 * ___ComponentName___ component.
 *
 * @returns component
 */
export const ___ComponentName___: React.FC<___ComponentName___Props> = ({
	title,
}): React.ReactElement => {
	const [value, setValue] = useState('___ComponentName___');

	return (
		<div className={styles.container}>
			<h1>{title}</h1>

			<span>{value}</span>
		</div>
	);
};

export interface ___ComponentName___Props {
	title?: string;
}
