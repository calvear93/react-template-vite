import {
	act,
	cleanup,
	fireEvent,
	render,
	screen,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import {
	afterAll,
	afterEach,
	beforeAll,
	describe,
	expect,
	test,
	vi,
} from 'vitest';
import { mockPopover } from '../../__mocks__/popover.mock.ts';
import { Tooltip } from './Tooltip.tsx';

const HINT = 'Se descarga como PDF';
/** How long the pointer rests on a control before its hint shows. */
const WAIT = 300;

const control = () => screen.getByRole('button', { name: 'Descargar' });
// the description is always in the page; the bubble only while it shows
const bubbles = () => screen.queryAllByText(HINT).length - 1;
const opened = () =>
	screen.getAllByText(HINT).at(-1)?.parentElement?.dataset.openedBy;

const pass = (time: number) => {
	act(() => {
		vi.advanceTimersByTime(time);
	});
};

/** The pointer comes to the control and rests on it for as long as a cold hint waits. */
const rest = async () => {
	await userEvent.hover(control());
	pass(WAIT);
};

const renderTip = (side?: 'bottom' | 'left' | 'right' | 'top') =>
	render(
		<>
			<Tooltip className='extra' content={HINT} side={side}>
				<button type='button'>Descargar</button>
			</Tooltip>
			<button type='button'>Otro</button>
		</>,
	);

describe(Tooltip, () => {
	// hooks
	beforeAll(() => {
		// the clock of the hints (their wait, and how long ago one was in sight) is the test's
		vi.useFakeTimers({ advanceTimeDelta: 1, shouldAdvanceTime: true });
	});

	afterEach(() => {
		cleanup();
		// the hint of a test is long gone for the next one: every test starts cold
		vi.advanceTimersByTime(1000);
	});

	afterAll(() => {
		vi.useRealTimers();
	});

	// tests
	test.each([undefined, 'top', 'bottom', 'left', 'right'] as const)(
		'describes its control with the hint, shown or not (%s)',
		async (side) => {
			renderTip(side);

			expect(control()).toHaveAccessibleDescription(HINT);
			expect(bubbles()).toBe(0);

			await rest();

			expect(bubbles()).toBe(1);
			expect(control()).toHaveAccessibleDescription(HINT);
		},
	);

	test('adds its hint to the description the control already had', () => {
		render(
			<>
				<span id='format'>Formato A4</span>
				<Tooltip content={HINT}>
					<button aria-describedby='format' type='button'>
						Descargar
					</button>
				</Tooltip>
			</>,
		);

		expect(control()).toHaveAccessibleDescription(`Formato A4 ${HINT}`);
	});

	test('shows without describing when it only repeats the name of its control', async () => {
		render(
			<Tooltip content='Descargar' describes={false}>
				<button aria-describedby='format' type='button'>
					Descargar
				</button>
			</Tooltip>,
		);

		expect(control()).toHaveAttribute('aria-describedby', 'format');

		await userEvent.tab();

		// the name of the button and its bubble
		expect(screen.getAllByText('Descargar')).toHaveLength(2);
	});

	test('neither shows nor describes while it is disabled', async () => {
		render(
			<Tooltip content={HINT} disabled>
				<button type='button'>Descargar</button>
			</Tooltip>,
		);

		await userEvent.tab();
		await rest();

		expect(control()).toHaveFocus();
		expect(control()).not.toHaveAttribute('aria-describedby');
		expect(screen.queryByText(HINT)).not.toBeInTheDocument();
	});

	test('shows on focus and goes away when the focus leaves', async () => {
		renderTip();

		await userEvent.tab();

		expect(control()).toHaveFocus();
		expect(bubbles()).toBe(1);

		await userEvent.tab();

		expect(bubbles()).toBe(0);
	});

	test('shows on hover and goes away when the pointer leaves', async () => {
		renderTip();

		await rest();

		expect(bubbles()).toBe(1);

		await userEvent.unhover(control());

		expect(bubbles()).toBe(0);
	});

	test('stays while its control has the focus, even if the pointer leaves', async () => {
		renderTip();

		await userEvent.tab();
		await userEvent.hover(control());
		await userEvent.unhover(control());

		expect(bubbles()).toBe(1);
	});

	test('goes away with Escape until the control is entered again', async () => {
		renderTip();

		await userEvent.tab();
		await userEvent.keyboard('{Escape}');

		expect(bubbles()).toBe(0);
		expect(control()).toHaveFocus();

		await rest();

		expect(bubbles()).toBe(1);
	});

	test('draws its bubble in the top layer, for the eyes only', async () => {
		const popover = mockPopover();

		renderTip();
		await userEvent.tab();

		expect(popover.showPopover).toHaveBeenCalledOnce();
		// the description node is what assistive technology reads: one tooltip text exposed
		expect(
			screen.getAllByText(HINT, { ignore: '[aria-hidden] *' }),
		).toHaveLength(1);
	});

	test('does not show for the focus a press gives, and steps aside when its control is pressed', async () => {
		renderTip();

		await rest();

		expect(bubbles()).toBe(1);

		// the press focuses the button: used, not asked about
		await userEvent.click(control());

		expect(control()).toHaveFocus();
		expect(bubbles()).toBe(0);

		// the keyboard coming back to it does ask
		await userEvent.tab();
		await userEvent.tab({ shift: true });

		expect(bubbles()).toBe(1);
	});

	test('goes away when the focus is elsewhere, even if its control never said it lost it', async () => {
		const Replaced = () => {
			const [isLink, setIsLink] = useState(false);
			const Control = isLink ? 'a' : 'button';

			return (
				<>
					<Tooltip content={HINT}>
						{/* a control that is swapped for another loses the focus with no blur */}
						<Control
							{...(isLink ? { href: '#' } : { type: 'button' })}
							onKeyDown={() => setIsLink(true)}
						>
							Descargar
						</Control>
					</Tooltip>
					<button type='button'>Otro</button>
				</>
			);
		};

		render(<Replaced />);
		await userEvent.tab();

		expect(bubbles()).toBe(1);

		fireEvent.keyDown(control(), { key: 'Enter' });

		expect(bubbles()).toBe(1);

		act(() => screen.getByRole('button', { name: 'Otro' }).focus());

		expect(bubbles()).toBe(0);
	});

	test('goes away with a press anywhere else while the focus keeps it open', async () => {
		renderTip();

		await userEvent.tab();
		fireEvent.pointerDown(document.body);

		expect(bubbles()).toBe(0);
	});

	test('waits a moment for a pointer passing by, with no bubble in the page until then', () => {
		renderTip();
		fireEvent.mouseEnter(control());

		// nothing is drawn, nor placed, while the pointer may only be passing by
		expect(bubbles()).toBe(0);

		// it left before its hint reached the screen: the next one waits too
		pass(100);
		fireEvent.mouseLeave(control());
		pass(100);
		fireEvent.mouseEnter(control());
		pass(WAIT - 1);

		expect(bubbles()).toBe(0);

		pass(1);

		expect(bubbles()).toBe(1);
		expect(opened()).toBe('hover');
	});

	test('does not wait when another hint was just in sight', async () => {
		renderTip();
		await rest();

		// this one was read: the next hint, right after, shows at once
		fireEvent.mouseLeave(control());
		pass(200);
		fireEvent.mouseEnter(control());

		expect(bubbles()).toBe(1);
		expect(opened()).toBe('warm');

		// a while later the pointer is passing by again
		pass(100);
		fireEvent.mouseLeave(control());
		pass(700);
		fireEvent.mouseEnter(control());

		expect(bubbles()).toBe(0);

		pass(WAIT);

		expect(opened()).toBe('hover');
	});

	test.each([
		{
			how: 'the pointer leaves',
			leave: () => fireEvent.mouseLeave(control()),
		},
		{
			how: 'its control is pressed',
			leave: () => fireEvent.pointerDown(control()),
		},
		{
			how: 'Escape is pressed',
			leave: () => fireEvent.keyDown(control(), { key: 'Escape' }),
		},
		{
			how: 'its control loses the focus',
			leave: () => fireEvent.blur(control()),
		},
	])('does not show once $how before the wait is over', ({ leave }) => {
		renderTip();
		fireEvent.mouseEnter(control());
		pass(WAIT - 1);
		leave();
		pass(1000);

		expect(bubbles()).toBe(0);
		expect(vi.getTimerCount()).toBe(0);
	});

	test('forgets the hint it was waiting to show when it leaves the page', () => {
		const { unmount } = renderTip();

		fireEvent.mouseEnter(control());

		expect(vi.getTimerCount()).toBe(1);

		unmount();

		expect(vi.getTimerCount()).toBe(0);
	});

	test('shows at once for the focus that comes while the pointer waits, and stays when the pointer leaves', async () => {
		renderTip();
		fireEvent.mouseEnter(control());
		await userEvent.tab();

		expect(bubbles()).toBe(1);
		expect(opened()).toBe('focus');

		// the wait of the pointer is over: the hint is still the one of the focus
		pass(WAIT);
		fireEvent.mouseLeave(control());

		expect(bubbles()).toBe(1);
	});
});
