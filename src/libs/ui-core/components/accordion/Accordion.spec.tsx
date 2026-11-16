import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, test, vi } from 'vitest';
import { Accordion, AccordionItem, type AccordionProps } from './Accordion.tsx';

const COVERAGE = '¿Qué cubre el seguro?';
const REPORT = '¿Cómo denuncio un accidente?';
const PAYMENT = '¿Cuándo se paga el subsidio?';

const renderAccordion = (props: Partial<AccordionProps> = {}) => {
	const onValueChange = vi.fn();

	render(
		<Accordion
			className='extra'
			data-testid='accordion'
			onValueChange={onValueChange}
			{...props}
		>
			<AccordionItem title={COVERAGE} value='coverage'>
				Accidentes del trabajo y de trayecto.
			</AccordionItem>
			<AccordionItem summary='3 pasos' title={REPORT} value='report'>
				Con la denuncia individual.
			</AccordionItem>
			<AccordionItem title={PAYMENT} value='payment'>
				Cada treinta días.
			</AccordionItem>
		</Accordion>,
	);

	return onValueChange;
};

// which sections are open, in their order: coverage, report, payment
const open = () =>
	screen.getAllByRole<HTMLDetailsElement>('group').map((item) => item.open);
const press = (title: string) => userEvent.click(screen.getByText(title));

describe(Accordion, () => {
	// hooks
	afterEach(cleanup);

	// tests
	test('lists its sections, closed at first, each with its title and content', () => {
		renderAccordion();

		expect(screen.getByTestId('accordion')).toHaveClass('extra');
		expect(open()).toStrictEqual([false, false, false]);
		expect(screen.getByText('3 pasos')).toBeInTheDocument();
		expect(
			screen.getByText('Con la denuncia individual.'),
		).toBeInTheDocument();
	});

	test('opens the sections it is told to start with', () => {
		renderAccordion({ defaultValue: ['report'] });

		expect(open()).toStrictEqual([false, true, false]);
	});

	test('closes the others when one opens, and closes the open one from its title', async () => {
		const onValueChange = renderAccordion();

		await press(COVERAGE);
		await press(PAYMENT);

		expect(onValueChange.mock.calls).toStrictEqual([
			[['coverage']],
			[['payment']],
		]);
		expect(open()).toStrictEqual([false, false, true]);

		await press(PAYMENT);

		expect(onValueChange).toHaveBeenLastCalledWith([]);
		expect(open()).toStrictEqual([false, false, false]);
	});

	test('lets each section go by itself when several can be open', async () => {
		const onValueChange = renderAccordion({ type: 'multiple' });

		await press(COVERAGE);
		await press(PAYMENT);

		expect(onValueChange).toHaveBeenLastCalledWith(['coverage', 'payment']);

		await press(COVERAGE);

		expect(onValueChange).toHaveBeenLastCalledWith(['payment']);
		expect(open()).toStrictEqual([false, false, true]);
	});

	test('opens what it is told when it is controlled', async () => {
		const onValueChange = renderAccordion({ value: ['coverage'] });

		await press(REPORT);

		expect(onValueChange).toHaveBeenCalledExactlyOnceWith(['report']);
		expect(open()).toStrictEqual([true, false, false]);
	});

	test('refuses a section outside of an accordion', () => {
		const error = vi.spyOn(console, 'error').mockImplementation(vi.fn());

		expect(() =>
			render(
				<AccordionItem title={COVERAGE} value='coverage'>
					Contenido
				</AccordionItem>,
			),
		).toThrow('AccordionItem must be used inside an Accordion');

		error.mockRestore();
	});
});
