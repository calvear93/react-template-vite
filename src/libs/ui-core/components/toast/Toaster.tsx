import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { useTexts } from '../../i18n/texts.hook.ts';
import { Icon } from '../../icon/Icon.tsx';
import { cx } from '../../internal/cx.ts';
import { TONE_ICONS } from '../../internal/tone.ts';
import { usePresence } from '../../internal/use-presence.hook.ts';
import {
	dismissToast,
	getToasts,
	subscribeToasts,
	type ToastItem,
} from './toast.store.ts';
import styles from './Toaster.module.css';

const POSITIONS = {
	'bottom-left': styles.bottomLeft,
	'bottom-right': styles.bottomRight,
	'top-left': styles.topLeft,
	'top-right': styles.topRight,
} as const;

/** A toast on the screen: one of the store, or one it dropped that is on its way out. */
interface Shown {
	isDismissed: boolean;
	item: ToastItem;
}

/**
 * What the toaster shows after the store changed: what it showed, in its place (marked as
 * dismissed when the store dropped it), and the new toasts after them.
 *
 * @param shown - what the toaster shows now
 * @param items - the toasts of the store
 *
 * @returns what the toaster shows next
 */
const follow = (
	shown: readonly Shown[],
	items: readonly ToastItem[],
): Shown[] => {
	const kept = new Set(items.map((item) => item.id));
	const known = new Set(shown.map(({ item }) => item.id));

	return [
		...shown.map(({ item }) => ({ isDismissed: !kept.has(item.id), item })),
		...items
			.filter((item) => !known.has(item.id))
			.map((item) => ({ isDismissed: false, item })),
	];
};

const Toast = ({
	closeLabel,
	isDismissed,
	item,
	onGone,
}: Shown & {
	closeLabel: string;
	onGone: () => void;
}) => {
	const toast = useRef<HTMLDivElement>(null);
	const [isPaused, setIsPaused] = useState(false);
	const { isLeaving, isPresent } = usePresence(!isDismissed, toast);

	// one countdown at a time, and only while neither the pointer nor the focus is on it
	useEffect(() => {
		if (isPaused || isDismissed || item.duration <= 0) return;

		const timer = setTimeout(() => dismissToast(item.id), item.duration);

		return () => clearTimeout(timer);
	}, [isDismissed, isPaused, item.duration, item.id]);

	// its way out is over: the toaster forgets it
	useEffect(() => {
		if (!isPresent) onGone();
	}, [isPresent, onGone]);

	if (!isPresent) return null;

	return (
		<div
			className={cx(styles.toast, styles[item.tone])}
			data-leaving={isLeaving || undefined}
			onBlur={() => setIsPaused(false)}
			onFocus={() => setIsPaused(true)}
			onMouseEnter={() => setIsPaused(true)}
			onMouseLeave={() => setIsPaused(false)}
			ref={toast}
			role={item.tone === 'danger' ? 'alert' : 'status'}
		>
			<Icon
				className={styles.icon}
				name={TONE_ICONS[item.tone]}
				size='sm'
			/>

			<div className={styles.body}>
				<p className={styles.message}>{item.message}</p>
				{item.description && (
					<p className={styles.description}>{item.description}</p>
				)}
			</div>

			<button
				aria-label={closeLabel}
				className={styles.close}
				onClick={() => dismissToast(item.id)}
				type='button'
			>
				<Icon name='close' size='sm' />
			</button>
		</div>
	);
};

/**
 * The region where the toasts of `toast()` appear. UiProvider mounts one; an app
 * without UiProvider places it once, near its root. A toast that is dismissed stays
 * for the moment its way out takes.
 *
 * @returns toaster
 */
export const Toaster = ({
	closeLabel,
	label,
	position = 'top-right',
}: ToasterProps) => {
	const texts = useTexts().toaster;
	const items = useSyncExternalStore(subscribeToasts, getToasts);
	const [followed, setFollowed] = useState(items);
	const [shown, setShown] = useState(() => follow([], items));

	if (items !== followed) {
		setFollowed(items);
		setShown(follow(shown, items));
	}

	return (
		<div
			aria-label={label ?? texts.label}
			className={cx(styles.region, POSITIONS[position])}
			role='region'
		>
			{shown.map(({ isDismissed, item }) => (
				<Toast
					closeLabel={closeLabel ?? texts.close}
					isDismissed={isDismissed}
					item={item}
					key={item.id}
					onGone={() =>
						setShown((current) =>
							current.filter((other) => other.item !== item),
						)
					}
				/>
			))}
		</div>
	);
};

export interface ToasterProps {
	/** The name of the close button of each toast. */
	closeLabel?: string;
	/** The name of the region, for assistive technology. */
	label?: string;
	position?: keyof typeof POSITIONS;
}
