import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef } from 'react';
import { afterEach, describe, expect, test, vi } from 'vitest';
import { Checkbox } from './Checkbox.tsx';

describe(Checkbox, () => {
	// hooks
	afterEach(cleanup);

	// tests
	test('is named by its text and described by its description', () => {
		render(
			<Checkbox description='Puede revocarlo cuando quiera' name='terms'>
				Autorizo el uso de mis datos
			</Checkbox>,
		);

		const checkbox = screen.getByRole('checkbox', {
			name: 'Autorizo el uso de mis datos',
		});

		expect(checkbox).toHaveAccessibleDescription(
			'Puede revocarlo cuando quiera',
		);
		expect(checkbox).not.toBeChecked();
	});

	test('toggles from its text, uncontrolled, and with the keyboard', async () => {
		const ref = createRef<HTMLInputElement>();

		render(
			<Checkbox className='extra' ref={ref} size='sm'>
				Recordarme
			</Checkbox>,
		);

		const checkbox = screen.getByRole('checkbox', { name: 'Recordarme' });

		await userEvent.click(screen.getByText('Recordarme'));

		expect(checkbox).toBeChecked();

		await userEvent.keyboard(' ');

		expect(checkbox).not.toBeChecked();
		expect(checkbox).not.toHaveAttribute('aria-describedby');
		expect(ref.current).toBe(checkbox);
	});

	test('works controlled and cannot change when disabled', async () => {
		const onChange = vi.fn();

		render(
			<>
				<Checkbox checked onChange={onChange}>
					Activo
				</Checkbox>
				<Checkbox defaultChecked disabled>
					Bloqueado
				</Checkbox>
			</>,
		);

		await userEvent.click(screen.getByRole('checkbox', { name: 'Activo' }));
		await userEvent.click(screen.getByText('Bloqueado'));

		expect(onChange).toHaveBeenCalledOnce();
		expect(screen.getByRole('checkbox', { name: 'Activo' })).toBeChecked();
		expect(
			screen.getByRole('checkbox', { name: 'Bloqueado' }),
		).toBeChecked();
	});
});
