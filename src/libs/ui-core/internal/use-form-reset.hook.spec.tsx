import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRef, useState } from 'react';
import { afterEach, describe, expect, test, vi } from 'vitest';
import { useFormReset } from './use-form-reset.hook.ts';

const Upper = ({ initial }: { initial: string }) => {
	const input = useRef<HTMLInputElement>(null);
	const [text, setText] = useState(initial);

	useFormReset(input, () => setText(initial));

	return (
		<input
			aria-label='Código'
			onChange={(event) => setText(event.target.value.toUpperCase())}
			ref={input}
			value={text}
		/>
	);
};

const Probe = ({ onReset }: { onReset: () => void }) => {
	const input = useRef<HTMLInputElement>(null);

	useFormReset(input, onReset);

	return <input aria-label='Código' ref={input} />;
};

describe(useFormReset, () => {
	// hooks
	afterEach(cleanup);

	// tests
	test('puts a control that keeps its own text back when its form is reset', async () => {
		render(
			<form>
				<Upper initial='AB' />
				<button type='reset'>Limpiar</button>
			</form>,
		);

		await userEvent.type(screen.getByRole('textbox'), 'cd');

		expect(screen.getByRole('textbox')).toHaveValue('ABCD');

		await userEvent.click(screen.getByRole('button', { name: 'Limpiar' }));

		expect(screen.getByRole('textbox')).toHaveValue('AB');
	});

	test('stops listening once the control is gone', () => {
		const onReset = vi.fn();
		const view = (isShown: boolean) => (
			<form aria-label='Datos'>
				{isShown && <Probe onReset={onReset} />}
			</form>
		);
		const { rerender } = render(view(true));
		const form = screen.getByRole<HTMLFormElement>('form');

		form.reset();

		expect(onReset).toHaveBeenCalledOnce();

		rerender(view(false));
		form.reset();

		expect(onReset).toHaveBeenCalledOnce();
	});

	test('has nothing to listen to outside a form', () => {
		const onReset = vi.fn();

		render(<Probe onReset={onReset} />);

		expect(screen.getByRole('textbox')).toBeVisible();
		expect(onReset).not.toHaveBeenCalled();
	});
});
