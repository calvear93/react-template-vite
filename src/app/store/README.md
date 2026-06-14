# Store (app state)

Shared **application state** layer. The naming is **library-agnostic** (`*.store.ts`, `*Store`)
so the state engine stays replaceable; today it is **backed by [Jotai](https://jotai.org)**.

> **Not Atomic Design.** Here "store" = **state**. The _atoms / molecules / organisms_ of Atomic
> Design are **components** and live in `src/app/components/` (see the
> [`atomic-design`](../../../.ai/skills/atomic-design.md) skill).

## The pattern

Each store module exposes a **private source** (`_inner*`, never exported) and a **public**
read/write primitive. It is consumed by **stateful** components (organisms and pages, not
atoms/molecules — see [`atomic-design`](../../../.ai/skills/atomic-design.md)) with the matching
hook (`useAtom` / `useAtomValue` / `useSetAtom`).

```ts
// src/app/store/sample.store.ts
import { atom } from 'jotai';

const _innerStore = atom<SampleState>({ message: 'loading', status: 0 });

export const sampleStore = atom(
	(get) => get(_innerStore).message, // read
	(_get, set, status: number) => {
		// write
		set(_innerStore, {
			message: status === 200 ? 'success' : 'error',
			status,
		});
	},
);

export interface SampleState {
	message: string;
	status: number;
}
```

Use in a component:

```tsx
import { useAtom, useAtomValue } from 'jotai';
import { sampleStore } from '../../store/sample.store.ts';

const [message, setStatus] = useAtom(sampleStore); // read + write
const value = useAtomValue(sampleStore); // read-only
```

## Recipes

- **Derived (read-only):** `export const countStore = atom((get) => get(usersStore).length);`
- **Async (data fetching):** a write store that calls a service injected via IoC (`useInjection`),
  never raw `fetch`, so it stays mockable in tests.
- **Persistence:** `atomWithStorage('key', initialValue)` from `jotai/utils`.

## Conventions

- Files `*.store.ts`; public export `*Store`; private source `_inner*` (never exported).
- One module per domain; keep state as flat as possible; split into focused stores.
- Inject dependencies (services) through IoC; do not import singletons.
- App-wide → `src/app/store/`; page-specific state → `src/app/pages/<page>/store/`.

## Testing

Colocated `*.store.spec.ts`. Render with `renderHook(() => useAtom(<store>))` (Vitest); use
`vi.useFakeTimers()` for async writes. See `sample.store.spec.ts`.

## Create a new store

Start from the `react-store` scaffold in `.vscode/__templates__/`. If the state engine changes
later, only the implementation of the `*.store.ts` modules changes; the contract (store modules
consumed by hooks) stays the same.
