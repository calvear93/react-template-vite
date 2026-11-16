import { isRouteErrorResponse, useRouteError } from '#libs/router';
import { Button, Icon } from '#libs/ui-core';
import styles from './Error.page.module.css';

export const ErrorPage = () => {
	const error = useRouteError();

	// jsx
	return (
		<main className={styles.page}>
			<title>Error</title>

			<Icon className={styles.icon} name='alert-triangle' size='lg' />
			<h1 className={styles.title}>
				{isRouteErrorResponse(error)
					? `${error.status} - ${error.statusText}`
					: 'Unknown Error'}
			</h1>
			<p className={styles.text}>This page could not be shown.</p>
			<Button href='/'>Back to the home page</Button>
		</main>
	);
};

export default ErrorPage;
