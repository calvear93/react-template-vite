import { Badge, Button, Page, StatusDot } from '#libs/ui-core';
import { useAtom } from 'jotai';
import { useEffect } from 'react';
import Logo from '../../assets/logo.svg';
import { sampleStore } from '../../store/sample.store.ts';
import {
	type FeatureItem,
	FeatureList,
} from './components/feature-list/FeatureList.tsx';
import styles from './Main.page.module.css';

const DETAIL = '/detail';

/** What the store answered, as a state: it is asked when the page arrives. */
const STORE_TONES = {
	error: 'danger',
	loading: 'neutral',
	success: 'success',
} as const;

export const MainPage = () => {
	const [message, setStatus] = useAtom(sampleStore);

	// effects
	useEffect(() => {
		setStatus(200);
	}, [setStatus]);

	const features: readonly FeatureItem[] = [
		{
			description:
				'Lazy pages, loaders and parameters, declared once in app.routes.tsx.',
			href: `${DETAIL}/123`,
			icon: 'link',
			linkLabel: 'Try a route',
			title: 'Typed routes',
		},
		{
			description:
				'Services bound in app.ioc.ts and resolved where they are used.',
			href: DETAIL,
			icon: 'share',
			linkLabel: 'See an injected service',
			title: 'Dependency injection',
		},
		{
			description:
				'Versions of a component switched at runtime, without a deploy.',
			href: DETAIL,
			icon: 'filter',
			linkLabel: 'See a flagged component',
			title: 'Feature flags',
		},
		{
			description:
				'Jotai atoms, app-wide or of a page. This one was asked:',
			icon: 'activity',
			title: 'Store',
			aside: (
				<span className={styles.state}>
					<StatusDot
						tone={
							STORE_TONES[message as keyof typeof STORE_TONES] ??
							'neutral'
						}
					/>
					{message}
				</span>
			),
		},
		{
			description:
				'Sixty components, light and dark themes, an accent to choose, two languages.',
			href: '/ui',
			icon: 'contrast',
			linkLabel: 'Open the UI catalog',
			title: 'UI kit',
		},
	];

	// jsx
	return (
		<Page narrow>
			<title>Main Page</title>

			<div className={styles.hero}>
				<img alt='' className={styles.mark} src={Logo} />

				<div className={styles.intro}>
					<h1 className={styles.name}>{import.meta.env.APP_NAME}</h1>
					<p className={styles.lead}>
						A React single-page app template, ready to build on:
						routes, services, flags, a store and a UI kit, already
						wired together.
					</p>
					<Badge tone='info'>{import.meta.env.APP_ENV}</Badge>
				</div>

				<div className={styles.actions}>
					<Button href={DETAIL} variant='outlined'>
						Go To Detail
					</Button>
					<Button href={`${DETAIL}/123`}>Go To Detail 123</Button>
				</div>
			</div>

			<FeatureList items={features} title='What is in the box' />
		</Page>
	);
};

export default MainPage;
