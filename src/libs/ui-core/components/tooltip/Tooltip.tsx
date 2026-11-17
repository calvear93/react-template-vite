import {
	type AriaAttributes,
	cloneElement,
	type ReactElement,
	type ReactNode,
	useEffect,
	useId,
	useRef,
	useState,
} from 'react';
import { cx } from '../../internal/cx.ts';
import { Popup } from '../../internal/popup/Popup.tsx';
import styles from './Tooltip.module.css';

/** A hint that follows another one this soon shows at once: the person is reading hints. */
const WARM_FOR = 400;

/** How long the pointer rests on a control before its hint shows. */
const HOVER_DELAY = 300;

/** When a hint that was in sight went away, whichever tooltip of the page it was. */
const seen = { at: Number.NEGATIVE_INFINITY };

/** What opened the hint: the focus and a warm pointer at once, a cold pointer once it has rested. */
type OpenedBy = 'focus' | 'hover' | 'warm';

/**
 * A short hint on hover or keyboard focus of a control: it describes it (the
 * control is `aria-describedby` the hint, whether the bubble shows or not). The
 * bubble shows at once on focus and after a moment on hover (at once when another
 * hint was just in sight: moving along a row of them reads fluidly), can be
 * hovered itself, and goes away with Escape, with a press on the control or when
 * the focus is elsewhere. It is drawn in the top layer, so no container clips it,
 * and takes the opposite side when it does not fit. Never the only place of
 * something the person needs: touch screens have no hover.
 *
 * Its child is one focusable element (a button, a link, an input). A hint that only
 * repeats the name of its control (the label of an icon-only link) takes
 * `describes={false}`: it shows, and adds nothing to what is read.
 *
 * @example
 * ```tsx
 * <Tooltip content='Downloads as a PDF'>
 *   <Button icon='download' iconOnly variant='ghost'>Download certificate</Button>
 * </Tooltip>
 * ```
 *
 * @returns the control with its tooltip
 */
export const Tooltip = ({
	children,
	className,
	content,
	describes = true,
	disabled = false,
	side = 'top',
}: TooltipProps) => {
	const id = useId();
	const anchor = useRef<HTMLSpanElement>(null);
	// a press focuses the control too: that focus does not ask for the hint
	const isPressed = useRef(false);
	// the wait of a cold pointer: until it is over there is no bubble, nothing drawn nor placed
	const waiting = useRef<ReturnType<typeof setTimeout>>(undefined);
	const [openedBy, setOpenedBy] = useState<OpenedBy>();
	const isDescription = describes && !disabled;
	const describedBy =
		[children.props['aria-describedby'], isDescription && id]
			.filter(Boolean)
			.join(' ') || undefined;

	const forget = () => {
		clearTimeout(waiting.current);
		waiting.current = undefined;
	};

	const open = (by: OpenedBy) => {
		forget();
		setOpenedBy(by);
	};

	const close = () => {
		forget();

		// only a hint that reached the screen warms the next one up
		if (openedBy !== undefined) seen.at = performance.now();

		setOpenedBy(undefined);
	};

	// the pointer may only be passing by: its hint opens once it has rested on the control
	const wait = () => {
		forget();
		waiting.current = setTimeout(() => open('hover'), HOVER_DELAY);
	};

	// a control that leaves the page takes the hint it was waiting for with it
	useEffect(() => () => clearTimeout(waiting.current), []);

	// a control that loses the focus without saying so (it was replaced, or removed) leaves
	// its hint behind: while it is open by focus, the focus of the page is what keeps it
	useEffect(() => {
		if (openedBy !== 'focus') return;

		const follow = (event: Event) => {
			if (!anchor.current?.contains(event.target as Node))
				setOpenedBy(undefined);
		};

		document.addEventListener('focusin', follow);
		document.addEventListener('pointerdown', follow);

		return () => {
			document.removeEventListener('focusin', follow);
			document.removeEventListener('pointerdown', follow);
		};
	}, [openedBy]);

	return (
		// the wrapper only catches what bubbles from its control: it is not a control itself
		<span
			className={cx(styles.root, className)}
			onBlur={() => {
				isPressed.current = false;
				close();
			}}
			onFocus={() => {
				if (isPressed.current) isPressed.current = false;
				else open('focus');
			}}
			onKeyDown={(event) => {
				isPressed.current = false;

				if (event.key === 'Escape') close();
			}}
			onMouseEnter={() => {
				if (openedBy !== undefined) return;

				if (performance.now() - seen.at < WARM_FOR) open('warm');
				else wait();
			}}
			onMouseLeave={() => {
				if (openedBy !== 'focus') close();
			}}
			onPointerDown={() => {
				// the control is being used: its hint steps aside
				isPressed.current = true;
				close();
			}}
			ref={anchor}
			role='presentation'
		>
			{cloneElement(children, { 'aria-describedby': describedBy })}

			{/* what assistive technology reads with the control, always there */}
			{isDescription && (
				<span hidden id={id}>
					{content}
				</span>
			)}

			{/* the bubble is the same text for the eyes: hidden from assistive technology */}
			<Popup
				align='center'
				anchor={anchor}
				aria-hidden
				className={styles.content}
				data-opened-by={openedBy}
				gap={0}
				minHeight={0}
				open={!disabled && openedBy !== undefined}
				side={side}
			>
				<span className={styles.bubble}>{content}</span>
			</Popup>
		</span>
	);
};

export interface TooltipProps {
	/** The control the hint describes: one focusable element. */
	children: ReactElement<Pick<AriaAttributes, 'aria-describedby'>>;
	/** The hint: a few words. */
	content: ReactNode;
	className?: string;
	/** `false` when the hint only repeats the name of its control: it is not read again. */
	describes?: boolean;
	/** No hint for now: neither the bubble nor the description. */
	disabled?: boolean;
	/** The side the bubble prefers; it takes the opposite one when it does not fit. */
	side?: 'bottom' | 'left' | 'right' | 'top';
}
