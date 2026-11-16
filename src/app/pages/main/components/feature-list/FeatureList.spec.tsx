import { StatusDot } from '#libs/ui-core';
import { cleanup, render, screen, within } from '@testing-library/react';
import { afterAll, beforeAll, describe, expect, test } from 'vitest';
import { FeatureList } from './FeatureList.tsx';

describe(FeatureList, () => {
	// hooks
	beforeAll(() => {
		render(
			<FeatureList
				items={[
					{
						description: 'Lazy pages and loaders.',
						href: '/detail',
						icon: 'link',
						linkLabel: 'Try a route',
						title: 'Typed routes',
					},
					{
						description: 'Jotai atoms.',
						icon: 'activity',
						title: 'Store',
						aside: (
							<>
								<StatusDot tone='success' /> success
							</>
						),
					},
				]}
				title='What is in the box'
			/>,
		);
	});

	afterAll(cleanup);

	// tests
	test('is a list named by its title, one item per feature', () => {
		const list = screen.getByRole('list', { name: 'What is in the box' });

		expect(
			screen.getByRole('heading', {
				level: 2,
				name: 'What is in the box',
			}),
		).toBeVisible();
		expect(within(list).getAllByRole('listitem')).toHaveLength(2);
	});

	test('says what each feature is, and leads to where it can be seen', () => {
		const [routes] = screen.getAllByRole('listitem');

		expect(routes).toHaveTextContent('Typed routes');
		expect(routes).toHaveTextContent('Lazy pages and loaders.');
		expect(
			within(routes).getByRole('link', { name: 'Try a route' }),
		).toHaveAttribute('href', '/detail');
	});

	test('shows what a feature says of itself in place of a link', () => {
		const [, store] = screen.getAllByRole('listitem');

		expect(within(store).getByText('success')).toBeVisible();
		expect(within(store).queryByRole('link')).not.toBeInTheDocument();
	});
});
