import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, test, vi } from 'vitest';
import { inChile } from '../../__mocks__/locale.mock.ts';
import { PeoplePicker, type Person } from './PeoplePicker.tsx';

inChile();

interface Employee extends Person {
	id: number;
}

const ANA: Employee = {
	id: 7,
	detail: '12.345.678-5',
	email: 'ana.perez@example.com',
	name: 'Pérez Soto, Ana María',
};
const PEOPLE: Employee[] = [
	ANA,
	{ id: 8, email: 'analia@example.com', name: 'Analía Rojas' },
	{ id: 9, detail: '11.111.111-1', name: 'Mariana Díaz' },
];

const find = (query: string) =>
	PEOPLE.filter((person) =>
		person.name.toLowerCase().includes(query.toLowerCase()),
	);

const box = () => screen.getByRole('combobox', { name: 'Persona' });
const results = () => screen.findAllByRole('option');
const sent = () =>
	new FormData(screen.getByRole<HTMLFormElement>('form')).get('person');

describe(PeoplePicker, () => {
	// hooks
	afterEach(cleanup);

	// tests
	test('searches from three letters', async () => {
		const search = vi.fn(find);

		render(<PeoplePicker aria-label='Persona' delay={0} search={search} />);

		await userEvent.type(box(), 'an');

		expect(search).not.toHaveBeenCalled();

		await userEvent.type(box(), 'a');

		await expect(results()).resolves.toHaveLength(3);
	});

	test('shows each person: the name with what was typed marked, the email and what tells them apart', async () => {
		render(<PeoplePicker aria-label='Persona' delay={0} search={find} />);

		await userEvent.type(box(), 'ana');

		const [first, second, third] = await results();

		expect(first).toHaveTextContent(
			'APPérez Soto, Ana Maríaana.perez@example.com12.345.678-5',
		);
		expect(within(first).getByRole('mark')).toHaveTextContent('Ana');
		expect(second).toHaveTextContent('ARAnalía Rojasanalia@example.com');
		expect(third).toHaveTextContent('MDMariana Díaz11.111.111-1');
	});

	test('keeps the person picked, and sends the email with its form', async () => {
		const onValueChange = vi.fn();

		render(
			<form aria-label='Acceso'>
				<PeoplePicker
					aria-label='Persona'
					delay={0}
					name='person'
					onValueChange={onValueChange}
					search={find}
				/>
			</form>,
		);

		await userEvent.type(box(), 'ana');
		await results();
		await userEvent.keyboard('{Enter}');

		expect(box()).toHaveValue('Pérez Soto, Ana María');
		expect(onValueChange).toHaveBeenCalledExactlyOnceWith(ANA);
		expect(sent()).toBe('ana.perez@example.com');
	});

	test.each([
		[1, 'analia@example.com'],
		[2, 'Mariana Díaz'],
	])('sends what tells person %i apart: %s', async (index, expected) => {
		render(
			<form aria-label='Acceso'>
				<PeoplePicker
					aria-label='Persona'
					delay={0}
					name='person'
					search={find}
				/>
			</form>,
		);

		await userEvent.type(box(), 'ana');

		const found = await results();

		await userEvent.click(found[index]);

		expect(sent()).toBe(expected);
	});

	test('sends the name of a person with nothing else, or the key it is told', async () => {
		const search = () => [{ id: 3, name: 'Luis Soto' }];
		const { rerender } = render(
			<form aria-label='Acceso'>
				<PeoplePicker
					aria-label='Persona'
					delay={0}
					name='person'
					search={search}
				/>
			</form>,
		);

		await userEvent.type(box(), 'lui');

		const [first] = await results();

		await userEvent.click(first);

		expect(sent()).toBe('Luis Soto');

		rerender(
			<form aria-label='Acceso'>
				<PeoplePicker
					aria-label='Persona'
					delay={0}
					getKey={(person) => String(person.id)}
					name='person'
					search={search}
				/>
			</form>,
		);

		expect(sent()).toBe('3');
	});

	test('adds people one after another with `clearOnPick`', async () => {
		const onValueChange = vi.fn();

		render(
			<PeoplePicker
				aria-label='Persona'
				clearOnPick
				delay={0}
				onValueChange={onValueChange}
				search={find}
			/>,
		);

		await userEvent.type(box(), 'ana');
		await results();
		await userEvent.keyboard('{ArrowDown}{Enter}');

		expect(onValueChange).toHaveBeenCalledExactlyOnceWith(PEOPLE[1]);
		expect(box()).toHaveValue('');
	});
});
