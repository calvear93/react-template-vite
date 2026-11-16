import {
	act,
	cleanup,
	fireEvent,
	render,
	screen,
	waitFor,
} from '@testing-library/react';
import { useRef } from 'react';
import { afterEach, describe, expect, test, vi } from 'vitest';
import { mockAnimations } from '../../__mocks__/animations.mock.ts';
import { mockPopover } from '../../__mocks__/popover.mock.ts';
import { mockRect } from '../../__mocks__/rect.mock.ts';
import { Popup, type PopupProps } from './Popup.tsx';

const Harness = (props: Omit<PopupProps, 'anchor'>) => {
	const anchor = useRef<HTMLButtonElement>(null);

	return (
		<>
			<button
				ref={(node) => {
					anchor.current = node;

					// the anchor has a box before the popup is placed
					if (node)
						mockRect(node, {
							height: 40,
							left: 100,
							top: 100,
							width: 320,
						});
				}}
				type='button'
			>
				Ancla
			</button>
			<Popup anchor={anchor} role='listbox' {...props}>
				{props.children ?? 'Contenido'}
			</Popup>
		</>
	);
};

describe(Popup, () => {
	// hooks
	afterEach(cleanup);

	// tests
	test('renders nothing while it is closed', () => {
		render(<Harness open={false} />);

		expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
	});

	test('is placed under its anchor as a fixed box where there is no Popover API', () => {
		render(<Harness className='extra' open />);

		const popup = screen.getByRole('listbox');

		expect(popup).toHaveAttribute('popover', 'manual');
		expect(popup).toHaveAttribute('data-side', 'bottom');
		expect(popup).toHaveStyle({ left: '100px', top: '144px' });
		expect(popup).toHaveClass('extra');
	});

	test('goes to the top layer where the browser has the Popover API', () => {
		const popover = mockPopover();

		render(<Harness open />);

		expect(popover.showPopover).toHaveBeenCalledOnce();
	});

	test('takes the width of its anchor and the limits given', () => {
		render(
			<Harness align='end' gap={10} matchWidth maxHeight={200} open />,
		);

		expect(screen.getByRole('listbox')).toHaveStyle({
			maxHeight: '200px',
			top: '150px',
			width: '320px',
		});
	});

	test('follows its anchor when the page scrolls or the window changes, while open', () => {
		const { rerender } = render(<Harness open />);
		const popup = screen.getByRole('listbox');

		mockRect(screen.getByRole('button'), {
			height: 40,
			left: 60,
			top: 300,
			width: 320,
		});
		fireEvent.scroll(window);

		expect(popup).toHaveStyle({ left: '60px', top: '344px' });

		mockRect(screen.getByRole('button'), {
			height: 40,
			left: 20,
			top: 200,
			width: 320,
		});
		fireEvent(window, new Event('resize'));

		expect(popup).toHaveStyle({ left: '20px', top: '244px' });

		rerender(<Harness open={false} />);
		fireEvent.scroll(window);

		expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
	});

	test('is not moved by what scrolls inside of it, only by what scrolls outside', () => {
		render(
			<Harness open>
				<div data-testid='list'>Opciones</div>
			</Harness>,
		);

		const popup = screen.getByRole('listbox');

		expect(popup).toHaveStyle({ top: '144px' });

		// the anchor moved, but the scroll is of its own list: nothing to follow
		mockRect(screen.getByRole('button'), {
			height: 40,
			left: 100,
			top: 300,
			width: 320,
		});
		fireEvent.scroll(screen.getByTestId('list'));
		fireEvent.scroll(popup);

		expect(popup).toHaveStyle({ top: '144px' });

		fireEvent.scroll(document.body);

		expect(popup).toHaveStyle({ top: '344px' });
	});

	test('keeps the scroll of its list when it is measured again', () => {
		render(
			<Harness open>
				<div data-testid='list'>Opciones</div>
			</Harness>,
		);

		const list = screen.getByTestId('list');
		const popup = screen.getByRole('listbox');
		const putBack = vi.fn<(top: number) => void>();
		let top = 0;

		// as a browser does: without its limit the list no longer overflows, and its scroll is lost
		Object.defineProperty(list, 'scrollTop', {
			configurable: true,
			get: () => {
				if (popup.style.maxHeight === '') top = 0;

				return top;
			},
			set: (value: number) => {
				putBack(value);
				top = value;
			},
		});

		// the list scrolls, which a browser always tells
		top = 80;
		fireEvent.scroll(list);
		fireEvent(window, new Event('resize'));

		expect(putBack).toHaveBeenCalledExactlyOnceWith(80);
		expect(list.scrollTop).toBe(80);
	});

	test('forgets the scroll of a list that is no longer in it', () => {
		const { rerender } = render(
			<Harness open>
				<div data-testid='list'>Opciones</div>
				<svg data-testid='drawing' />
			</Harness>,
		);

		const list = screen.getByTestId('list');
		const putBack = vi.fn<(top: number) => void>();

		Object.defineProperty(list, 'scrollTop', {
			configurable: true,
			set: putBack,
			get: () => 80,
		});
		fireEvent.scroll(list);
		// a drawing inside has no scroll to keep
		fireEvent.scroll(screen.getByTestId('drawing'));
		rerender(
			<Harness open>
				<span>Sin lista</span>
			</Harness>,
		);
		fireEvent(window, new Event('resize'));

		expect(putBack).not.toHaveBeenCalled();
		expect(screen.getByRole('listbox')).toHaveTextContent('Sin lista');
	});

	test('measures itself once, and not again when the page scrolls', () => {
		render(<Harness maxHeight={200} open />);

		const popup = screen.getByRole('listbox');
		const measured = vi.fn(() => 500);
		const limits: string[] = [];

		Object.defineProperty(popup, 'scrollHeight', {
			configurable: true,
			get: () => {
				limits.push(popup.style.maxHeight);

				return measured();
			},
		});

		mockRect(screen.getByRole('button'), {
			height: 40,
			left: 100,
			top: 300,
			width: 320,
		});
		fireEvent.scroll(window);
		fireEvent.scroll(document.body);

		// it followed its anchor with the size it already knew, its limit in place
		expect(popup).toHaveStyle({ maxHeight: '200px', top: '344px' });
		expect(measured).not.toHaveBeenCalled();

		fireEvent(window, new Event('resize'));

		// a resize measures again, without the limit
		expect(measured).toHaveBeenCalledOnce();
		expect(limits).toStrictEqual(['']);
		expect(popup).toHaveStyle({ maxHeight: '200px' });
	});

	test('measures itself again when what it holds changes', async () => {
		const { rerender } = render(
			<Harness open side='top'>
				<span>Una opción</span>
			</Harness>,
		);

		const popup = screen.getByRole('listbox');
		let height = 60;

		Object.defineProperty(popup, 'scrollHeight', {
			configurable: true,
			get: () => height,
		});
		fireEvent(window, new Event('resize'));

		// above its anchor (top 100): 100 - 4 - 60
		expect(popup).toHaveStyle({ top: '36px' });

		height = 20;
		rerender(
			<Harness open side='top'>
				<b>Otra</b>
			</Harness>,
		);

		// shorter now, it stays next to its anchor: 100 - 4 - 20
		await waitFor(() => expect(popup).toHaveStyle({ top: '76px' }));
	});

	test('writes its side once while it does not change', () => {
		render(<Harness open />);

		const popup = screen.getByRole('listbox');
		const written = vi.fn();
		const observer = new MutationObserver(written);

		observer.observe(popup, {
			attributeFilter: ['data-side'],
			attributes: true,
		});
		fireEvent.scroll(window);
		fireEvent(window, new Event('resize'));

		expect(observer.takeRecords()).toHaveLength(0);
		expect(popup).toHaveAttribute('data-side', 'bottom');

		observer.disconnect();
	});

	test('stays, inert, for the moment its way out takes', async () => {
		const animations = mockAnimations();
		const { rerender } = render(<Harness open />);

		rerender(<Harness open={false} />);

		const popup = screen.getByRole('listbox');

		expect(popup).toHaveAttribute('data-leaving');
		expect(popup.inert).toBe(true);

		await act(() => animations.finish());

		expect(popup).not.toBeInTheDocument();
	});

	test('is the same popup, shown once, when it is opened again on its way out', () => {
		mockAnimations();
		const popover = mockPopover();
		const { rerender } = render(<Harness open />);
		const popup = screen.getByRole('listbox');

		rerender(<Harness open={false} />);
		rerender(<Harness open />);

		expect(screen.getByRole('listbox')).toBe(popup);
		expect(popup).not.toHaveAttribute('data-leaving');
		expect(popup.inert).toBe(false);
		expect(popover.showPopover).toHaveBeenCalledOnce();
	});
});
