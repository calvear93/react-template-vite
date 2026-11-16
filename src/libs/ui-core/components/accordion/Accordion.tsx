import { type ComponentProps, createContext, type ReactNode, use } from 'react';
import { cx } from '../../internal/cx.ts';
import { useControllableState } from '../../internal/use-controllable-state.hook.ts';
import { Collapsible } from '../collapsible/Collapsible.tsx';
import styles from './Accordion.module.css';

const NONE: readonly string[] = [];

/** What an Accordion tells its items: which are open, and how to open or close one. */
const AccordionContext = createContext<
	| {
			isOpen: (value: string) => boolean;
			toggle: (value: string, open: boolean) => void;
	  }
	| undefined
>(undefined);

/**
 * Sections that open and close in place, one under the other: frequent
 * questions, the parts of a long record. With `type='single'` (the default)
 * opening one closes the others; with `'multiple'` each one goes by itself. Each
 * section is an AccordionItem, a Collapsible on the native `<details>`: its
 * keyboard, its state for assistive technology and find-in-page are the
 * browser's.
 *
 * For one section alone use Collapsible; to switch between views, Tabs.
 *
 * @example
 * ```tsx
 * <Accordion defaultValue={['coverage']}>
 *   <AccordionItem value='coverage' title='What does the insurance cover?'>…</AccordionItem>
 *   <AccordionItem value='report' title='How do I report an accident?'>…</AccordionItem>
 * </Accordion>
 * ```
 *
 * @returns accordion
 */
export const Accordion = ({
	className,
	defaultValue = NONE,
	onValueChange,
	type = 'single',
	value,
	...props
}: AccordionProps) => {
	const [open, setOpen] = useControllableState({
		defaultValue,
		onChange: onValueChange,
		value,
	});

	const toggle = (item: string, isOpen: boolean) => {
		const others = open.filter((other) => other !== item);

		if (isOpen) {
			setOpen(type === 'single' ? [item] : [...others, item]);
		} else {
			setOpen(others);
		}
	};

	return (
		<AccordionContext
			value={{ toggle, isOpen: (item) => open.includes(item) }}
		>
			<div className={cx(styles.root, className)} {...props} />
		</AccordionContext>
	);
};

/**
 * A section of an Accordion: its title, always in sight, and its content.
 *
 * @returns accordion item
 */
export const AccordionItem = ({
	children,
	className,
	summary,
	title,
	value,
}: AccordionItemProps) => {
	const accordion = use(AccordionContext);

	if (!accordion)
		throw new Error('AccordionItem must be used inside an Accordion');

	return (
		<Collapsible
			className={cx(styles.item, className)}
			onOpenChange={(isOpen) => accordion.toggle(value, isOpen)}
			open={accordion.isOpen(value)}
			summary={summary}
			title={title}
		>
			{children}
		</Collapsible>
	);
};

export interface AccordionProps extends Omit<
	ComponentProps<'div'>,
	'defaultValue'
> {
	/** The sections open at first. */
	defaultValue?: readonly string[];
	/** `single`: opening a section closes the others; `multiple`: each goes by itself. */
	type?: 'multiple' | 'single';
	/** The sections that are open. Makes it controlled. */
	value?: readonly string[];
	onValueChange?: (value: readonly string[]) => void;
}

export interface AccordionItemProps {
	/** The content of the section. */
	children: ReactNode;
	/** The title, always in sight: what opens and closes the section. */
	title: ReactNode;
	/** Identifies the section in the `value` of its Accordion. */
	value: string;
	className?: string;
	/** A short text next to the title: what the section holds. */
	summary?: ReactNode;
}
