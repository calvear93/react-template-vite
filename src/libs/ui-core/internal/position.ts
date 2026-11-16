/** A box on the viewport: what getBoundingClientRect answers. */
export interface Box {
	height: number;
	left: number;
	top: number;
	width: number;
}

export interface Size {
	height: number;
	width: number;
}

export interface PositionOptions {
	/** The edge of the anchor the popup lines up with, or its center. */
	align?: 'center' | 'end' | 'start';
	/** The space between the anchor and the popup. */
	gap?: number;
	/** The space kept between the popup and the edges of the viewport. */
	margin?: number;
	/** The popup takes the width of its anchor. */
	matchWidth?: boolean;
	/** The popup never gets taller than this. */
	maxHeight?: number;
	/** The popup keeps at least this height, even when it does not fit. */
	minHeight?: number;
	/** The side of the anchor the popup prefers; it takes the opposite one when it fits better. */
	side?: Side;
}

/** A side of the anchor. */
export type Side = 'bottom' | 'left' | 'right' | 'top';

export interface Position {
	left: number;
	/** The height left for the popup: it scrolls inside when it needs more. */
	maxHeight: number;
	side: Side;
	top: number;
	/** The width of the anchor, when the popup matches it. */
	width?: number;
}

type Settings = Required<PositionOptions>;

/** The options with what each one is when nobody says (an `undefined` counts as nobody). */
const settle = ({
	align = 'start',
	gap = 4,
	margin = 8,
	matchWidth = false,
	maxHeight = Number.POSITIVE_INFINITY,
	minHeight = 120,
	side = 'bottom',
}: PositionOptions): Settings => ({
	align,
	gap,
	margin,
	matchWidth,
	maxHeight,
	minHeight,
	side,
});

const fit = (value: number, size: number, limit: number, margin: number) =>
	Math.max(margin, Math.min(value, limit - size - margin));

/** The preferred side, or the opposite one when the popup does not fit and there is more room. */
const pickSide = <T extends Side>(
	rooms: Record<T, number>,
	preferred: T,
	opposite: T,
	needed: number,
): T =>
	rooms[preferred] < needed && rooms[opposite] > rooms[preferred]
		? opposite
		: preferred;

/** Beside the anchor: the popup keeps its size and is centered on the other axis. */
const placeBeside = (
	anchor: Box,
	popup: Size,
	viewport: Size,
	preferred: 'left' | 'right',
	{ gap, margin, maxHeight }: Settings,
): Position => {
	const side = pickSide(
		{
			left: anchor.left - gap - margin,
			right: viewport.width - (anchor.left + anchor.width) - gap - margin,
		},
		preferred,
		preferred === 'left' ? 'right' : 'left',
		popup.width,
	);
	const height = Math.min(popup.height, maxHeight);

	return {
		maxHeight: Math.max(height, viewport.height - 2 * margin),
		side,
		left: fit(
			side === 'left'
				? anchor.left - gap - popup.width
				: anchor.left + anchor.width + gap,
			popup.width,
			viewport.width,
			margin,
		),
		top: fit(
			anchor.top + anchor.height / 2 - height / 2,
			height,
			viewport.height,
			margin,
		),
	};
};

/** Above or below the anchor: lined up with one of its edges or its center. */
const placeAcross = (
	anchor: Box,
	popup: Size,
	viewport: Size,
	preferred: 'bottom' | 'top',
	{ align, gap, margin, maxHeight, minHeight }: Settings,
): Position => {
	const rooms = {
		bottom: viewport.height - (anchor.top + anchor.height) - gap - margin,
		top: anchor.top - gap - margin,
	};
	const side = pickSide(
		rooms,
		preferred,
		preferred === 'top' ? 'bottom' : 'top',
		Math.min(popup.height, maxHeight),
	);
	const room = Math.max(minHeight, Math.min(maxHeight, rooms[side]));
	const height = Math.min(popup.height, room);
	const starts = {
		center: anchor.left + anchor.width / 2 - popup.width / 2,
		end: anchor.left + anchor.width - popup.width,
		start: anchor.left,
	};

	return {
		left: fit(starts[align], popup.width, viewport.width, margin),
		maxHeight: room,
		side,
		top:
			side === 'top'
				? Math.max(margin, anchor.top - gap - height)
				: anchor.top + anchor.height + gap,
	};
};

/**
 * Where a popup goes next to its anchor: on the side it prefers (below, unless told
 * otherwise), or on the opposite one when it does not fit there and there is more
 * room across; lined up with the start, the center or the end of the anchor, and
 * kept inside the viewport.
 *
 * @example
 * ```ts
 * computePosition(
 *   anchor.getBoundingClientRect(),
 *   { width: popup.offsetWidth, height: popup.scrollHeight },
 *   { width: innerWidth, height: innerHeight },
 *   { align: 'end' },
 * );
 * ```
 *
 * @param anchor - the box of the element the popup hangs from
 * @param popup - the natural size of the popup
 * @param viewport - the size of the viewport
 * @param options - alignment, gaps and limits
 *
 * @returns the fixed position of the popup, the side it took and the height it may use
 */
export const computePosition = (
	anchor: Box,
	popup: Size,
	viewport: Size,
	options: PositionOptions = {},
): Position => {
	const settings = settle(options);
	const { side } = settings;
	const size = settings.matchWidth
		? { height: popup.height, width: anchor.width }
		: popup;

	if (side === 'left' || side === 'right')
		return placeBeside(anchor, size, viewport, side, settings);

	return {
		...placeAcross(anchor, size, viewport, side, settings),
		...(settings.matchWidth && { width: size.width }),
	};
};
