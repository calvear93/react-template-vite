import styles from './___LayoutName___.layout.module.css';

/**
 * ___LayoutName___ layout.
 *
 * @returns layout
 */
export const ___LayoutName___Layout: React.FC<React.PropsWithChildren> = ({
	children,
}): React.ReactElement => {
	return <main className={styles.layout}>{children}</main>;
};
