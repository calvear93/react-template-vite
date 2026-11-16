import {
	type KeyboardEvent,
	type ReactNode,
	useId,
	useRef,
	useState,
} from 'react';
import { type UiTexts } from '../../i18n/en.ts';
import { useTexts } from '../../i18n/texts.hook.ts';
import { type IconName } from '../../icon/icon.registry.ts';
import { Icon } from '../../icon/Icon.tsx';
import { cx } from '../../internal/cx.ts';
import { defined } from '../../internal/defined.ts';
import { Modal } from '../../internal/modal/Modal.tsx';
import { moveRovingFocus } from '../../internal/roving-focus.ts';
import { ScrollArea } from '../../internal/scroll-area/ScrollArea.tsx';
import { Button } from '../button/Button.tsx';
import {
	AccessibilitySettings,
	AppearanceSettings,
	SETTINGS_LANGUAGES,
	type SettingsLanguage,
} from './settings.panes.tsx';
import styles from './SettingsDialog.module.css';

const TABS = '[role="tab"]';

/**
 * The window where a person sets how the application looks and behaves: its
 * categories in a side bar, the options of the chosen one beside it, in groups of
 * rows. It brings two categories of its own, «Appearance» (theme, text size) and
 * «Accessibility» (contrast, underlined links, motion); `sections` adds the app's
 * after them, built with SettingsGroup and SettingsRow so they look the same.
 *
 * Every change applies at once and is remembered in the browser: there is nothing
 * to save. The categories are tabs: the arrows move through them and choose;
 * below 640px they become a row above the options.
 *
 * @example
 * ```tsx
 * <SettingsDialog
 *   open={isOpen}
 *   onOpenChange={setIsOpen}
 *   sections={[
 *     {
 *       id: 'notifications',
 *       label: 'Notifications',
 *       icon: 'mail',
 *       description: 'Which notices you get, and where.',
 *       content: (
 *         <SettingsGroup>
 *           <SettingsRow label='Weekly email' hint='A summary every Monday'>
 *             <Switch checked={weekly} onChange={toggleWeekly} />
 *           </SettingsRow>
 *         </SettingsGroup>
 *       ),
 *     },
 *   ]}
 * />
 * ```
 *
 * @returns settings dialog
 */
export const SettingsDialog = ({
	className,
	defaultSection,
	labels,
	languages = SETTINGS_LANGUAGES,
	onOpenChange,
	open,
	sections = [],
}: SettingsDialogProps) => {
	const id = useId();
	const texts = { ...useTexts().settings, ...defined(labels) };
	const tab = useRef<HTMLButtonElement>(null);
	const all: readonly SettingsSection[] = [
		{
			id: 'appearance',
			content: <AppearanceSettings languages={languages} texts={texts} />,
			description: texts.appearanceHint,
			icon: 'sun',
			label: texts.appearance,
		},
		{
			id: 'accessibility',
			content: <AccessibilitySettings texts={texts} />,
			description: texts.accessibilityHint,
			icon: 'contrast',
			label: texts.accessibility,
		},
		...sections,
	];
	const [chosen, setChosen] = useState(defaultSection);
	const current = all.find((section) => section.id === chosen) ?? all[0];

	const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
		const container = event.currentTarget.closest('[role="tablist"]');
		// a column on a wide screen, a row on a narrow one: either pair of arrows moves
		const next =
			moveRovingFocus(event, {
				container,
				orientation: 'vertical',
				selector: TABS,
			}) ??
			moveRovingFocus(event, {
				container,
				orientation: 'horizontal',
				selector: TABS,
			});

		if (next?.dataset.section !== undefined)
			setChosen(next.dataset.section);
	};

	return (
		<Modal
			aria-labelledby={`${id}-title`}
			initialFocus={tab}
			onOpenChange={onOpenChange}
			open={open}
		>
			<div className={cx(styles.window, className)}>
				<div className={styles.sidebar}>
					<h2 className={styles.title} id={`${id}-title`}>
						{texts.title}
					</h2>
					<div
						aria-label={texts.sections}
						aria-orientation='vertical'
						className={styles.tabs}
						role='tablist'
					>
						{all.map((section) => (
							<button
								aria-controls={`${id}-panel`}
								aria-selected={section === current}
								className={styles.tab}
								data-section={section.id}
								id={`${id}-tab-${section.id}`}
								key={section.id}
								onClick={() => setChosen(section.id)}
								onKeyDown={handleKeyDown}
								ref={section === current ? tab : undefined}
								role='tab'
								tabIndex={section === current ? 0 : -1}
								type='button'
							>
								<Icon name={section.icon} size='sm' />
								<span>{section.label}</span>
							</button>
						))}
					</div>
				</div>

				<div className={styles.body}>
					<ScrollArea
						aria-labelledby={`${id}-tab-${current.id}`}
						className={styles.panel}
						id={`${id}-panel`}
						role='tabpanel'
					>
						{/* keyed: another category comes in afresh */}
						<div className={styles.pane} key={current.id}>
							<header className={styles.header}>
								<h3 className={styles.heading}>
									{current.label}
								</h3>
								{current.description && (
									<p className={styles.description}>
										{current.description}
									</p>
								)}
							</header>
							{current.content}
						</div>
					</ScrollArea>

					<div className={styles.footer}>
						<Button onClick={() => onOpenChange(false)}>
							{texts.done}
						</Button>
					</div>
				</div>

				<button
					aria-label={texts.close}
					className={styles.close}
					onClick={() => onOpenChange(false)}
					type='button'
				>
					<Icon name='close' size='sm' />
				</button>
			</div>
		</Modal>
	);
};

/** A category of a SettingsDialog. */
export interface SettingsSection {
	/** Identifies the category (`defaultSection`). */
	id: string;
	/** The options of the category: SettingsGroup and SettingsRow. */
	content: ReactNode;
	icon: IconName;
	/** The name of the category, in the side bar and over its options. */
	label: string;
	/** One line under the name: what the category is about. */
	description?: string;
}

export interface SettingsDialogProps {
	open: boolean;
	className?: string;
	/** The category it opens on: `appearance`, `accessibility` or one of `sections`. */
	defaultSection?: string;
	labels?: Partial<UiTexts['settings']>;
	/**
	 * The languages a person can choose, each named in itself. Default: English and Spanish;
	 * with one alone, or none, the dialog offers no choice of language.
	 */
	languages?: readonly SettingsLanguage[];
	/** The categories of the app, after «Appearance» and «Accessibility». */
	sections?: readonly SettingsSection[];
	onOpenChange: (open: boolean) => void;
}
