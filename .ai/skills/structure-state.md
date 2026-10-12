# Skill: structure (Atomic Design) and state (jotai)

Read this when you create components, pages, layouts or stores. The scaffolds are
`react-component`, `react-component-stateless`, `react-component-versioned`, `react-page`,
`react-layout` and `react-store`. Reference code lives in `src/app/pages/detail/` and
`src/app/store/`.

## Atomic Design levels

| Level     | Where                           | May use                                                                    |
| --------- | ------------------------------- | -------------------------------------------------------------------------- |
| Atoms     | `src/app/components/atoms/`     | Props only, nothing below it                                               |
| Molecules | `src/app/components/molecules/` | Atoms                                                                      |
| Organisms | `src/app/components/organisms/` | Atoms, molecules, stores, `useInjection`                                   |
| Templates | `src/app/layouts/<name>/`       | Components. They render `{children}` (the router injects the `<Outlet />`) |
| Pages     | `src/app/pages/<name>/`         | Everything: stores, IoC, router, feature flags                             |

- Compose upward only. Atoms and molecules are presentational: no stores, IoC or router.
- Each component gets its own folder (`<component-name>/<ComponentName>.tsx` + `.module.css` +
  `.spec.tsx`). Page-local pieces go in `pages/<page>/components/`. Promote one to
  `src/app/components/` once a second page needs it.
- Page files are `<Name>.page.tsx`. They have a named export (for tests) **and** a default
  export (for `lazy()`), and they set `<title>` inside their JSX (React 19).

## State

- Keep state local (`useState`) until a second component needs it. Then use a jotai store:
  app-wide ones in `src/app/store/`, page ones in `pages/<page>/store/`.
- A store file is `<name>.store.ts`. It keeps a private `_inner…` atom, exports a derived
  read/write atom (writes may be `async`), and has a co-located `.store.spec.ts`.

```ts
const _innerStore = atom<State>({ loading: false });
export const xStore = atom(
	(get) => get(_innerStore),
	async (_get, set, arg: Arg) => { … set(_innerStore, …) },
);
```

- Consume a store with `useAtom`, `useAtomValue` or `useSetAtom`.
- `atomWithStorage` comes from `jotai/utils`.
- `atomFamily` is **not** in jotai 3. It needs the separate `jotai-family` package; ask before
  adding the dependency.

## Styling

- CSS Modules hold component styles. Stylelint enforces property order and nesting.
- UnoCSS utilities go in `className` (theme color `text-primary`; icons `i-mdi-*`).
- Global styles live only in `src/app/styles/`.
