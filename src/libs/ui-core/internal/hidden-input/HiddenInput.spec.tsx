import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, test, vi } from 'vitest';
import { HiddenInput } from './HiddenInput.tsx';

describe(HiddenInput, () => {
	// hooks
	afterEach(cleanup);

	// tests
	test('sends its value with its form under its name', () => {
		render(
			<form aria-label='Datos'>
				<HiddenInput name='rut' value='12345678-5' />
			</form>,
		);

		expect(
			new FormData(screen.getByRole<HTMLFormElement>('form')).get('rut'),
		).toBe('12345678-5');
	});

	test('tells its form when its value changes, and only then', () => {
		const onChange = vi.fn();
		const form = (value: string) => (
			<form aria-label='Datos'>
				<HiddenInput name='date' value={value} />
			</form>
		);
		const { rerender } = render(form(''));

		screen.getByRole('form').addEventListener('change', onChange);

		expect(onChange).not.toHaveBeenCalled();

		rerender(form('2026-11-05'));
		rerender(form('2026-11-05'));

		expect(onChange).toHaveBeenCalledOnce();

		rerender(form(''));

		expect(onChange).toHaveBeenCalledTimes(2);
	});

	test('sends several values under the same name, one input each', () => {
		render(
			<form aria-label='Datos'>
				<HiddenInput name='state' value={['open', 'closed']} />
			</form>,
		);

		const data = new FormData(screen.getByRole<HTMLFormElement>('form'));

		expect(data.getAll('state')).toStrictEqual(['open', 'closed']);
		// the input that tells of the changes has no name: it sends nothing
		expect([...data.keys()]).toStrictEqual(['state', 'state']);
	});

	test('tells its form when its values change, the last one going too', () => {
		const onChange = vi.fn();
		const form = (value: string[]) => (
			<form aria-label='Datos'>
				<HiddenInput name='state' value={value} />
			</form>
		);
		const { rerender } = render(form(['open']));

		screen.getByRole('form').addEventListener('change', onChange);
		rerender(form(['open']));

		expect(onChange).not.toHaveBeenCalled();

		rerender(form(['open', 'closed']));
		rerender(form([]));

		expect(onChange).toHaveBeenCalledTimes(2);
		expect(
			new FormData(screen.getByRole<HTMLFormElement>('form')).has(
				'state',
			),
		).toBe(false);
	});

	test('sends nothing while it is disabled, one value or several', () => {
		render(
			<form aria-label='Datos'>
				<HiddenInput disabled name='rut' value='12345678-5' />
				<HiddenInput disabled name='state' value={['open', 'closed']} />
			</form>,
		);

		expect([
			...new FormData(screen.getByRole<HTMLFormElement>('form')).keys(),
		]).toStrictEqual([]);
	});

	test('sends its value, or its values, with the form it is given', () => {
		render(
			<>
				<form aria-label='Otro' id='other' />
				<HiddenInput form='other' name='rut' value='12345678-5' />
				<HiddenInput
					form='other'
					name='state'
					value={['open', 'closed']}
				/>
			</>,
		);

		const data = new FormData(screen.getByRole<HTMLFormElement>('form'));

		expect(data.get('rut')).toBe('12345678-5');
		expect(data.getAll('state')).toStrictEqual(['open', 'closed']);
	});
});
