import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, test, vi } from 'vitest';
import { moveRovingFocus, type RovingFocusOptions } from './roving-focus.ts';

const renderToolbar = (options: Partial<RovingFocusOptions> = {}) => {
	const onMove = vi.fn();

	render(
		<div
			aria-label='Formato'
			onKeyDown={(event) =>
				onMove(
					moveRovingFocus(event, { selector: 'button', ...options })
						?.textContent,
				)
			}
			role='toolbar'
			tabIndex={-1}
		>
			<button type='button'>Uno</button>
			<button aria-disabled='true' type='button'>
				Sin acceso
			</button>
			<button disabled type='button'>
				Deshabilitado
			</button>
			<button type='button'>Dos</button>
			<button type='button'>Tres</button>
		</div>,
	);

	return onMove;
};

const button = (name: string) => screen.getByRole('button', { name });

describe(moveRovingFocus, () => {
	// hooks
	afterEach(cleanup);

	// tests
	test('moves with the horizontal arrows, skipping disabled items, and loops', async () => {
		const onMove = renderToolbar();

		button('Uno').focus();
		await userEvent.keyboard('{ArrowRight}');

		expect(button('Dos')).toHaveFocus();

		await userEvent.keyboard('{ArrowRight}{ArrowRight}');

		expect(button('Uno')).toHaveFocus();

		await userEvent.keyboard('{ArrowLeft}');

		expect(button('Tres')).toHaveFocus();
		expect(onMove.mock.calls.flat()).toStrictEqual([
			'Dos',
			'Tres',
			'Uno',
			'Tres',
		]);
	});

	test('jumps to the ends with Home and End', async () => {
		renderToolbar();

		button('Dos').focus();
		await userEvent.keyboard('{End}');

		expect(button('Tres')).toHaveFocus();

		await userEvent.keyboard('{Home}');

		expect(button('Uno')).toHaveFocus();
	});

	test('stops at the ends when it does not loop', async () => {
		renderToolbar({ loop: false });

		button('Tres').focus();
		await userEvent.keyboard('{ArrowRight}');

		expect(button('Tres')).toHaveFocus();

		button('Uno').focus();
		await userEvent.keyboard('{ArrowLeft}');

		expect(button('Uno')).toHaveFocus();
	});

	test('moves with the vertical arrows only, when it is vertical', async () => {
		const onMove = renderToolbar({ orientation: 'vertical' });

		button('Uno').focus();
		await userEvent.keyboard('{ArrowRight}');

		expect(button('Uno')).toHaveFocus();
		expect(onMove).toHaveBeenLastCalledWith(undefined);

		await userEvent.keyboard('{ArrowDown}{ArrowUp}{ArrowUp}');

		expect(button('Tres')).toHaveFocus();
	});

	test('starts from the ends when the focus is on none of its items', async () => {
		renderToolbar();

		screen.getByRole('toolbar').focus();
		await userEvent.keyboard('{ArrowLeft}');

		expect(button('Tres')).toHaveFocus();

		screen.getByRole('toolbar').focus();
		await userEvent.keyboard('{ArrowRight}');

		expect(button('Uno')).toHaveFocus();
	});

	test('does nothing, and does not stop the key, when there are no items', async () => {
		const onKeyDown = vi.fn();

		render(
			<div
				onKeyDown={(event) => {
					moveRovingFocus(event, { selector: 'button' });
					onKeyDown(event.defaultPrevented);
				}}
				role='toolbar'
				tabIndex={-1}
			/>,
		);

		screen.getByRole('toolbar').focus();
		await userEvent.keyboard('{End}');

		expect(onKeyDown).toHaveBeenCalledExactlyOnceWith(false);
	});
});
