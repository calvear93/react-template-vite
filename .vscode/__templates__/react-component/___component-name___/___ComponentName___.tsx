import { useState } from 'react';
import styles from './___ComponentName___.module.css';

/**
 * ___ComponentName___ component.
 *
 * @returns component
 */
export const ___ComponentName___ = ({ title }: ___ComponentName___Props) => {
	const [clicks, setClicks] = useState(0);

	return (
		<div className={styles.container}>
			<h1>{title}</h1>

			<span>___ComponentName___</span>

			<button onClick={() => setClicks(clicks + 1)} type='button'>
				clicks: {clicks}
			</button>
		</div>
	);
};

export interface ___ComponentName___Props {
	title?: string;
}
