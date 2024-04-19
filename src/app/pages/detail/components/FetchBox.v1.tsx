import Logo from '../../../assets/logo.svg';
import styles from './fetch-box.module.scss';

export const FetchBox_v1: React.FC = () => {
	return (
		<div className={styles.box}>
			<img alt='logo' className={styles.logo} src={Logo} />
		</div>
	);
};
