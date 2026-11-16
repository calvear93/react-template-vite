import { useLocale } from '../../format/locale.hook.ts';
import { shortName } from '../../format/name.ts';
import { Avatar } from '../avatar/Avatar.tsx';
import { Combobox, type ComboboxProps } from '../combobox/Combobox.tsx';
import { Highlight } from '../highlight/Highlight.tsx';
import styles from './PeoplePicker.module.css';

/** A person a PeoplePicker can find. Any other key travels with it to `onValueChange`. */
export interface Person {
	name: string;
	/** What tells this person from another of the same name, shown at the end (an id, a role). */
	detail?: string;
	email?: string;
}

/** What tells a person from another, and what the form sends: `getKey` gives another. */
const keyOfPerson = (person: Person) => person.email ?? person.name;

/**
 * A search box that finds a person: a Combobox whose results show the initials,
 * the name (what was typed stands out, accents aside) over the email, and a
 * `detail` at the end. It searches from three letters; everything else — the
 * keyboard, the value it keeps, `clearOnPick` to add people to a list — is the
 * Combobox's.
 *
 * @example
 * ```tsx
 * <Field label='Person' hint='Type at least 3 letters of the name or the email' required>
 *   <PeoplePicker name='person' search={(text, signal) => api.people(text, { signal })} />
 * </Field>
 * ```
 *
 * @returns people picker
 */
export const PeoplePicker = <P extends Person = Person>({
	delay = 300,
	getKey = keyOfPerson,
	minLength = 3,
	...props
}: PeoplePickerProps<P>) => {
	const { locale } = useLocale();

	return (
		<Combobox
			{...props}
			delay={delay}
			getKey={getKey}
			getLabel={(person) => person.name}
			minLength={minLength}
			renderOption={(person, query) => (
				<span className={styles.option}>
					<Avatar
						className={styles.avatar}
						name={shortName(person.name, {}, locale)}
						size='sm'
					/>
					<span className={styles.name}>
						<Highlight query={query} text={person.name} />
					</span>
					{person.email && (
						<span className={styles.detail}>{person.email}</span>
					)}
					{person.detail && (
						<span className={styles.extra}>{person.detail}</span>
					)}
				</span>
			)}
		/>
	);
};

export type PeoplePickerProps<P extends Person = Person> = Omit<
	ComboboxProps<P>,
	'getLabel' | 'renderOption'
>;
