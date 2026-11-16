import { use } from 'react';
import { UiContextException } from '../../exceptions/ui-context.exception.ts';
import {
	type Confirm,
	type Dialogs,
	DialogsContext,
} from './dialogs.context.ts';

/**
 * The questions an app asks from a handler, without keeping the state of a dialog:
 * each opens the dialog of UiProvider and resolves with the answer. One at a time:
 * a new question cancels the one that was open.
 *
 * - `alert`: something that has to be read (one button).
 * - `confirm`: yes or no; with `requireText`, a text to type first.
 * - `choose`: one of several answers.
 * - `prompt`: a text.
 *
 * @example
 * ```tsx
 * const { alert, choose, prompt } = useDialogs();
 *
 * const leave = async () => {
 *   const answer = await choose({
 *     title: 'There are unsaved changes',
 *     options: [
 *       { value: 'discard', label: 'Discard', tone: 'danger' },
 *       { value: 'save', label: 'Save and leave' },
 *     ],
 *   });
 *
 *   if (answer === 'save') await save();
 *   if (answer) navigate('/orders');
 * };
 *
 * const reject = async () => {
 *   const reason = await prompt({ title: 'Reject the report', label: 'Reason', required: true });
 *
 *   if (reason) await api.reject(id, reason);
 * };
 * ```
 *
 * @throws {UiContextException} outside of UiProvider
 *
 * @returns the four questions
 */
export const useDialogs = (): Dialogs => {
	const dialogs = use(DialogsContext);

	if (!dialogs) throw new UiContextException();

	return dialogs;
};

/**
 * Asks to confirm what cannot be undone, from a handler: it opens the alert
 * dialog of UiProvider and resolves with the answer.
 *
 * @example
 * ```tsx
 * const confirm = useConfirm();
 *
 * const remove = async () => {
 *   const isSure = await confirm({
 *     title: 'Remove access for Jane Cooper?',
 *     message: 'She will no longer see the company records.',
 *     confirmLabel: 'Remove access',
 *     tone: 'danger',
 *   });
 *
 *   if (isSure) await api.removeAccess(id);
 * };
 * ```
 *
 * @throws {UiContextException} outside of UiProvider
 *
 * @returns the function that asks; it resolves `true` only when confirmed
 */
export const useConfirm = (): Confirm => useDialogs().confirm;
