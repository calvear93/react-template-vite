import {
	AlertDialog,
	Button,
	Checkbox,
	Dialog,
	Drawer,
	Field,
	formatDate,
	FormDialog,
	Input,
	MultiSelect,
	Select,
	toast,
	useConfirm,
	useDialogs,
	useLocale,
} from '#libs/ui-core';
import { useState } from 'react';
import { DEMO_STATES, REPORT_STATES } from '../catalog.fixture.ts';
import { Example } from '../components/example/Example.tsx';
import styles from './overlays.section.module.css';

const STATES = DEMO_STATES.map((value) => ({
	label: REPORT_STATES[value].label,
	value,
}));

const NOT_ASKED = 'Not asked yet';

/**
 * The questions an app asks with one call each: a notice, a choice, a text, and a
 * confirmation that asks for a text to be typed.
 *
 * @returns example of the generic dialogs
 */
const DialogsExample = () => {
	const { alert, choose, confirm, prompt } = useDialogs();
	const [answer, setAnswer] = useState(NOT_ASKED);

	return (
		<Example
			note='One call per question, from a handler: alert (something to read), choose (one of several answers), prompt (a text) and confirm with requireText (something must be typed before what cannot be undone). Each one returns a promise with the answer.'
			title='useDialogs: notice, choices and text'
		>
			<Button
				onClick={async () => {
					await alert({
						title: 'Your session is about to expire',
						tone: 'warning',
						message:
							'Save your work: in five minutes you will have to sign in again.',
					});
					setAnswer('Notice read');
				}}
				variant='outlined'
			>
				Show a notice
			</Button>
			<Button
				onClick={async () => {
					const chosen = await choose({
						message: 'If you leave now, they are lost.',
						title: 'There are unsaved changes',
						options: [
							{
								label: 'Discard',
								tone: 'danger',
								value: 'Discarded the changes',
							},
							{
								label: 'Save and leave',
								value: 'Saved and left',
							},
						],
					});

					setAnswer(chosen ?? 'Kept editing');
				}}
				variant='outlined'
			>
				Choose an option
			</Button>
			<Button
				onClick={async () => {
					const format = await choose({
						title: 'Export the reports',
						tone: 'info',
						options: [
							{
								description: 'One sheet per month',
								icon: 'document',
								label: 'Excel',
								value: 'Exported to Excel',
							},
							{
								description: 'Ready to print',
								icon: 'printer',
								label: 'PDF',
								value: 'Exported to PDF',
							},
						],
					});

					setAnswer(format ?? 'Did not export');
				}}
				variant='outlined'
			>
				Choose from a list
			</Button>
			<Button
				onClick={async () => {
					const reason = await prompt({
						confirmLabel: 'Reject',
						label: 'Reason',
						message: 'The employee will see this reason.',
						multiline: true,
						required: true,
						title: 'Reject the report',
					});

					setAnswer(reason ? `Reason: ${reason}` : 'Did not reject');
				}}
				variant='outlined'
			>
				Ask for a text
			</Button>
			<Button
				onClick={async () => {
					const isSure = await confirm({
						confirmLabel: 'Delete',
						requireText: 'ACME-0042',
						title: 'Delete the company',
						tone: 'danger',
						message:
							'Its branches and its reports are deleted. This cannot be undone.',
					});

					setAnswer(isSure ? 'Company deleted' : 'Did not delete');
				}}
				variant='destructive'
			>
				Delete the company
			</Button>
			<output>{answer}</output>
		</Example>
	);
};

const wait = (ms: number) =>
	new Promise((resolve) => {
		setTimeout(resolve, ms);
	});

/**
 * Modals and toasts of the kit: Dialog, FormDialog, AlertDialog (and
 * `useConfirm`), Drawer and `toast`.
 *
 * @returns section
 */
export const OverlaysSection = () => {
	const confirm = useConfirm();
	const { locale } = useLocale();
	const [open, setOpen] = useState<
		'alert' | 'dialog' | 'drawer' | 'form' | 'left'
	>();
	const [answer, setAnswer] = useState(NOT_ASKED);
	const close = () => setOpen(undefined);

	return (
		<>
			<Example
				note='A short task or a decision over the page. The focus stays inside and goes back to what opened it; Escape, the veil and its button ask to close.'
				title='Dialog'
			>
				<Button onClick={() => setOpen('dialog')} variant='outlined'>
					View the details of the report
				</Button>
				<Dialog
					description={`Issued on ${formatDate('2026-11-02', locale)} at 09:14`}
					footer={<Button onClick={close}>Got it</Button>}
					onOpenChange={close}
					open={open === 'dialog'}
					title='Report INC-2026-001482'
				>
					<p>
						The report was received and is under medical evaluation.
						We will let you know by email when there is a decision.
					</p>
				</Dialog>
			</Example>

			<Example
				note='A form that saves: while it saves it cannot be closed; if it fails, the error shows inside and nothing typed is lost.'
				title='FormDialog'
			>
				<Button icon='plus' onClick={() => setOpen('form')}>
					Add employee
				</Button>
				<FormDialog
					description='Type “error” as the name to see a save that fails.'
					errorTitle='The employee was not added'
					onOpenChange={close}
					onSubmit={async (data) => {
						await wait(900);

						if (data.get('name') === 'error')
							throw new Error(
								'That email is already registered in another company.',
							);

						toast('Employee added', {
							description: String(data.get('name')),
							tone: 'success',
						});
					}}
					open={open === 'form'}
					submitLabel='Add employee'
					title='Add employee'
				>
					<Field label='Name' required>
						<Input name='name' required />
					</Field>
					<Field label='Email'>
						<Input name='email' type='email' />
					</Field>
					<Field label='Role'>
						<Select
							name='role'
							options={[
								{ label: 'Viewer', value: 'reader' },
								{ label: 'Editor', value: 'editor' },
							]}
						/>
					</Field>
				</FormDialog>
			</Example>

			<Example
				note='Only for what cannot be undone. The focus starts on Cancel, the veil does not close it and the buttons say the effect. From a handler: useConfirm().'
				title='AlertDialog and useConfirm'
			>
				<Button onClick={() => setOpen('alert')} variant='destructive'>
					Remove access
				</Button>
				<AlertDialog
					confirmLabel='Remove access'
					onConfirm={() =>
						toast('Access removed', { tone: 'success' })
					}
					onOpenChange={close}
					open={open === 'alert'}
					title='Remove the access of Anna Schmidt?'
					tone='danger'
				>
					She will no longer see the records of the company. You can
					give her access again later.
				</AlertDialog>

				<Button
					onClick={async () => {
						const isSure = await confirm({
							cancelLabel: 'Keep editing',
							confirmLabel: 'Leave without saving',
							message: 'The changes of this form will be lost.',
							title: 'Leave without saving?',
						});

						setAnswer(
							isSure ? 'Left without saving' : 'Kept editing',
						);
					}}
					variant='outlined'
				>
					Ask with useConfirm
				</Button>
				<output>{answer}</output>
			</Example>

			<DialogsExample />

			<Example
				note='A secondary task that leaves the page in sight: a fixed header and footer, a body that scrolls.'
				title='Drawer'
			>
				<Button
					icon='filter'
					onClick={() => setOpen('drawer')}
					variant='outlined'
				>
					Filters
				</Button>
				<Button onClick={() => setOpen('left')} variant='ghost'>
					Panel on the left
				</Button>
				<Drawer
					footer={
						<>
							<Button onClick={close} variant='ghost'>
								Clear
							</Button>
							<Button onClick={close}>Apply filters</Button>
						</>
					}
					onOpenChange={close}
					open={open === 'drawer'}
					title='Filters'
				>
					<div className={styles.stack}>
						<Field label='Search'>
							<Input placeholder='Reference or employee' />
						</Field>
						<Field label='Statuses'>
							<MultiSelect
								options={STATES}
								placeholder='All the statuses'
							/>
						</Field>
						<Checkbox>Only open reports</Checkbox>
						<Checkbox>With pending documents</Checkbox>
					</div>
				</Drawer>
				<Drawer
					onOpenChange={close}
					open={open === 'left'}
					side='left'
					size='sm'
					title='Menu'
				>
					<p>A narrow panel from the left edge.</p>
				</Drawer>
			</Example>

			<Example
				note='A brief confirmation that goes away by itself. The count stops while the pointer or the focus is on it. What must be read is an Alert.'
				title='toast'
			>
				<Button
					onClick={() => toast('Changes saved', { tone: 'success' })}
					variant='outlined'
				>
					Success
				</Button>
				<Button
					onClick={() =>
						toast('The link was copied', {
							description: 'Valid for 24 hours',
						})
					}
					variant='outlined'
				>
					Information
				</Button>
				<Button
					onClick={() =>
						toast('Your session expires in 5 minutes', {
							duration: 0,
							tone: 'warning',
						})
					}
					variant='outlined'
				>
					Warning (it stays)
				</Button>
				<Button
					onClick={() =>
						toast('It could not be sent', {
							description: 'Check your connection and try again',
							tone: 'danger',
						})
					}
					variant='outlined'
				>
					Error
				</Button>
			</Example>
		</>
	);
};
