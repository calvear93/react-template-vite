import {
	type ChangeEvent,
	type ComponentProps,
	type DragEvent,
	type ReactNode,
	useId,
	useRef,
	useState,
} from 'react';
import { type UiTexts } from '../../i18n/en.ts';
import { useTexts } from '../../i18n/texts.hook.ts';
import { Icon } from '../../icon/Icon.tsx';
import { cx } from '../../internal/cx.ts';
import { defined } from '../../internal/defined.ts';
import { mergeRefs } from '../../internal/merge-refs.ts';
import { useFormReset } from '../../internal/use-form-reset.hook.ts';
import { Button } from '../button/Button.tsx';
import styles from './FileUpload.module.css';

/** Whether a file is one of those an `accept` list names (extensions and MIME types). */
const isAccepted = (file: File, accept: string | undefined) => {
	if (!accept) return true;

	const name = file.name.toLowerCase();

	return accept
		.split(',')
		.map((item) => item.trim().toLowerCase())
		.some((item) => {
			if (item.startsWith('.')) return name.endsWith(item);

			return item.endsWith('/*')
				? file.type.startsWith(item.slice(0, -1))
				: file.type === item;
		});
};

/** What is wrong with the file, in words: the files taken stand for `{accept}`. */
const messageOf = (
	problem: keyof UiTexts['fileMessages'] | undefined,
	texts: UiTexts['fileMessages'],
	accept = '',
) => problem && texts[problem].replace('{accept}', accept);

const stateOf = (isWrong: boolean, isChosen: boolean) => {
	if (isWrong) return 'error';

	return isChosen ? 'chosen' : 'waiting';
};

/**
 * One file asked for: the dashed box says which document (`label`) and what it
 * must be (`requirements`, said before the attempt), its button opens the
 * browser's picker and, once chosen, the box shows the file. Dropping a file on
 * the box is a shortcut; the button does it all.
 *
 * The real `<input type='file'>` stays in the form, hidden: `name` sends the
 * file, `required` and `accept` are checked here (a file that is not accepted is
 * shown with what is wrong, and not sent). `onFileChange` gets the file, or null.
 * What only the server can tell (too heavy, unreadable) comes back in `error`.
 * `className` goes to the box; every other prop and the `ref`, to the input: its
 * `onChange`, and the `change` its form hears, tell of a file chosen, dropped or
 * taken away alike.
 *
 * @example
 * ```tsx
 * <FileUpload
 *   name='license'
 *   label='Medical certificate'
 *   requirements='PDF or image, up to 5 MB'
 *   accept='.pdf,image/*'
 *   required
 * />
 * ```
 *
 * @returns file upload
 */
export const FileUpload = ({
	id,
	accept,
	className,
	disabled,
	error,
	label,
	labels,
	messages,
	onChange,
	onFileChange,
	ref,
	required = false,
	requirements,
	...props
}: FileUploadProps) => {
	const generatedId = useId();
	const inputId = id ?? generatedId;
	const labelId = `${inputId}-label`;
	const requirementsId = `${inputId}-requirements`;
	const errorId = `${inputId}-error`;
	const texts = { ...useTexts().fileUpload, ...defined(labels) };
	const input = useRef<HTMLInputElement>(null);
	const action = useRef<HTMLButtonElement>(null);
	const [file, setFile] = useState<File | null>(null);
	const [problem, setProblem] = useState<keyof UiTexts['fileMessages']>();
	const [isDragging, setIsDragging] = useState(false);
	const problems = { ...useTexts().fileMessages, ...defined(messages) };
	const message = error ?? messageOf(problem, problems, accept);

	const take = (next: File | null) => {
		const isWrong = next !== null && !isAccepted(next, accept);

		// a file that cannot be taken is shown, with what is wrong, but never sent
		if (input.current && (isWrong || next === null))
			input.current.value = '';

		setFile(next);
		setProblem(isWrong ? 'type' : undefined);
		onFileChange?.(isWrong ? null : next);
	};

	// a reset form («Clear») leaves the box waiting for its file again
	useFormReset(input, () => {
		setProblem(undefined);

		if (file) take(null);
	});

	const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
		onChange?.(event);
		take(event.target.files?.[0] ?? null);
	};

	/**
	 * Leaves in the input what its user put without its picker (the file dropped, or
	 * none once it is taken away) and says so as the picker does, with a `change`
	 * that bubbles: the form sends what the input holds, and `onChange` and whoever
	 * listens to the form hear of it. The file is taken where a chosen one is.
	 */
	const put = (files: FileList | null) => {
		const field = input.current;

		if (!field) return;

		if (files) field.files = files;
		else field.value = '';

		field.dispatchEvent(new Event('change', { bubbles: true }));
	};

	const handleDrop = (event: DragEvent<HTMLDivElement>) => {
		const dropped = event.dataTransfer.files;

		event.preventDefault();
		setIsDragging(false);

		if (disabled || dropped.length === 0) return;

		if (dropped.length > 1) {
			setProblem('single');

			return;
		}

		put(dropped);
	};

	return (
		<div
			aria-labelledby={labelId}
			className={cx(styles.root, className)}
			data-disabled={disabled || undefined}
			data-dragging={isDragging || undefined}
			data-state={stateOf(Boolean(message), Boolean(file))}
			onDragLeave={() => setIsDragging(false)}
			onDragOver={(event) => {
				event.preventDefault();
				setIsDragging(!disabled);
			}}
			onDrop={handleDrop}
			role='group'
		>
			<div className={styles.body}>
				<label className={styles.label} htmlFor={inputId} id={labelId}>
					{label}
					{required && (
						<span aria-hidden className={styles.required}>
							*
						</span>
					)}
				</label>
				{requirements && (
					<p className={styles.requirements} id={requirementsId}>
						{requirements}
					</p>
				)}
				{file && (
					<p className={styles.file}>
						<Icon
							name={message ? 'alert-circle' : 'check-circle'}
							size='sm'
						/>
						<span>{file.name}</span>
					</p>
				)}
				{message && (
					<p className={styles.error} id={errorId} role='alert'>
						{message}
					</p>
				)}
			</div>

			<div className={styles.actions}>
				<Button
					aria-describedby={[
						labelId,
						requirements && requirementsId,
						message && errorId,
					]
						.filter(Boolean)
						.join(' ')}
					disabled={disabled}
					icon='upload'
					onClick={() => input.current?.click()}
					ref={action}
					size='sm'
					variant='outlined'
				>
					{file ? texts.change : texts.choose}
				</Button>
				{file && (
					<Button
						disabled={disabled}
						icon='trash'
						iconOnly
						onClick={() => {
							put(null);
							action.current?.focus();
						}}
						size='sm'
						variant='ghost'
					>
						{texts.remove}
					</Button>
				)}
			</div>

			<input
				{...props}
				accept={accept}
				className={styles.input}
				disabled={disabled}
				id={inputId}
				onChange={handleChange}
				onInvalid={(event) => {
					// said in the box, next to its button: the browser's own message
					// would hang from an input nobody sees
					event.preventDefault();
					setProblem('required');
					action.current?.focus();
				}}
				ref={mergeRefs(input, ref)}
				required={required}
				tabIndex={-1}
				type='file'
			/>
		</div>
	);
};

export interface FileUploadProps extends Omit<
	ComponentProps<'input'>,
	'children' | 'multiple' | 'type' | 'value'
> {
	/** The document asked for («Medical certificate»). */
	label: ReactNode;
	/** The files that can be taken, as the `accept` of a file input (`.pdf,image/*`). */
	accept?: string;
	/** What is wrong with the file, when only the server can tell. */
	error?: string;
	labels?: Partial<UiTexts['fileUpload']>;
	/** The texts of a missing or refused file; `{accept}` stands for the files taken. */
	messages?: Partial<UiTexts['fileMessages']>;
	/** What the file must be, said before the attempt (format, size). */
	requirements?: ReactNode;
	/** The file chosen, or null when there is none or it cannot be taken. */
	onFileChange?: (file: File | null) => void;
}
