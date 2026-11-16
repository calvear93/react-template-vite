import {
	type ComponentProps,
	type KeyboardEvent,
	type ReactNode,
	use,
	useId,
} from 'react';
import { UiContextException } from '../../exceptions/ui-context.exception.ts';
import { useLocale } from '../../format/locale.hook.ts';
import { formatNumber } from '../../format/number.ts';
import { useTexts } from '../../i18n/texts.hook.ts';
import { Icon } from '../../icon/Icon.tsx';
import { Anchor } from '../../internal/anchor/Anchor.tsx';
import { cx } from '../../internal/cx.ts';
import { moveRovingFocus } from '../../internal/roving-focus.ts';
import { useControllableState } from '../../internal/use-controllable-state.hook.ts';
import { VisuallyHidden } from '../visually-hidden/VisuallyHidden.tsx';
import { TabsContext } from './tabs.context.ts';
import styles from './Tabs.module.css';

const useTabs = () => {
	const tabs = use(TabsContext);

	if (!tabs) throw new UiContextException('Tabs');

	return tabs;
};

/**
 * Views of one thing, one at a time. The tab list is one Tab stop: the arrows move
 * between tabs (Home and End jump) and a tab is chosen as it takes the focus; a
 * tab with `href` is a link the route chooses, and waits for Enter.
 *
 * Controlled with `value` (e.g. from the route), or uncontrolled from
 * `defaultValue`.
 *
 * @example
 * ```tsx
 * <Tabs defaultValue='data'>
 *   <TabsList label='Worker record'>
 *     <Tab value='data'>Details</Tab>
 *     <Tab value='reports' count={3} attention>Reports</Tab>
 *   </TabsList>
 *   <TabsPanel value='data'>…</TabsPanel>
 *   <TabsPanel value='reports'>…</TabsPanel>
 * </Tabs>
 * ```
 *
 * @returns tabs
 */
export const Tabs = ({
	className,
	defaultValue,
	onValueChange,
	orientation = 'horizontal',
	value,
	variant = 'underline',
	...props
}: TabsProps) => {
	const baseId = useId();
	const [current, select] = useControllableState({
		defaultValue,
		onChange: onValueChange as (value: string | undefined) => void,
		value,
	});

	return (
		<TabsContext value={{ baseId, orientation, select, value: current }}>
			<div
				className={cx(
					styles.root,
					styles[orientation],
					styles[variant],
					className,
				)}
				{...props}
			/>
		</TabsContext>
	);
};

export interface TabsProps extends Omit<ComponentProps<'div'>, 'defaultValue'> {
	/** The tab selected at first, uncontrolled. */
	defaultValue?: string;
	orientation?: 'horizontal' | 'vertical';
	/** The tab selected, controlled. */
	value?: string;
	/** `box`: a compact switch of views inside a surface. */
	variant?: 'box' | 'underline';
	onValueChange?: (value: string) => void;
}

/**
 * The list of the tabs of a Tabs, named by `label`.
 *
 * @returns tab list
 */
export const TabsList = ({ className, label, ...props }: TabsListProps) => {
	const { orientation } = useTabs();

	return (
		<div
			aria-label={label}
			aria-orientation={orientation}
			className={cx(styles.list, className)}
			role='tablist'
			{...props}
		/>
	);
};

export interface TabsListProps extends ComponentProps<'div'> {
	/** What the tabs are views of. */
	label: string;
}

/**
 * A tab of a TabsList: it selects the TabsPanel of the same `value`.
 *
 * @returns tab
 */
export const Tab = ({
	attention = false,
	attentionLabel,
	children,
	className,
	count,
	disabled = false,
	href,
	value,
}: TabProps) => {
	const { locale } = useLocale();
	const texts = useTexts().tabs;
	const tabs = useTabs();
	const isSelected = tabs.value === value;
	const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
		const next = moveRovingFocus(event, {
			container: event.currentTarget.closest('[role="tablist"]'),
			orientation: tabs.orientation,
			selector: '[role="tab"]',
		});

		// a button follows the focus; a link waits for Enter: it navigates
		if (next?.dataset.value !== undefined && next.tagName === 'BUTTON')
			tabs.select(next.dataset.value);
	};
	const shared = {
		id: `${tabs.baseId}-tab-${value}`,
		'aria-controls': `${tabs.baseId}-panel-${value}`,
		'aria-selected': isSelected,
		className: cx(styles.tab, className),
		'data-value': value,
		onKeyDown: handleKeyDown,
		role: 'tab',
		// one Tab stop: the selected tab, or every tab while none is
		tabIndex: isSelected || tabs.value === undefined ? 0 : -1,
	} as const;
	const content = (
		<>
			{children}
			{count !== undefined && (
				<span
					className={cx(styles.count, attention && styles.attention)}
				>
					{attention && <Icon name='alert-circle' size='xs' />}
					{formatNumber(count, locale)}
					{attention && (
						<VisuallyHidden>
							{' '}
							({attentionLabel ?? texts.attention})
						</VisuallyHidden>
					)}
				</span>
			)}
		</>
	);

	if (href !== undefined && !disabled)
		return (
			<Anchor {...shared} href={href}>
				{content}
			</Anchor>
		);

	return (
		<button
			{...shared}
			disabled={disabled}
			onClick={() => tabs.select(value)}
			type='button'
		>
			{content}
		</button>
	);
};

export interface TabProps {
	children: ReactNode;
	/** Ties the tab to the panel of the same value. */
	value: string;
	/** Draws the count as something that needs attention. */
	attention?: boolean;
	/** What an attention count reads as, for assistive technology. */
	attentionLabel?: string;
	className?: string;
	/** A number next to the label: how many items the view has. */
	count?: number;
	disabled?: boolean;
	/** Makes the tab a link: the route selects it (control `value` from the route). */
	href?: string;
}

/**
 * The content of the tab of the same `value`: rendered only while it is selected.
 *
 * @returns tab panel, or nothing
 */
export const TabsPanel = ({ className, value, ...props }: TabsPanelProps) => {
	const tabs = useTabs();

	if (tabs.value !== value) return null;

	return (
		<div
			aria-labelledby={`${tabs.baseId}-tab-${value}`}
			className={cx(styles.panel, className)}
			id={`${tabs.baseId}-panel-${value}`}
			role='tabpanel'
			tabIndex={0}
			{...props}
		/>
	);
};

export interface TabsPanelProps extends ComponentProps<'div'> {
	/** The value of the tab that shows this panel. */
	value: string;
}
