import { type ComponentProps, useEffect, useRef, useState } from 'react';
import { cx } from '../cx.ts';
import { mergeRefs } from '../merge-refs.ts';
import styles from './ScrollArea.module.css';

/**
 * An area that scrolls by itself: the wrapper of a table, the body of a dialog.
 * While it has more content than room it is a Tab stop, so a keyboard reaches
 * what does not fit (the arrows scroll it); with a name (`aria-label` or
 * `aria-labelledby`) it is then a region. With everything in sight it is a plain
 * box: no stop to go through for nothing.
 *
 * It only measures and takes the focus: `overflow` is of the class it is given.
 *
 * @returns scroll area
 */
export const ScrollArea = ({ className, ref, ...props }: ScrollAreaProps) => {
	const area = useRef<HTMLDivElement>(null);
	const [isOverflowing, setIsOverflowing] = useState(false);
	const isNamed =
		props['aria-label'] !== undefined ||
		props['aria-labelledby'] !== undefined;

	useEffect(() => {
		const node = area.current;

		if (!node || typeof ResizeObserver !== 'function') return;

		// a pixel of slack: fractional sizes round to either side
		const sizes = new ResizeObserver(() =>
			setIsOverflowing(
				node.scrollWidth > node.clientWidth + 1 ||
					node.scrollHeight > node.clientHeight + 1,
			),
		);

		// the area and what it holds: either one changing size changes the answer
		const watch = () => {
			sizes.disconnect();
			sizes.observe(node);

			for (const child of node.children) sizes.observe(child);
		};

		const content = new MutationObserver(watch);

		watch();
		content.observe(node, { childList: true });

		return () => {
			sizes.disconnect();
			content.disconnect();
		};
	}, []);

	return (
		<div
			className={cx(styles.root, className)}
			ref={mergeRefs(area, ref)}
			role={isOverflowing && isNamed ? 'region' : undefined}
			// a scrolling area takes the focus so a keyboard can scroll it
			tabIndex={isOverflowing ? 0 : undefined}
			{...props}
		/>
	);
};

export type ScrollAreaProps = ComponentProps<'div'>;
