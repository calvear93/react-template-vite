import { describe, expect, test } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Page } from './Page';

describe('Page', () => {
	// tests
	test('sets document title', () => {
		const title = 'page title';

		render(<Page title={title} />);

		expect(document.title).toBe(title);
	});

	test('render inner children', () => {
		const content = 'children content';

		render(
			<Page title=''>
				<h1>{content}</h1>
			</Page>,
		);
		const header = screen.getByRole('heading');

		expect(header).toHaveTextContent(content);
	});
});
