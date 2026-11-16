import {
	type ComponentProps,
	type RefObject,
	useLayoutEffect,
	useRef,
} from 'react';
import { cx } from '../cx.ts';
import { mergeRefs } from '../merge-refs.ts';
import {
	computePosition,
	type PositionOptions,
	type Size,
} from '../position.ts';
import { usePresence } from '../use-presence.hook.ts';
import styles from './Popup.module.css';

/**
 * A surface anchored to an element: the panel of a menu, a list of suggestions,
 * a calendar. Rendered in place (no portal), so it works inside a modal dialog,
 * and shown in the top layer where the browser has the Popover API; elsewhere it
 * is a fixed box above the page. It places itself next to its anchor and follows
 * it on resize and on the scroll of what is around it (not of its own content,
 * whose scroll it keeps). It measures itself when it opens, on resize and when
 * what it holds changes; a scroll of the page only reads the box of its anchor.
 *
 * It only draws and places: who opens it, closes it and moves the focus is the
 * component that uses it. Closed, it stays for the moment its way out takes
 * (`data-leaving`, inert) and then leaves the page.
 *
 * @returns popup, or nothing while closed
 */
export const Popup = ({
	align,
	anchor,
	className,
	gap,
	matchWidth,
	maxHeight,
	minHeight,
	open,
	ref,
	side,
	...props
}: PopupProps) => {
	const popup = useRef<HTMLDivElement>(null);
	const shown = useRef<HTMLDivElement>(null);
	const { isLeaving, isPresent } = usePresence(open, popup);

	useLayoutEffect(() => {
		const node = popup.current;
		const anchorNode = anchor.current;

		if (!open || !node || !anchorNode) return;

		// the top layer where there is one; the fixed box of the stylesheet elsewhere. Once
		// per element: opened again on its way out, it is the same one, already there
		if (shown.current !== node && typeof node.showPopover === 'function')
			node.showPopover();

		shown.current = node;

		// its size without its limit, kept while it holds: `undefined` asks for a new measure
		let natural: Size | undefined;
		// what scrolled inside the popup, its lists: the only scrolls a measure can lose
		const scrolled = new Set<HTMLElement>();

		const write = (
			property: 'left' | 'maxHeight' | 'top' | 'width',
			value: string,
		) => {
			if (node.style[property] !== value) node.style[property] = value;
		};

		const place = () => {
			const tops: (readonly [HTMLElement, number])[] = [];

			if (!natural) {
				// measuring the natural height lets go of the limit for a moment, and a list
				// that no longer overflows forgets its scroll: it is kept, and put back
				for (const element of scrolled) {
					if (!element.isConnected) scrolled.delete(element);
					else if (element.scrollTop > 0)
						tops.push([element, element.scrollTop]);
				}

				node.style.maxHeight = '';
				natural = {
					height: node.scrollHeight,
					width: node.offsetWidth,
				};
			}

			const position = computePosition(
				anchorNode.getBoundingClientRect(),
				natural,
				{ height: window.innerHeight, width: window.innerWidth },
				{ align, gap, matchWidth, maxHeight, minHeight, side },
			);

			if (node.dataset.side !== position.side)
				node.dataset.side = position.side;

			write('top', `${position.top}px`);
			write('left', `${position.left}px`);
			write('maxHeight', `${position.maxHeight}px`);

			if (position.width !== undefined)
				write('width', `${position.width}px`);

			for (const [element, top] of tops) element.scrollTop = top;
		};

		const measure = () => {
			natural = undefined;
			place();
		};

		// what scrolls inside the popup (its own list) does not move it: only what is around,
		// and then its size is the one it had, so only the box of its anchor is read
		const follow = ({ target }: Event) => {
			if (!(target instanceof Node && node.contains(target))) place();
			else if (target instanceof HTMLElement) scrolled.add(target);
		};

		// what it holds changed (a list filtered, a month turned): its size is another
		const content = new MutationObserver(measure);

		place();
		content.observe(node, { childList: true, subtree: true });
		window.addEventListener('resize', measure);
		window.addEventListener('scroll', follow, true);

		return () => {
			content.disconnect();
			window.removeEventListener('resize', measure);
			window.removeEventListener('scroll', follow, true);
		};
	}, [align, anchor, gap, matchWidth, maxHeight, minHeight, open, side]);

	if (!isPresent) return null;

	return (
		<div
			className={cx(styles.root, className)}
			data-leaving={isLeaving || undefined}
			inert={isLeaving}
			popover='manual'
			ref={mergeRefs(popup, ref)}
			{...props}
		/>
	);
};

export interface PopupProps
	extends
		Omit<ComponentProps<'div'>, 'popover'>,
		Omit<PositionOptions, 'margin'> {
	/** The element the popup hangs from. */
	anchor: RefObject<HTMLElement | null>;
	open: boolean;
}
