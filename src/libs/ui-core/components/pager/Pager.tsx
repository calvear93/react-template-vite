import { type ComponentProps, type SubmitEvent, useId } from 'react';
import { useLocale } from '../../format/locale.hook.ts';
import { formatNumber } from '../../format/number.ts';
import { type UiTexts } from '../../i18n/en.ts';
import { useTexts } from '../../i18n/texts.hook.ts';
import { cx } from '../../internal/cx.ts';
import { defined } from '../../internal/defined.ts';
import { plural } from '../../internal/plural.ts';
import { Button } from '../button/Button.tsx';
import { Input } from '../input/Input.tsx';
import { Pagination, type PaginationProps } from '../pagination/Pagination.tsx';
import { Select } from '../select/Select.tsx';
import styles from './Pager.module.css';

type PagerLabels = UiTexts['pager'];

const SizeSelect = ({
	onSizeChange,
	size,
	sizes,
	texts,
}: {
	size: number | undefined;
	sizes: readonly number[];
	texts: PagerLabels;
	onSizeChange: (size: number) => void;
}) => {
	const id = useId();
	const offered = [...new Set([...sizes, size ?? 0])]
		.filter((value) => value > 0)
		.toSorted((a, b) => a - b);

	return (
		<span className={styles.option}>
			<label htmlFor={id}>{texts.sizes}</label>
			<Select
				className={styles.size}
				id={id}
				onChange={(event) => onSizeChange(Number(event.target.value))}
				options={offered.map((value) => ({
					label: String(value),
					value,
				}))}
				size='sm'
				value={size}
			/>
		</span>
	);
};

const JumpForm = ({
	onPageChange,
	page,
	pages,
	texts,
}: {
	page: number;
	pages: number;
	texts: PagerLabels;
	onPageChange: (page: number) => void;
}) => {
	const id = useId();
	const { locale } = useLocale();

	const handleSubmit = (event: SubmitEvent<HTMLFormElement>) => {
		event.preventDefault();

		const field = event.currentTarget.elements.namedItem('page');

		if (!(field instanceof HTMLInputElement)) return;

		const target = Number(field.value);

		if (!Number.isInteger(target) || target < 1 || target > pages) {
			field.setCustomValidity(
				texts.outOfRange(formatNumber(pages, locale)),
			);
			field.reportValidity();

			return;
		}

		field.value = '';
		onPageChange(target);
	};

	return (
		<form className={styles.option} noValidate onSubmit={handleSubmit}>
			<label htmlFor={id}>{texts.jump}</label>
			<Input
				className={styles.jump}
				id={id}
				inputMode='numeric'
				max={pages}
				min={1}
				name='page'
				onChange={(event) => event.target.setCustomValidity('')}
				placeholder={String(page)}
				size='sm'
				type='number'
			/>
			<Button size='sm' type='submit' variant='outlined'>
				{texts.go}
			</Button>
		</form>
	);
};

/**
 * The foot of a paged list: what is shown («Showing 26–50 of 3,021 cases») and
 * the page controls. Each extra is optional: `sizes` offers the rows per page,
 * `jump` a field to go to a page, `edges` the first and the last page. With one
 * page there are no page controls: the summary stays.
 *
 * @example
 * ```tsx
 * <Pager page={page} pages={121} total={3021} size={25} noun={['case', 'cases']}
 *   sizes={[25, 50, 100]} onPageChange={setPage} onSizeChange={setSize} />
 * ```
 *
 * @returns pager
 */
export const Pager = ({
	className,
	edges,
	href,
	jump = false,
	labels,
	noun: givenNoun,
	onPageChange,
	onSizeChange,
	page,
	pages,
	size,
	sizes,
	total,
	...props
}: PagerProps) => {
	const { locale } = useLocale();
	const texts = { ...useTexts().pager, ...defined(labels) };
	const noun = givenNoun ?? texts.noun;
	const figure = (value: number) => formatNumber(value, locale);
	const count = Math.max(Math.trunc(pages) || 1, 1);
	const counted = `${figure(total)} ${plural(total, noun[0], noun[1], locale)}`;
	const summary = size
		? texts.range(
				figure((page - 1) * size + 1),
				figure(Math.min(page * size, total)),
				counted,
			)
		: `${counted} · ${texts.pageOf(figure(page), figure(count))}`;

	return (
		<div className={cx(styles.root, className)} {...props}>
			<div className={styles.group}>
				<span className={styles.summary} role='status'>
					{total > 0 ? summary : `0 ${noun[1]}`}
				</span>

				{sizes && sizes.length > 0 && onSizeChange && (
					<SizeSelect
						onSizeChange={onSizeChange}
						size={size}
						sizes={sizes}
						texts={texts}
					/>
				)}
			</div>

			{count > 1 && (
				<div className={cx(styles.group, styles.end)}>
					{jump && count > 2 && onPageChange && (
						<JumpForm
							onPageChange={onPageChange}
							page={page}
							pages={count}
							texts={texts}
						/>
					)}

					<Pagination
						edges={edges}
						href={href}
						onPageChange={onPageChange}
						page={page}
						pages={count}
					/>
				</div>
			)}
		</div>
	);
};

export interface PagerProps
	extends
		Omit<ComponentProps<'div'>, 'children'>,
		Pick<PaginationProps, 'edges' | 'href' | 'onPageChange'> {
	/** The current page, from 1. */
	page: number;
	/** How many pages there are. */
	pages: number;
	/** How many items there are in all. */
	total: number;
	/** A field to go to a page (needs `onPageChange`; shown from 3 pages). */
	jump?: boolean;
	labels?: Partial<PagerLabels>;
	/** What is counted: [singular, plural]. Default: «result», «results». */
	noun?: readonly [singular: string, plural: string];
	/** The rows per page: with it the summary says the range shown. */
	size?: number;
	/** The rows per page offered (needs `onSizeChange`). */
	sizes?: readonly number[];
	onSizeChange?: (size: number) => void;
}
