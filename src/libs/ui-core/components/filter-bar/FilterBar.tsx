import {
	type ChangeEvent,
	type ComponentProps,
	type SubmitEvent,
	useEffect,
	useEffectEvent,
	useRef,
} from 'react';
import { cx } from '../../internal/cx.ts';
import { useDebouncedCallback } from '../../internal/use-debounced-callback.hook.ts';
import styles from './FilterBar.module.css';

const TYPED = new Set([
	'email',
	'number',
	'password',
	'search',
	'tel',
	'text',
	'url',
]);

const isTyped = (target: EventTarget) =>
	target instanceof HTMLTextAreaElement ||
	(target instanceof HTMLInputElement && TYPED.has(target.type));

const isHidden = (target: EventTarget | null) =>
	target instanceof HTMLInputElement && target.type === 'hidden';

/** The values of a form as one text: what tells two sets of filters apart. */
const serialize = (data: FormData) => JSON.stringify([...data.entries()]);

/**
 * The filters of a list, as a form of uncontrolled fields: `onSubmit` gets their
 * values. With `autoSubmit` they apply by themselves: a select, a checkbox or a
 * picked date at once, a text once the typing stops, Enter at once; the field
 * being typed in keeps the focus, and values that did not change since they were
 * last applied are not applied again. A reset button (`type='reset'`) clears and
 * applies.
 *
 * It lays its fields out in a grid; put it in its own Card above the DataTable.
 *
 * @example
 * ```tsx
 * <FilterBar autoSubmit onSubmit={(data) => setFilters(Object.fromEntries(data))}>
 *   <Field label='Search'><Input name='q' type='search' /></Field>
 *   <Field label='Status'><Select name='state' options={states} placeholder='All' /></Field>
 *   <Button type='reset' variant='ghost' size='sm'>Clear</Button>
 * </FilterBar>
 * ```
 *
 * @returns filter form
 */
export const FilterBar = ({
	autoSubmit = false,
	className,
	delay = 400,
	layout = 'grid',
	onSubmit,
	...props
}: FilterBarProps) => {
	const form = useRef<HTMLFormElement>(null);
	const applied = useRef<string>(undefined);

	/** Applies the filters by themselves, unless they are the ones already applied. */
	const apply = () => {
		const node = form.current;

		if (node && serialize(new FormData(node)) !== applied.current)
			node.requestSubmit();
	};

	const typed = useDebouncedCallback(apply, delay);

	// a composite control (DatePicker, Combobox) tells of its new value from its
	// hidden input, with a native event React does not turn into `onChange`
	const applyHidden = useEffectEvent((event: Event) => {
		if (isHidden(event.target)) apply();
	});

	useEffect(() => {
		const node = form.current;

		if (!autoSubmit || !node) return;

		// the list starts with the filters as they are: not something to apply
		applied.current ??= serialize(new FormData(node));

		const handleHiddenChange = (event: Event) => applyHidden(event);

		node.addEventListener('change', handleHiddenChange);

		return () => node.removeEventListener('change', handleHiddenChange);
	}, [autoSubmit]);

	const handleSubmit = (event: SubmitEvent<HTMLFormElement>) => {
		const data = new FormData(event.currentTarget);

		event.preventDefault();
		typed.cancel();
		applied.current = serialize(data);
		onSubmit(data);
	};

	const handleChange = (event: ChangeEvent<HTMLFormElement>) => {
		if (!autoSubmit) return;

		if (isTyped(event.target)) typed.run();
		else apply();
	};

	return (
		<form
			{...props}
			className={cx(styles.root, styles[layout], className)}
			onChange={handleChange}
			onReset={() => {
				// the fields are cleared after this event: apply once they are
				if (autoSubmit) setTimeout(apply);
			}}
			onSubmit={handleSubmit}
			ref={form}
			role='search'
		/>
	);
};

export interface FilterBarProps extends Omit<
	ComponentProps<'form'>,
	'onChange' | 'onReset' | 'onSubmit' | 'role'
> {
	/** The filters apply as they change, without a submit button. */
	autoSubmit?: boolean;
	/** How long the typing must stop before a text applies, in milliseconds. */
	delay?: number;
	/** `grid`: fields in columns of their own width; `row`: one row, the first field takes the rest. */
	layout?: 'grid' | 'row';
	/** Called with the values of the filters. */
	onSubmit: (data: FormData) => void;
}
