import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef } from 'react';
import { afterEach, describe, expect, test } from 'vitest';
import { Field } from '../field/Field.tsx';
import { Textarea } from './Textarea.tsx';

describe(Textarea, () => {
	// hooks
	afterEach(cleanup);

	// tests
	test('is a native textarea of three rows that works uncontrolled', async () => {
		const ref = createRef<HTMLTextAreaElement>();

		render(
			<Textarea aria-label='Descripción' className='extra' ref={ref} />,
		);

		const textarea = screen.getByRole('textbox', { name: 'Descripción' });

		await userEvent.type(textarea, 'Caída{Enter}en bodega');

		expect(textarea).toHaveValue('Caída\nen bodega');
		expect(textarea).toHaveAttribute('rows', '3');
		expect(textarea).toHaveClass('extra');
		expect(ref.current).toBe(textarea);
	});

	test.each(['sm', 'md', 'lg'] as const)(
		'takes its name and its error from the field, at size %s',
		(size) => {
			render(
				<Field error='Describa qué pasó' label='Descripción'>
					<Textarea autoGrow rows={5} size={size} />
				</Field>,
			);

			const textarea = screen.getByRole('textbox', {
				name: 'Descripción',
			});

			expect(textarea).toBeInvalid();
			expect(textarea).toHaveAccessibleDescription('Describa qué pasó');
			expect(textarea).toHaveAttribute('rows', '5');
		},
	);
});
