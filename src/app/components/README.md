# Components (Atomic Design)

**Global, reusable** components shared across pages and features, organized with **Atomic Design**.
Page-specific pieces live in `src/app/pages/<page>/components/`.

> Full methodology and rules: the [`atomic-design`](../../../.ai/skills/atomic-design.md) skill.
> Remember: here "atoms" are UI **components**; **state** lives in `src/app/store/`.

## Structure

```
components/
├── atoms/        # smallest, presentational blocks (Button, Input, Icon, Badge)
├── molecules/    # simple groups of atoms (FormField, SearchBox, Card)
└── organisms/    # complex sections; may read the store (Header, DataTable, forms)
```

Higher levels: **templates** = `src/app/layouts/`; **pages** = `src/app/pages/`. Compose
**upward only** (molecules use atoms; organisms use molecules/atoms).

## An atom (presentational)

```tsx
// components/atoms/Button/Button.tsx
import { type ButtonHTMLAttributes } from 'react';
import styles from './Button.module.css';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
	variant?: 'primary' | 'secondary' | 'danger';
	loading?: boolean;
}

export const Button = ({
	variant = 'primary',
	loading = false,
	children,
	disabled,
	className,
	...props
}: ButtonProps) => {
	const classes = [
		styles.button,
		styles[variant],
		loading && styles.loading,
		className,
	]
		.filter(Boolean)
		.join(' ');

	return (
		<button {...props} className={classes} disabled={disabled || loading}>
			{loading ? 'Loading...' : children}
		</button>
	);
};
```

A **molecule** composes atoms (e.g. a `Card` with `Card.Header`/`Card.Body`/`Card.Footer`) and
stays presentational.

## An organism (state enters here)

```tsx
// components/organisms/StatusBanner/StatusBanner.tsx
import { useAtomValue } from 'jotai';
import { sampleStore } from '../../../store/sample.store.ts';
import styles from './StatusBanner.module.css';

export const StatusBanner = () => {
	const message = useAtomValue(sampleStore);

	return <div className={styles.banner}>Status: {message}</div>;
};
```

For remote data, inject a service via IoC with `useInjection` — never raw `fetch`.

## Best practices

- **Single responsibility**; typed props (no `any`); composition over boolean props.
- **Accessibility**: semantic HTML, ARIA, visible focus, keyboard navigation.
- **Styling**: co-located CSS Modules (`*.module.css`).
- **State/services**: only in organisms/pages; atoms and molecules are presentational.
- **Tests**: colocated `*.spec.tsx`; test behavior (React Testing Library), not implementation.
- **Performance**: the React Compiler memoizes; use `memo`/`useMemo` only if profiling proves it.

Start from a scaffold in `.vscode/__templates__/` (`react-component-stateless` for atoms and
molecules, `react-component` for organisms).
