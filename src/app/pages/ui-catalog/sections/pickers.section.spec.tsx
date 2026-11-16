import { todayIso } from '#libs/ui-core';
import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, test } from 'vitest';
import { PickersSection } from './pickers.section.tsx';

const IN_CHARGE = /^Person in charge/u;

describe(PickersSection, () => {
	// hooks
	beforeEach(() => {
		render(<PickersSection />);
	});

	afterEach(cleanup);

	// tests
	test.each([
		'Calendar',
		'DatePicker',
		'DatePicker in filters',
		'Combobox',
		'PeoplePicker',
		'TimePicker',
		'SearchSelect',
		'MultiSelect',
		'FileUpload',
	])('has the example “%s”', (title) => {
		expect(screen.getByRole('region', { name: title })).toBeInTheDocument();
	});

	test('says the day picked in the calendar', async () => {
		const calendar = within(
			screen.getByRole('region', { name: 'Calendar' }),
		);
		const today = calendar.getAllByRole('button', { current: 'date' })[0];

		expect(calendar.getByText('No day chosen')).toBeInTheDocument();

		await userEvent.click(today);

		expect(
			calendar.getByText(`Chosen: ${today.getAttribute('aria-label')}`),
		).toBeInTheDocument();
	});

	test('picks the date of an appointment from its calendar, written month first', async () => {
		const pickers = within(
			screen.getByRole('region', { name: 'DatePicker' }),
		);
		const field = pickers.getByRole('textbox', {
			name: /^Date of the appointment/u,
		});
		const [year, month, day] = todayIso().split('-');

		await userEvent.click(
			pickers.getAllByRole('button', { name: 'Open the calendar' })[0],
		);
		await userEvent.click(pickers.getByRole('button', { name: 'Today' }));

		expect(field).toHaveValue(`${month}/${day}/${year}`);
		expect(field).toHaveFocus();
	});

	test('shows a date it is given as the language writes it', () => {
		expect(
			screen.getByRole('textbox', { name: /^Date of birth/u }),
		).toHaveValue('05/17/1990');
	});

	test('applies a date typed in the filters at once', async () => {
		const filters = within(
			screen.getByRole('region', { name: 'DatePicker in filters' }),
		);
		const from = filters.getByRole('textbox', { name: 'From' });

		await userEvent.type(from, '03152020');

		expect(from).toHaveValue('03/15/2020');
		expect(filters.getByRole('status')).toHaveTextContent(
			'Applied: “” from 2020-03-15',
		);

		await userEvent.click(filters.getByRole('button', { name: 'Clear' }));

		await expect(
			filters.findByText('Applied: “” from any date'),
		).resolves.toBeInTheDocument();
	});

	test('finds a city, accents aside, and tells its code', async () => {
		const combobox = within(
			screen.getByRole('region', { name: 'Combobox' }),
		);

		await userEvent.type(
			combobox.getByRole('combobox', { name: 'City' }),
			'zur',
		);
		await userEvent.click(await combobox.findByRole('option'));

		expect(combobox.getByRole('status')).toHaveTextContent(
			'City code: EU-ZRH',
		);
	});

	test('keeps the person in charge', async () => {
		const people = within(
			screen.getByRole('region', { name: 'PeoplePicker' }),
		);

		await userEvent.type(
			people.getByRole('combobox', { name: IN_CHARGE }),
			'anna.schmidt',
		);
		await userEvent.click(await people.findByRole('option'));

		expect(people.getByRole('status')).toHaveTextContent(
			'In charge: anna.schmidt@example.com',
		);
	});

	test('shows the detail of a person next to their name and email', async () => {
		const people = within(
			screen.getByRole('region', { name: 'PeoplePicker' }),
		);

		await userEvent.type(
			people.getByRole('combobox', { name: IN_CHARGE }),
			'novak',
		);

		await expect(people.findByRole('option')).resolves.toHaveTextContent(
			/Novak, Peter.*peter\.novak@example\.org.*Contractor/u,
		);
	});

	test('says when the search of people fails', async () => {
		const people = within(
			screen.getByRole('region', { name: 'PeoplePicker' }),
		);
		await userEvent.type(
			people.getByRole('combobox', { name: IN_CHARGE }),
			'error',
		);

		await expect(
			people.findByText('The search failed. Try again.'),
		).resolves.toBeInTheDocument();
	});

	test('adds people to the team, once each, and takes them away', async () => {
		const people = within(
			screen.getByRole('region', { name: 'PeoplePicker' }),
		);
		const box = people.getByRole('combobox', { name: 'Add to the team' });
		const team = within(people.getByRole('list', { name: 'Team' }));

		await userEvent.type(box, 'sofia');
		await userEvent.click(await people.findByRole('option'));
		await userEvent.type(box, 'sofia');
		await userEvent.click(await people.findByRole('option'));

		expect(team.getAllByRole('listitem')).toHaveLength(1);
		expect(box).toHaveValue('');

		await userEvent.click(
			team.getByRole('button', { name: 'Remove Sofia Rossi' }),
		);

		expect(team.queryByRole('listitem')).not.toBeInTheDocument();
	});

	test('shows the file chosen for a document', async () => {
		const upload = within(
			screen.getByRole('region', { name: 'FileUpload' }),
		);

		await userEvent.upload(
			upload.getByLabelText(/^Medical certificate/u, {
				selector: 'input',
			}),
			new File(['%PDF'], 'certificate.pdf', { type: 'application/pdf' }),
		);

		expect(upload.getByText('certificate.pdf')).toBeInTheDocument();
		expect(upload.getAllByRole('alert')).toHaveLength(1);
	});

	test('picks a city by searching it, and takes it away', async () => {
		const example = within(
			screen.getByRole('region', { name: 'SearchSelect' }),
		);
		const city = example.getByRole('combobox', { name: 'City' });

		await userEvent.click(city);
		await userEvent.keyboard('malmo{Enter}');

		expect(city).toHaveTextContent('Malmö');
		expect(
			example.getByText('Code of the city: EU-MMA'),
		).toBeInTheDocument();

		await userEvent.click(
			example.getByRole('button', { name: 'Clear the selection' }),
		);

		expect(example.getByText('No city chosen')).toBeInTheDocument();
	});

	test('picks several cities and says how many', async () => {
		const example = within(
			screen.getByRole('region', { name: 'MultiSelect' }),
		);
		const cities = example.getByRole('combobox', { name: 'Cities' });

		expect(
			example.getByRole('combobox', { name: 'Statuses' }),
		).toHaveTextContent('Open, In review2');

		await userEvent.click(cities);
		await userEvent.click(example.getByRole('option', { name: 'Zürich' }));
		await userEvent.click(example.getByRole('option', { name: 'Tokyo' }));

		expect(example.getByText('Cities chosen: 2')).toBeInTheDocument();
		expect(cities).toHaveTextContent('Zürich, Tokyo2');
	});

	test('takes a time typed or picked, in its three panels', async () => {
		const example = within(
			screen.getByRole('region', { name: 'TimePicker' }),
		);
		const incident = example.getByRole('textbox', {
			name: 'Time of the incident',
		});

		await userEvent.type(incident, '0930');

		expect(incident).toHaveValue('09:30');
		expect(
			example.getByText('Time of the incident: 09:30'),
		).toBeInTheDocument();
		expect(
			example.getByRole('textbox', { name: 'Time of the visit' }),
		).toHaveValue('14:35');

		await userEvent.click(
			example.getAllByRole('button', {
				name: 'Open the time picker',
			})[1],
		);
		await userEvent.click(example.getByRole('option', { name: '10:30' }));

		expect(
			example.getByRole('textbox', { name: 'Time of the appointment' }),
		).toHaveValue('10:30');
	});
});
