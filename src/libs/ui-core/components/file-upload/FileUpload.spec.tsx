import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef } from 'react';
import { afterEach, describe, expect, test, vi } from 'vitest';
import { inChile } from '../../__mocks__/locale.mock.ts';
import { FileUpload, type FileUploadProps } from './FileUpload.tsx';

inChile();

const PDF_TYPE = 'application/pdf';
const STATE = 'data-state';
const PDF_NAME = 'licencia.pdf';
const PDF = new File(['%PDF'], PDF_NAME, { type: PDF_TYPE });
const PHOTO = new File(['…'], 'Foto.JPG', { type: 'image/jpeg' });
const SHEET = new File(['a;b'], 'datos.csv', { type: 'text/csv' });

const renderUpload = (props: Partial<FileUploadProps> = {}) => {
	const onFileChange = vi.fn();

	render(
		<form aria-label='Trámite'>
			<FileUpload
				label='Licencia médica'
				name='license'
				onFileChange={onFileChange}
				requirements='PDF o imagen, hasta 5 MB'
				{...props}
			/>
			<button type='reset'>Limpiar</button>
		</form>,
	);

	return onFileChange;
};

const box = () => screen.getByRole('group', { name: 'Licencia médica' });
const input = () =>
	screen.getByLabelText<HTMLInputElement>(/^Licencia médica/u, {
		selector: 'input',
	});
const choose = () => screen.getByRole('button', { name: 'Elegir archivo' });
const change = () => screen.getByRole('button', { name: 'Cambiar archivo' });
const drop = (...files: File[]) =>
	fireEvent.drop(box(), { dataTransfer: { files } });

// the picker of the browser takes any file when it is told to show them all
const user = userEvent.setup({ applyAccept: false });

describe(FileUpload, () => {
	// hooks
	afterEach(cleanup);

	// tests
	test('says which document it waits for and what it must be', () => {
		const ref = createRef<HTMLInputElement>();

		renderUpload({ className: 'extra', ref });

		expect(box()).toHaveClass('extra');
		expect(box()).toHaveAttribute(STATE, 'waiting');
		expect(ref.current).toBe(input());
		expect(input()).toHaveAttribute('name', 'license');
		expect(choose()).toHaveAccessibleDescription(
			'Licencia médica PDF o imagen, hasta 5 MB',
		);
	});

	test('opens the picker of the browser from its button', async () => {
		renderUpload({ requirements: undefined });

		const onClick = vi.fn();

		input().addEventListener('click', onClick);
		await user.click(choose());

		expect(onClick).toHaveBeenCalledOnce();
		expect(choose()).toHaveAccessibleDescription('Licencia médica');
	});

	test('shows the file chosen, and offers to change it', async () => {
		const onChange = vi.fn();
		const onFileChange = renderUpload({ onChange });

		await user.upload(input(), PDF);

		expect(screen.getByText(PDF_NAME)).toBeVisible();
		expect(box()).toHaveAttribute(STATE, 'chosen');
		expect(change()).toBeVisible();
		expect(onFileChange).toHaveBeenCalledExactlyOnceWith(PDF);
		expect(onChange).toHaveBeenCalledOnce();
	});

	test.each([
		['.pdf', PDF],
		['.csv, .jpg', PHOTO],
		['image/*', PHOTO],
		['application/pdf,text/csv', SHEET],
		[undefined, SHEET],
	])('takes with accept=%j a file that fits', async (accept, file) => {
		const onFileChange = renderUpload({ accept });

		await user.upload(input(), file);

		expect(box()).toHaveAttribute(STATE, 'chosen');
		expect(onFileChange).toHaveBeenCalledExactlyOnceWith(file);
	});

	test.each([
		['.pdf', PHOTO],
		['image/*', PDF],
		[PDF_TYPE, SHEET],
	])(
		'refuses with accept=%j a file that does not fit: shown, said, not sent',
		async (accept, file) => {
			const onFileChange = renderUpload({ accept });

			await user.upload(input(), file);

			expect(screen.getByRole('alert')).toHaveTextContent(
				`El archivo debe ser ${accept}`,
			);
			expect(screen.getByText(file.name)).toBeVisible();
			expect(box()).toHaveAttribute(STATE, 'error');
			expect(input().files).toHaveLength(0);
			expect(onFileChange).toHaveBeenCalledExactlyOnceWith(null);
		},
	);

	test('describes its button with what is wrong', async () => {
		renderUpload({ accept: '.pdf' });

		await user.upload(input(), PHOTO);

		expect(change()).toHaveAccessibleDescription(
			'Licencia médica PDF o imagen, hasta 5 MB El archivo debe ser .pdf',
		);
	});

	test('takes the file away, the focus back on its button', async () => {
		const onFileChange = renderUpload();

		await user.upload(input(), PDF);
		await user.click(
			screen.getByRole('button', { name: 'Quitar archivo' }),
		);

		expect(screen.queryByText(PDF_NAME)).not.toBeInTheDocument();
		expect(box()).toHaveAttribute(STATE, 'waiting');
		expect(input().files).toHaveLength(0);
		expect(onFileChange).toHaveBeenLastCalledWith(null);
		expect(choose()).toHaveFocus();
	});

	test('asks for a required file in its box, the focus on its button', async () => {
		renderUpload({ required: true });

		expect(input()).toBeRequired();
		expect(screen.queryByRole('alert')).not.toBeInTheDocument();

		fireEvent.invalid(input());

		expect(screen.getByRole('alert')).toHaveTextContent('Elija un archivo');
		expect(choose()).toHaveFocus();

		await user.upload(input(), PDF);

		expect(screen.queryByRole('alert')).not.toBeInTheDocument();
	});

	test('takes a file dropped on it', () => {
		const onFileChange = renderUpload({ accept: '.pdf' });

		fireEvent.dragOver(box());

		expect(box()).toHaveAttribute('data-dragging', 'true');

		drop(PDF);

		expect(box()).not.toHaveAttribute('data-dragging');
		expect(screen.getByText(PDF_NAME)).toBeVisible();
		expect(onFileChange).toHaveBeenCalledExactlyOnceWith(PDF);
	});

	test('tells of a file dropped on it as of one that is chosen: a change of its input', () => {
		const dropped: (File | undefined)[] = [];
		const onFormChange = vi.fn();

		renderUpload({
			onChange: (event) => dropped.push(event.target.files?.[0]),
		});
		screen.getByRole('form').addEventListener('change', onFormChange);

		drop(PDF);

		expect(dropped).toStrictEqual([PDF]);
		expect(onFormChange).toHaveBeenCalledOnce();
	});

	test('tells of a file taken away too', async () => {
		const onChange = vi.fn();
		const onFormChange = vi.fn();
		const onFileChange = renderUpload({ onChange });

		await user.upload(input(), PDF);
		screen.getByRole('form').addEventListener('change', onFormChange);
		await user.click(
			screen.getByRole('button', { name: 'Quitar archivo' }),
		);

		expect(onChange).toHaveBeenCalledTimes(2);
		expect(onFormChange).toHaveBeenCalledOnce();
		expect(onFileChange).toHaveBeenCalledTimes(2);
		expect(onFileChange).toHaveBeenLastCalledWith(null);
	});

	test('forgets a file that was dragged away', () => {
		renderUpload();

		fireEvent.dragOver(box());
		fireEvent.dragLeave(box());

		expect(box()).not.toHaveAttribute('data-dragging');
	});

	test('refuses several files dropped at once, and a drop of none', () => {
		const onChange = vi.fn();
		const onFileChange = renderUpload({ onChange });

		drop();

		expect(screen.queryByRole('alert')).not.toBeInTheDocument();

		drop(PDF, PHOTO);

		expect(screen.getByRole('alert')).toHaveTextContent(
			'Suelte un solo archivo',
		);
		expect(onFileChange).not.toHaveBeenCalled();
		expect(onChange).not.toHaveBeenCalled();
	});

	test('does nothing while disabled', () => {
		const onFileChange = renderUpload({ disabled: true });

		fireEvent.dragOver(box());
		drop(PDF);

		expect(choose()).toBeDisabled();
		expect(input()).toBeDisabled();
		expect(box()).toHaveAttribute('data-disabled');
		expect(box()).not.toHaveAttribute('data-dragging');
		expect(onFileChange).not.toHaveBeenCalled();
	});

	test('tells of no file dropped on it while disabled', () => {
		const onChange = vi.fn();
		const onFormChange = vi.fn();

		renderUpload({ disabled: true, onChange });
		screen.getByRole('form').addEventListener('change', onFormChange);

		drop(PDF);

		expect(onChange).not.toHaveBeenCalled();
		expect(onFormChange).not.toHaveBeenCalled();
		expect(input().files).toHaveLength(0);
	});

	test('says what only the server could tell', async () => {
		renderUpload({ error: 'El archivo pesa más de 5 MB' });

		await user.upload(input(), PDF);

		expect(screen.getByRole('alert')).toHaveTextContent(
			'El archivo pesa más de 5 MB',
		);
		expect(box()).toHaveAttribute(STATE, 'error');
	});

	test('waits for its file again when its form is reset', async () => {
		const onFileChange = renderUpload({ accept: '.pdf' });

		await user.click(screen.getByRole('button', { name: 'Limpiar' }));

		expect(onFileChange).not.toHaveBeenCalled();

		await user.upload(input(), PDF);
		await user.click(screen.getByRole('button', { name: 'Limpiar' }));

		expect(screen.queryByText(PDF_NAME)).not.toBeInTheDocument();
		expect(onFileChange).toHaveBeenLastCalledWith(null);
		expect(box()).toHaveAttribute(STATE, 'waiting');
	});

	test('takes other texts', async () => {
		renderUpload({
			id: 'license',
			accept: '.pdf',
			labels: { choose: 'Subir licencia' },
			messages: { type: 'Solo {accept}' },
		});

		expect(
			screen.getByRole('button', { name: 'Subir licencia' }),
		).toBeVisible();
		expect(input()).toHaveAttribute('id', 'license');

		await user.upload(input(), PHOTO);

		expect(screen.getByRole('alert')).toHaveTextContent('Solo .pdf');
	});

	test('says its own message for one given as undefined, and its own label', async () => {
		renderUpload({
			accept: '.pdf',
			labels: { remove: undefined },
			messages: { type: undefined },
		});

		await user.upload(input(), PHOTO);

		expect(screen.getByRole('alert')).toHaveTextContent(
			'El archivo debe ser .pdf',
		);
	});
});
