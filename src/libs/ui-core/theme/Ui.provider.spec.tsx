import { act, cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, test } from 'vitest';
import { mockMatchMedia } from '../__mocks__/match-media.mock.ts';
import { Anchor } from '../internal/anchor/Anchor.tsx';
import { type LinkProps } from '../internal/anchor/link.context.ts';
import { useTheme } from './theme.hook.ts';
import { setContrast, setTheme } from './theme.store.ts';
import { UiProvider } from './Ui.provider.tsx';

const Probe = () => {
	const { highContrast, resolvedTheme, setContrast, setTheme, theme } =
		useTheme();

	return (
		<>
			<output>
				{theme} {resolvedTheme} {String(highContrast)}
			</output>
			<button onClick={() => setTheme('dark')} type='button'>
				dark
			</button>
			<button onClick={() => setContrast('more')} type='button'>
				contrast
			</button>
		</>
	);
};

const RouterLink = ({ children, href, ...props }: LinkProps) => (
	<a data-router href={href} {...props}>
		{children}
	</a>
);

describe(UiProvider, () => {
	const root = document.documentElement;
	let media: ReturnType<typeof mockMatchMedia>;

	// hooks
	beforeEach(() => {
		media = mockMatchMedia();
	});

	afterEach(() => {
		cleanup();
		setTheme('auto');
		setContrast(null);
		localStorage.clear();
		media.restore();
	});

	// tests
	test('applies the theme of the system', () => {
		media.set('(prefers-color-scheme: dark)', true);

		render(
			<UiProvider>
				<Probe />
			</UiProvider>,
		);

		expect(root.dataset.theme).toBe('dark');
		expect(screen.getByRole('status')).toHaveTextContent('auto dark false');
	});

	test('re-renders what reads the theme when the system changes', () => {
		render(
			<UiProvider>
				<Probe />
			</UiProvider>,
		);

		act(() => {
			media.set('(prefers-contrast: more)', true);
		});

		expect(screen.getByRole('status')).toHaveTextContent('auto light true');
	});

	test('lets a component choose the theme and the contrast', async () => {
		render(
			<UiProvider>
				<Probe />
			</UiProvider>,
		);

		await userEvent.click(screen.getByRole('button', { name: 'dark' }));
		await userEvent.click(screen.getByRole('button', { name: 'contrast' }));

		expect(screen.getByRole('status')).toHaveTextContent('dark dark true');
		expect(root.dataset).toMatchObject({
			contrast: 'more',
			theme: 'dark',
		});
	});

	test('stops following the system once unmounted', () => {
		const { unmount } = render(<UiProvider />);

		unmount();
		media.set('(prefers-color-scheme: dark)', true);

		expect(root.dataset.theme).toBe('light');
	});

	describe('links', () => {
		test('renders a plain anchor by default', () => {
			render(<Anchor href='/orders'>Pedidos</Anchor>);

			expect(
				screen.getByRole('link', { name: 'Pedidos' }),
			).toHaveAttribute('href', '/orders');
		});

		test('renders internal links with the link of the app', () => {
			render(
				<UiProvider link={RouterLink}>
					<Anchor href='/orders'>Pedidos</Anchor>
				</UiProvider>,
			);

			expect(screen.getByRole('link')).toHaveAttribute('data-router');
		});

		test.each([
			{ case: 'another origin', props: { href: 'https://example.com' } },
			{
				case: 'a protocol-relative URL',
				props: { href: '//example.com' },
			},
			{ case: 'a mail address', props: { href: 'mailto:a@example.com' } },
			{ case: 'a new tab', props: { href: '/doc', target: '_blank' } },
			{ case: 'a download', props: { download: '', href: '/doc.pdf' } },
		])('keeps a plain anchor for $case', ({ props }) => {
			render(
				<UiProvider link={RouterLink}>
					<Anchor {...props}>Salir</Anchor>
				</UiProvider>,
			);

			expect(screen.getByRole('link')).not.toHaveAttribute('data-router');
		});
	});
});
