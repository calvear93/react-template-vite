import { act, cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, test } from 'vitest';
import { configureLocale, setLocale } from '../format/locale.ts';
import { UiProvider } from '../theme/Ui.provider.tsx';
import { UI_TEXTS_EN, type UiTexts } from './en.ts';
import { UI_TEXTS_ES } from './es.ts';
import { useTexts } from './texts.hook.ts';
import { mergeTexts, textsOf } from './texts.ts';

/** The names of every text of a language, by component: what two languages must share. */
const shapeOf = (texts: UiTexts) =>
	Object.fromEntries(
		Object.entries(texts).map(([component, group]) => [
			component,
			Object.fromEntries(
				Object.entries(group).map(([name, text]) => [
					name,
					typeof text,
				]),
			),
		]),
	);

const Probe = () => {
	const { dialog, pager } = useTexts();

	return (
		<output>
			{dialog.close} · {dialog.submit} · {pager.pageOf('2', '9')}
		</output>
	);
};

describe(textsOf, () => {
	test.each([
		['en', UI_TEXTS_EN],
		['en-GB', UI_TEXTS_EN],
		['es', UI_TEXTS_ES],
		['es-CL', UI_TEXTS_ES],
		// a language the kit does not speak reads English
		['de-DE', UI_TEXTS_EN],
	])('gives, for %s, the texts of its language', (locale, texts) => {
		expect(textsOf(locale)).toBe(texts);
	});

	test('has in Spanish every text it has in English, of the same kind', () => {
		expect(shapeOf(UI_TEXTS_ES)).toStrictEqual(shapeOf(UI_TEXTS_EN));
	});

	test.each([
		[UI_TEXTS_EN, '3 selected', 'Type “ACME” to confirm'],
		[UI_TEXTS_ES, '3 seleccionadas', 'Escriba «ACME» para confirmar'],
	])('fills the blanks of a text', (texts, selected, required) => {
		expect(texts.multiSelect.selected(3, '3')).toBe(selected);
		expect(texts.alertDialog.requireText('ACME')).toBe(required);
		expect(texts.pager.range('1', '25', '3,021')).toContain('1–25');
	});

	test.each([
		['English', UI_TEXTS_EN],
		['Spanish', UI_TEXTS_ES],
	])('has in %s a text for every blank that is filled', (_, texts) => {
		const filled = Object.values(texts)
			.flatMap((group) => Object.values(group))
			.filter((text) => typeof text === 'function')
			// a count and a text, which is what every one of them takes
			.map((text) =>
				(text as (...blanks: unknown[]) => unknown)(2, '2', '9'),
			);

		expect(filled).not.toHaveLength(0);
		expect(filled.every((text) => typeof text === 'string')).toBe(true);
	});

	test('counts one in Spanish as one', () => {
		expect(UI_TEXTS_ES.multiSelect.selected(1, '1')).toBe('1 seleccionada');
	});
});

describe(mergeTexts, () => {
	test('puts the texts of an app over those of the language, and keeps the rest', () => {
		const merged = mergeTexts(UI_TEXTS_EN, {
			dialog: { close: undefined, submit: 'Apply' },
		});

		expect(merged.dialog).toStrictEqual({
			cancel: 'Cancel',
			close: 'Close',
			submit: 'Apply',
		});
		expect(merged.pager).toStrictEqual(UI_TEXTS_EN.pager);
	});

	test('is the language itself for an app with no texts of its own', () => {
		expect(mergeTexts(UI_TEXTS_ES, undefined)).toBe(UI_TEXTS_ES);
	});
});

describe(useTexts, () => {
	// hooks
	afterEach(() => {
		cleanup();
		setLocale(null);
		configureLocale({});
	});

	// tests
	test('reads English by itself, and the language of the page once it has one', () => {
		render(<Probe />);

		expect(screen.getByRole('status')).toHaveTextContent(
			'Close · Save · page 2 of 9',
		);

		act(() => setLocale('es-CL'));

		expect(screen.getByRole('status')).toHaveTextContent(
			'Cerrar · Guardar · página 2 de 9',
		);
	});

	test('reads the texts of the app over those of the language, in every language', () => {
		render(
			<UiProvider
				locale='es-CL'
				texts={{ dialog: { submit: 'Aplicar' } }}
			>
				<Probe />
			</UiProvider>,
		);

		expect(screen.getByRole('status')).toHaveTextContent(
			'Cerrar · Aplicar · página 2 de 9',
		);

		act(() => setLocale('en'));

		expect(screen.getByRole('status')).toHaveTextContent(
			'Close · Aplicar · page 2 of 9',
		);
	});
});
