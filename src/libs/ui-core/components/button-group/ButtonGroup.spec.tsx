import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterAll, beforeAll, describe, expect, test } from 'vitest';
import { Button } from '../button/Button.tsx';
import { ButtonGroup } from './ButtonGroup.tsx';

describe(ButtonGroup, () => {
	// hooks
	beforeAll(() => {
		render(
			<ButtonGroup className='extra' label='Vista'>
				<Button variant='outlined'>Lista</Button>
				<Button variant='outlined'>Tarjetas</Button>
			</ButtonGroup>,
		);
	});

	afterAll(cleanup);

	// tests
	test('is a group named by its label, with its buttons inside', () => {
		const group = screen.getByRole('group', { name: 'Vista' });

		expect(within(group).getAllByRole('button')).toHaveLength(2);
		expect(group).toHaveClass('extra');
	});

	test('keeps a Tab stop for each button', async () => {
		await userEvent.tab();

		expect(screen.getByRole('button', { name: 'Lista' })).toHaveFocus();

		await userEvent.tab();

		expect(screen.getByRole('button', { name: 'Tarjetas' })).toHaveFocus();
	});
});
