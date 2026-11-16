import {
	type ComponentProps,
	type ReactNode,
	useLayoutEffect,
	useRef,
} from 'react';
import { flushSync } from 'react-dom';
import { Icon } from '../../icon/Icon.tsx';
import { cx } from '../../internal/cx.ts';
import { useControllableState } from '../../internal/use-controllable-state.hook.ts';
import styles from './Collapsible.module.css';

/**
 * Content that opens and closes in place, for details few need. On the native
 * `<details>`: its keyboard, its state for assistive technology and find-in-page
 * come with it. Controlled with `open`, or uncontrolled from `defaultOpen`.
 *
 * @example
 * ```tsx
 * <Collapsible title='Background of the accident' summary='3 documents'>
 *   …
 * </Collapsible>
 * ```
 *
 * @returns collapsible
 */
export const Collapsible = ({
	children,
	className,
	defaultOpen = false,
	onOpenChange,
	open,
	summary,
	title,
	...props
}: CollapsibleProps) => {
	const [isOpen, setIsOpen] = useControllableState({
		defaultValue: defaultOpen,
		onChange: onOpenChange,
		value: open,
	});

	// what is on screen now, for the handler that asks to change it
	const shown = useRef(isOpen);

	useLayoutEffect(() => {
		shown.current = isOpen;
	});

	return (
		<details
			className={cx(styles.root, className)}
			onToggle={(event) => {
				const node = event.currentTarget;

				if (node.open === isOpen) return;

				// rendered at once, to see what came of it: a parent that keeps the state
				// as it was is obeyed, and the browser's own toggle is taken back
				flushSync(() => setIsOpen(node.open));

				if (node.open !== shown.current) node.open = shown.current;
			}}
			open={isOpen}
			{...props}
		>
			<summary className={styles.trigger}>
				<span>{title}</span>
				{summary && <span className={styles.summary}>{summary}</span>}
				<Icon
					className={styles.indicator}
					name='chevron-down'
					size='sm'
				/>
			</summary>

			<div className={styles.content}>{children}</div>
		</details>
	);
};

export interface CollapsibleProps extends Omit<
	ComponentProps<'details'>,
	'onToggle' | 'title'
> {
	/** The text of the trigger. */
	title: ReactNode;
	/** Open at first, uncontrolled. */
	defaultOpen?: boolean;
	/** Open or closed, controlled. */
	open?: boolean;
	/** A short text next to the title: what is inside. */
	summary?: ReactNode;
	onOpenChange?: (open: boolean) => void;
}
