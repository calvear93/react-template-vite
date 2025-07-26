# Atoms

This directory contains Jotai atoms for global state management. Atoms are the building blocks of state in Jotai, providing a bottom-up approach to state management with fine-grained reactivity.

## Overview

Atoms in Jotai are units of state that can be composed together to build complex state logic. They offer several advantages:

- **Fine-grained reactivity**: Components only re-render when atoms they use change
- **Composable**: Atoms can derive from other atoms
- **Type-safe**: Full TypeScript support
- **No providers needed**: Unlike Context, atoms work without providers
- **Atomic updates**: Updates are atomic and consistent

## Current Atoms

### SampleAtom

A demonstration atom that manages a simple state with message and status:

```typescript
// Read-only access to message
const message = useAtomValue(sampleAtom);

// Read/write access
const [message, setStatus] = useAtom(sampleAtom);
setStatus(200); // Updates status and derives message
```

## Creating New Atoms

### 1. Basic Atom

```typescript
// atoms/counter.atom.ts
import { atom } from 'jotai';

// Primitive atom
export const counterAtom = atom(0);

// Usage in component
const [count, setCount] = useAtom(counterAtom);
```

### 2. Derived Atom

```typescript
// atoms/user.atom.ts
import { atom } from 'jotai';

interface User {
	id: number;
	name: string;
	email: string;
}

const userAtom = atom<User | null>(null);

// Derived atom
export const userNameAtom = atom((get) => get(userAtom)?.name ?? 'Anonymous');

// Read-write derived atom
export const userEmailAtom = atom(
	(get) => get(userAtom)?.email ?? '',
	(get, set, newEmail: string) => {
		const currentUser = get(userAtom);
		if (currentUser) {
			set(userAtom, { ...currentUser, email: newEmail });
		}
	},
);
```

### 3. Async Atom

```typescript
// atoms/data.atom.ts
import { atom } from 'jotai';

interface ApiData {
	id: number;
	title: string;
}

// Async read atom
export const dataAtom = atom(async (): Promise<ApiData[]> => {
	const response = await fetch('/api/data');
	return response.json();
});

// Async write atom
export const createDataAtom = atom(
	null,
	async (get, set, newData: Omit<ApiData, 'id'>) => {
		const response = await fetch('/api/data', {
			method: 'POST',
			body: JSON.stringify(newData),
		});
		const created = await response.json();

		// Update the data list
		const currentData = await get(dataAtom);
		set(dataAtom, [...currentData, created]);
	},
);
```

### 4. Complex State Atom

```typescript
// atoms/app-state.atom.ts
import { atom } from 'jotai';

interface AppState {
	user: User | null;
	theme: 'light' | 'dark';
	sidebar: {
		isOpen: boolean;
		selectedItem: string | null;
	};
}

const _appStateAtom = atom<AppState>({
	user: null,
	theme: 'light',
	sidebar: {
		isOpen: false,
		selectedItem: null,
	},
});

// Focused atoms for specific parts of state
export const userAtom = atom(
	(get) => get(_appStateAtom).user,
	(get, set, user: User | null) => {
		set(_appStateAtom, { ...get(_appStateAtom), user });
	},
);

export const themeAtom = atom(
	(get) => get(_appStateAtom).theme,
	(get, set, theme: 'light' | 'dark') => {
		set(_appStateAtom, { ...get(_appStateAtom), theme });
	},
);

export const sidebarAtom = atom(
	(get) => get(_appStateAtom).sidebar,
	(get, set, sidebar: Partial<AppState['sidebar']>) => {
		set(_appStateAtom, {
			...get(_appStateAtom),
			sidebar: { ...get(_appStateAtom).sidebar, ...sidebar },
		});
	},
);
```

## Usage in Components

### Basic Usage

```tsx
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { counterAtom } from '../atoms/counter.atom';

export const Counter = () => {
	// Read and write
	const [count, setCount] = useAtom(counterAtom);

	// Read only
	const countValue = useAtomValue(counterAtom);

	// Write only
	const setCountValue = useSetAtom(counterAtom);

	return (
		<div>
			<p>Count: {count}</p>
			<button onClick={() => setCount((c) => c + 1)}>Increment</button>
		</div>
	);
};
```

### With Async Atoms

```tsx
import { Suspense } from 'react';
import { useAtomValue } from 'jotai';
import { dataAtom } from '../atoms/data.atom';

const DataList = () => {
	const data = useAtomValue(dataAtom);

	return (
		<ul>
			{data.map((item) => (
				<li key={item.id}>{item.title}</li>
			))}
		</ul>
	);
};

export const DataPage = () => (
	<Suspense fallback={<div>Loading...</div>}>
		<DataList />
	</Suspense>
);
```

## Testing Atoms

### Basic Atom Testing

```typescript
// atoms/counter.atom.spec.ts
import { renderHook, act } from '@testing-library/react';
import { useAtom } from 'jotai';
import { describe, expect, test } from 'vitest';
import { counterAtom } from './counter.atom';

describe('counterAtom', () => {
	test('should have initial value of 0', () => {
		const { result } = renderHook(() => useAtom(counterAtom));
		expect(result.current[0]).toBe(0);
	});

	test('should increment value', () => {
		const { result } = renderHook(() => useAtom(counterAtom));

		act(() => {
			result.current[1]((prev) => prev + 1);
		});

		expect(result.current[0]).toBe(1);
	});
});
```

### Testing Derived Atoms

```typescript
// atoms/user.atom.spec.ts
import { renderHook, act } from '@testing-library/react';
import { useAtom, useAtomValue } from 'jotai';
import { describe, expect, test } from 'vitest';
import { userAtom, userNameAtom } from './user.atom';

describe('user atoms', () => {
	test('should derive username from user', () => {
		const { result: userResult } = renderHook(() => useAtom(userAtom));
		const { result: nameResult } = renderHook(() =>
			useAtomValue(userNameAtom),
		);

		expect(nameResult.current).toBe('Anonymous');

		act(() => {
			userResult.current[1]({
				id: 1,
				name: 'John',
				email: 'john@example.com',
			});
		});

		expect(nameResult.current).toBe('John');
	});
});
```

## Best Practices

### Atom Organization

- Keep atoms focused on a single concern
- Use private atoms (prefixed with `_`) for internal state
- Export public atoms that components should use
- Group related atoms in the same file

### Naming Conventions

- Use descriptive names ending with `Atom`
- For derived atoms, describe what they represent
- For action atoms, use verb names (e.g., `createUserAtom`)

### State Structure

- Keep state as flat as possible
- Use focused atoms for different parts of complex state
- Prefer primitive values over complex objects when possible

### Performance

- Use `useAtomValue` for read-only access
- Use `useSetAtom` for write-only access
- Split large atoms into smaller, focused atoms
- Use `splitAtom` for array items when needed

### TypeScript Integration

```typescript
// Define interfaces for atom state
interface TodoItem {
	id: string;
	text: string;
	completed: boolean;
}

// Use generic types for type safety
export const todosAtom = atom<TodoItem[]>([]);

// Type the atom operations
export const addTodoAtom = atom(
	null,
	(get, set, todo: Omit<TodoItem, 'id'>) => {
		const newTodo: TodoItem = {
			...todo,
			id: crypto.randomUUID(),
		};
		set(todosAtom, [...get(todosAtom), newTodo]);
	},
);
```

## Common Patterns

### Loading States

```typescript
export const loadingAtom = atom(false);
export const errorAtom = atom<string | null>(null);

export const fetchDataAtom = atom(null, async (get, set) => {
	set(loadingAtom, true);
	set(errorAtom, null);

	try {
		const data = await fetchData();
		set(dataAtom, data);
	} catch (error) {
		set(errorAtom, error.message);
	} finally {
		set(loadingAtom, false);
	}
});
```

### Local Storage Persistence

```typescript
import { atomWithStorage } from 'jotai/utils';

export const settingsAtom = atomWithStorage('app-settings', {
	theme: 'light',
	language: 'en',
});
```

### Conditional Atoms

```typescript
export const isAuthenticatedAtom = atom((get) => {
	const user = get(userAtom);
	return user !== null;
});

export const protectedDataAtom = atom(async (get) => {
	const isAuth = get(isAuthenticatedAtom);
	if (!isAuth) {
		throw new Error('Not authenticated');
	}
	return fetchProtectedData();
});
```

## Debugging

### DevTools Integration

```typescript
// Enable Jotai DevTools in development
if (process.env.NODE_ENV === 'development') {
	import('jotai-devtools').then(({ useAtomsDevtools }) => {
		// Add to your App component
		useAtomsDevtools('app-atoms');
	});
}
```

### Atom Debugging

```typescript
// Add debug labels to atoms
export const debugAtom = atom(initialValue);
debugAtom.debugLabel = 'debug-atom';
```

## Migration Guide

### From React State

```typescript
// Before (React state)
const [user, setUser] = useState(null);

// After (Jotai atom)
const [user, setUser] = useAtom(userAtom);
```

### From Context API

```typescript
// Before (Context)
const UserContext = createContext();
const useUser = () => useContext(UserContext);

// After (Jotai)
export const userAtom = atom(null);
const user = useAtomValue(userAtom);
```

This README provides comprehensive guidance for working with Jotai atoms in your application, from basic usage to advanced patterns and best practices.
