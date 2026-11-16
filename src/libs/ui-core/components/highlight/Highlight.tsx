import { highlightParts } from '../../internal/highlight-parts.ts';
import styles from './Highlight.module.css';

/**
 * A text with the words of a search marked in it (`<mark>`), accents and case
 * aside: the name of each result in a Combobox or a filtered list.
 *
 * @example
 * ```tsx
 * <Highlight text={person.name} query={query} />
 * ```
 *
 * @returns the text, its matches marked
 */
export const Highlight = ({ query, text }: HighlightProps) => (
	<>
		{highlightParts(text, query).map((part) =>
			part.isHit ? (
				<mark className={styles.mark} key={part.start}>
					{part.text}
				</mark>
			) : (
				part.text
			),
		)}
	</>
);

export interface HighlightProps {
	/** What was searched: each of its words is marked where it appears. */
	query: string;
	text: string;
}
