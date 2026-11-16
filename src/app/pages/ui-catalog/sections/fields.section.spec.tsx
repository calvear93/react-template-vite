import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, test } from 'vitest';
import { FieldsSection } from './fields.section.tsx';

const DOMAIN_FIELDS = 'Domain fields: InputPhone and InputRut';

describe(FieldsSection, () => {
	// hooks
	beforeEach(() => {
		render(<FieldsSection />);
	});

	afterEach(cleanup);

	// tests
	test.each([
		'Field and Input',
		'Sizes',
		'Select and Textarea',
		'Select with groups and InputAmount',
		DOMAIN_FIELDS,
		'Checkbox',
		'RadioGroup',
		'Switch',
		'In a form',
	])('has the example “%s”', (title) => {
		expect(screen.getByRole('region', { name: title })).toBeInTheDocument();
	});

	test('clears the error of a field once its value is right', async () => {
		const email = screen.getByRole('textbox', { name: 'Contact email' });

		expect(email).toBeInvalid();

		await userEvent.type(email, 'example.com');

		expect(email).toBeValid();
	});

	test('tells the status and the value of the RUT as it is typed', async () => {
		const domain = within(
			screen.getByRole('region', { name: DOMAIN_FIELDS }),
		);
		const rut = domain.getByRole('textbox', { name: /^Chilean ID/u });

		await userEvent.type(rut, '12345');

		expect(domain.getByText('incomplete')).toBeInTheDocument();

		await userEvent.type(rut, '6785');

		expect(domain.getByText('valid')).toBeInTheDocument();
		expect(rut).toHaveAccessibleDescription('Value: 12.345.678-5');
	});

	test('shows the prefix of a phone, which is told with the field and never typed', async () => {
		const domain = within(
			screen.getByRole('region', { name: DOMAIN_FIELDS }),
		);
		const mobile = domain.getByRole('textbox', { name: 'Mobile' });

		await userEvent.type(mobile, '4155550132');

		expect(mobile).toHaveValue('4155550132');
		expect(mobile).toHaveAttribute('maxlength', '10');
		expect(mobile).toHaveAccessibleDescription(
			'+1 10 digits, without the +1',
		);
	});

	test('chooses a role from its card', async () => {
		await userEvent.click(screen.getByText('Administrator'));

		expect(
			screen.getByRole('radio', { name: 'Administrator' }),
		).toBeChecked();
	});

	test('sends the values of its controls with a native form', async () => {
		const form = within(screen.getByRole('region', { name: 'In a form' }));

		expect(form.getByRole('status')).toHaveTextContent('Not sent yet');

		await userEvent.type(
			form.getByRole('textbox', { name: 'Name' }),
			'Anna',
		);
		await userEvent.type(
			form.getByRole('textbox', { name: 'Budget' }),
			'1250.5',
		);
		await userEvent.click(
			form.getByRole('checkbox', { name: 'I accept the terms' }),
		);
		await userEvent.click(form.getByRole('button', { name: 'Send data' }));

		expect(form.getByRole('status')).toHaveTextContent(
			'Sent: name=Anna · budget=1250.5 · accept=yes',
		);
	});

	test('writes the limits of an amount in the currency of the app', () => {
		expect(
			screen.getByRole('textbox', { name: 'Annual income' }),
		).toHaveAccessibleDescription('Between $1,000.00 and $5,000,000.00');
	});

	test('groups the cities of the select and writes the amount with its separators', async () => {
		const example = within(
			screen.getByRole('region', {
				name: 'Select with groups and InputAmount',
			}),
		);
		const amount = example.getByRole('textbox', { name: 'Annual income' });

		expect(
			within(
				example.getByRole('combobox', { name: 'City' }),
			).getAllByRole('group'),
		).toHaveLength(2);

		await userEvent.type(amount, '500');
		await userEvent.tab();

		expect(amount).toHaveValue('500');
		expect(amount).toBeInvalid();

		await userEvent.type(amount, '000');

		expect(amount).toHaveValue('500,000');
		expect(amount).toBeValid();
	});
});
