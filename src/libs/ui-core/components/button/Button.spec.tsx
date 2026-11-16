import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef } from 'react';
import { afterEach, describe, expect, test, vi } from 'vitest';
import {
	LinkContext,
	type LinkProps,
} from '../../internal/anchor/link.context.ts';
import { Button } from './Button.tsx';

const RouterLink = ({ children, href, ...props }: LinkProps) => (
	<a data-router href={href} {...props}>
		{children}
	</a>
);

describe(Button, () => {
	// hooks
	afterEach(cleanup);

	// tests
	test('is a button that does not submit by default, named by its text', async () => {
		const onClick = vi.fn();

		render(<Button onClick={onClick}>Guardar cambios</Button>);

		const button = screen.getByRole('button', { name: 'Guardar cambios' });

		await userEvent.click(button);

		expect(button).toHaveAttribute('type', 'button');
		expect(onClick).toHaveBeenCalledOnce();
	});

	test('keeps the native props, the class and the ref given', () => {
		const ref = createRef<HTMLButtonElement>();

		render(
			<Button className='extra' name='intent' ref={ref} type='submit'>
				Enviar denuncia
			</Button>,
		);

		const button = screen.getByRole('button');

		expect(button).toHaveAttribute('type', 'submit');
		expect(button).toHaveAttribute('name', 'intent');
		expect(button).toHaveClass('extra');
		expect(ref.current).toBe(button);
	});

	test.each([
		'solid',
		'filled',
		'outlined',
		'ghost',
		'destructive',
		'link',
		'inverse',
	] as const)('renders the variant %s', (variant) => {
		render(<Button variant={variant}>Acción</Button>);

		expect(screen.getByRole('button', { name: 'Acción' })).toBeEnabled();
	});

	test.each(['sm', 'md', 'lg'] as const)('renders the size %s', (size) => {
		render(
			<Button block size={size}>
				Acción
			</Button>,
		);

		expect(screen.getByRole('button', { name: 'Acción' })).toBeEnabled();
	});

	test('draws its icons as decoration: they add nothing to its name', () => {
		render(
			<Button icon='download' iconEnd='chevron-down'>
				Exportar
			</Button>,
		);

		expect(
			screen.getByRole('button', { name: 'Exportar' }),
		).toBeInTheDocument();
		expect(screen.queryByRole('img')).not.toBeInTheDocument();
	});

	test('takes its name and its tooltip from the content when it is only an icon', () => {
		render(
			<Button icon='trash' iconOnly>
				Quitar acceso
			</Button>,
		);

		expect(
			screen.getByRole('button', { name: 'Quitar acceso' }),
		).toHaveAttribute('title', 'Quitar acceso');
	});

	test('cannot be clicked when disabled', async () => {
		const onClick = vi.fn();

		render(
			<Button disabled onClick={onClick}>
				Guardar
			</Button>,
		);

		await userEvent.click(screen.getByRole('button'));

		expect(screen.getByRole('button')).toBeDisabled();
		expect(onClick).not.toHaveBeenCalled();
	});

	describe('while loading', () => {
		test('says it is busy and ignores clicks, still focusable', async () => {
			const onClick = vi.fn();

			render(
				<Button loading onClick={onClick}>
					Guardar
				</Button>,
			);

			const button = screen.getByRole('button', { name: 'Guardar' });

			await userEvent.click(button);

			expect(button).toHaveAttribute('aria-busy', 'true');
			expect(button).toHaveAttribute('aria-disabled', 'true');
			expect(button).toBeEnabled();
			expect(onClick).not.toHaveBeenCalled();
		});

		test('does not submit its form', async () => {
			const onSubmit = vi.fn((event: React.FormEvent) =>
				event.preventDefault(),
			);

			render(
				<form onSubmit={onSubmit}>
					<Button loading type='submit'>
						Enviar
					</Button>
				</form>,
			);

			await userEvent.click(screen.getByRole('button'));

			expect(onSubmit).not.toHaveBeenCalled();
		});
	});

	describe('with an href', () => {
		test('is a link through the link of the app', () => {
			render(
				<LinkContext value={RouterLink}>
					<Button
						href='/orders'
						icon='arrow-right'
						variant='outlined'
					>
						Ver pedidos
					</Button>
				</LinkContext>,
			);

			const link = screen.getByRole('link', { name: 'Ver pedidos' });

			expect(link).toHaveAttribute('href', '/orders');
			expect(link).toHaveAttribute('data-router');
			expect(screen.queryByRole('button')).not.toBeInTheDocument();
		});

		test('keeps the anchor props given', () => {
			render(
				<Button
					href='https://example.com'
					rel='noreferrer'
					target='_blank'
				>
					Sitio externo
				</Button>,
			);

			const link = screen.getByRole('link', { name: 'Sitio externo' });

			expect(link).toHaveAttribute('target', '_blank');
			expect(link).toHaveAttribute('rel', 'noreferrer');
		});

		test.each([
			{ case: 'disabled', props: { disabled: true } },
			{ case: 'loading', props: { loading: true } },
		])('has no href and says so when $case', ({ props }) => {
			render(
				<Button href='/orders' {...props}>
					Ver pedidos
				</Button>,
			);

			const link = screen.getByRole('link', { name: 'Ver pedidos' });

			expect(link).not.toHaveAttribute('href');
			expect(link).toHaveAttribute('aria-disabled', 'true');
		});
	});
});
