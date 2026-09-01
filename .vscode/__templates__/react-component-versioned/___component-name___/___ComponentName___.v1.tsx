import { useState } from 'react';
import type { ___ComponentName___Props } from './___ComponentName___.tsx';
import styles from './___ComponentName___.module.css';

/**
 * ___ComponentName___V1 component.
 *
 * @returns component
 */
export const ___ComponentName___V1: React.FC<___ComponentName___Props> = ({
	title,
}): React.ReactElement => {
	const [value, setValue] = useState('___ComponentName___V1');

	return (
		<div className={styles.container}>
			<h1>{title}</h1>

			<span>{value}</span>
		</div>
	);
};
