import { type KeyboardEvent, useId, useRef, useState } from 'react';
import { useTexts } from '../../i18n/texts.hook.ts';
import { Icon } from '../../icon/Icon.tsx';
import { cx } from '../../internal/cx.ts';
import { defined } from '../../internal/defined.ts';
import { Modal } from '../../internal/modal/Modal.tsx';
import { moveRovingFocus } from '../../internal/roving-focus.ts';
import { ScrollArea } from '../../internal/scroll-area/ScrollArea.tsx';
import { Button } from '../button/Button.tsx';
import { SETTINGS_LANGUAGES } from './settings.languages.ts';
import {
	AccessibilitySettings,
	AppearanceSettings,
} from './settings.panes.tsx';
import {
	type SettingsDialogProps,
	type SettingsSection,
} from './SettingsDialog.tsx';
import styles from './SettingsDialog.module.css';

const TABS = '[role="tab"]';

/**
 * The window of a SettingsDialog, whole: its modal, its categories and their
 * options. SettingsDialog loads it on demand and mounts it when it first opens;
 * nothing of the first screen imports it. The modal comes with it: one that was
 * there before its content could not put the focus on the category.
 *
 * @returns the window of the settings
 */
export const SettingsWindow = ({
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
