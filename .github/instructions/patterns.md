---
applyTo: 'src/**/*.{ts,tsx,cts,mts}'
description: 'Recommended patterns and best practices for React TypeScript development'
---

# React TypeScript Development Patterns

## 🚀 Quick Development Commands Reference

```bash
# start development with hot reload
pnpm start:dev

# run tests with coverage (for CI/validation)
pnpm test:dev --coverage --run

# run tests in watch mode (for development)
pnpm test:dev

# check and fix code style issues
pnpm lint

# format code
pnpm format

# build project for production
pnpm build:dev

# build project for release environment
pnpm build:release

# preview production build
pnpm preview
```

## 🏗️ Feature Organization Patterns

### Feature-Based Structure

```typescript
// src/features/user/
// ├── components/
// │   ├── UserCard.tsx
// │   ├── UserForm.tsx
// │   └── index.ts
// ├── hooks/
// │   ├── useUser.ts
// │   ├── useUserService.ts
// │   └── index.ts
// ├── pages/
// │   ├── User.page.tsx
// │   └── index.ts
// ├── types/
// │   ├── user.types.ts
// │   └── index.ts
// └── index.ts

// feature entry point: src/features/user/index.ts
export * from './components/index.ts';
export * from './hooks/index.ts';
export * from './pages/index.ts';
export * from './types/index.ts';
```

### Barrel Exports Pattern

```typescript
// src/features/user/components/index.ts
export * from './UserCard.tsx';
export * from './UserForm.tsx';
export * from './UserList.tsx';

// src/features/user/hooks/index.ts
export * from './useUser.ts';
export * from './useUserService.ts';

// src/features/index.ts
export * from './user/index.ts';
export * from './auth/index.ts';
export * from './dashboard/index.ts';
```

### Provider Pattern for Context

```typescript
// src/providers/UserProvider.tsx
interface UserContextValue {
	currentUser: User | null;
	login: (credentials: LoginCredentials) => Promise<void>;
	logout: () => void;
	updateUser: (userData: Partial<User>) => Promise<void>;
}

const UserContext = createContext<UserContextValue | null>(null);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const [currentUser, setCurrentUser] = useState<User | null>(null);

	const contextValue = useMemo(() => ({
		currentUser,
		login: async (credentials: LoginCredentials) => {
			// implementation
		},
		logout: () => {
			setCurrentUser(null);
		},
		updateUser: async (userData: Partial<User>) => {
			// implementation
		},
	}), [currentUser]);

	return (
		<UserContext.Provider value={contextValue}>
			{children}
		</UserContext.Provider>
	);
};

export const useUserContext = (): UserContextValue => {
	const context = useContext(UserContext);
	if (!context) {
		throw new Error('useUserContext must be used within UserProvider');
	}
	return context;
};
```

## 🎮 Component Patterns

### Compound Component Pattern

```typescript
// UserCard compound component
interface UserCardProps {
	user: User;
	children: React.ReactNode;
}

interface UserCardHeaderProps {
	children: React.ReactNode;
}

interface UserCardBodyProps {
	children: React.ReactNode;
}

interface UserCardActionsProps {
	children: React.ReactNode;
}

export const UserCard: React.FC<UserCardProps> & {
	Header: React.FC<UserCardHeaderProps>;
	Body: React.FC<UserCardBodyProps>;
	Actions: React.FC<UserCardActionsProps>;
} = ({ user, children }) => {
	return (
		<div className={styles.card}>
			{children}
		</div>
	);
};

UserCard.Header = ({ children }) => (
	<div className={styles.header}>{children}</div>
);

UserCard.Body = ({ children }) => (
	<div className={styles.body}>{children}</div>
);

UserCard.Actions = ({ children }) => (
	<div className={styles.actions}>{children}</div>
);

// Usage:
<UserCard user={user}>
	<UserCard.Header>
		<h2>{user.name}</h2>
	</UserCard.Header>
	<UserCard.Body>
		<p>{user.email}</p>
	</UserCard.Body>
	<UserCard.Actions>
		<button onClick={handleEdit}>Edit</button>
	</UserCard.Actions>
</UserCard>
```

### Render Props Pattern

```typescript
interface DataFetcherProps<T> {
	url: string;
	children: (data: {
		data: T | null;
		loading: boolean;
		error: string | null;
		refetch: () => void;
	}) => React.ReactNode;
}

export const DataFetcher = <T,>({ url, children }: DataFetcherProps<T>) => {
	const [data, setData] = useState<T | null>(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const fetchData = useCallback(async () => {
		setLoading(true);
		try {
			const response = await fetch(url);
			const result = await response.json();
			setData(result);
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Unknown error');
		} finally {
			setLoading(false);
		}
	}, [url]);

	useEffect(() => {
		fetchData();
	}, [fetchData]);

	return <>{children({ data, loading, error, refetch: fetchData })}</>;
};

// Usage:
<DataFetcher<User> url="/api/users/1">
	{({ data: user, loading, error }) => {
		if (loading) return <LoadingSpinner />;
		if (error) return <ErrorMessage error={error} />;
		return <UserCard user={user} />;
	}}
</DataFetcher>
```

### Higher-Order Component Pattern

```typescript
interface WithLoadingProps {
	isLoading: boolean;
}

export const withLoading = <P extends object>(
	Component: React.ComponentType<P>
) => {
	return (props: P & WithLoadingProps) => {
		const { isLoading, ...componentProps } = props;

		if (isLoading) {
			return <LoadingSpinner />;
		}

		return <Component {...(componentProps as P)} />;
	};
};

// Usage:
const UserCardWithLoading = withLoading(UserCard);

<UserCardWithLoading user={user} isLoading={isLoading} />
```

## 🪝 Custom Hooks Patterns

### Data Fetching Hook

```typescript
interface UseApiOptions<T> {
	initialData?: T;
	enabled?: boolean;
	onSuccess?: (data: T) => void;
	onError?: (error: Error) => void;
}

export const useApi = <T>(url: string, options: UseApiOptions<T> = {}) => {
	const { initialData, enabled = true, onSuccess, onError } = options;

	const [data, setData] = useState<T | null>(initialData || null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<Error | null>(null);

	const fetchData = useCallback(async () => {
		if (!enabled) return;

		setLoading(true);
		setError(null);

		try {
			const response = await fetch(url);
			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}
			const result = await response.json();
			setData(result);
			onSuccess?.(result);
		} catch (err) {
			const errorObj =
				err instanceof Error ? err : new Error('Unknown error');
			setError(errorObj);
			onError?.(errorObj);
		} finally {
			setLoading(false);
		}
	}, [url, enabled, onSuccess, onError]);

	useEffect(() => {
		fetchData();
	}, [fetchData]);

	const refetch = useCallback(() => {
		fetchData();
	}, [fetchData]);

	return {
		data,
		loading,
		error,
		refetch,
	};
};

// Usage:
const {
	data: users,
	loading,
	error,
	refetch,
} = useApi<User[]>('/api/users', {
	onSuccess: (users) => console.log('Users loaded:', users.length),
	onError: (error) => console.error('Failed to load users:', error),
});
```

### Local Storage Hook

```typescript
export const useLocalStorage = <T>(
	key: string,
	initialValue: T,
): [T, (value: T | ((val: T) => T)) => void] => {
	const [storedValue, setStoredValue] = useState<T>(() => {
		try {
			const item = window.localStorage.getItem(key);
			return item ? JSON.parse(item) : initialValue;
		} catch (error) {
			console.error(`Error reading localStorage key "${key}":`, error);
			return initialValue;
		}
	});

	const setValue = useCallback(
		(value: T | ((val: T) => T)) => {
			try {
				const valueToStore =
					value instanceof Function ? value(storedValue) : value;
				setStoredValue(valueToStore);
				window.localStorage.setItem(key, JSON.stringify(valueToStore));
			} catch (error) {
				console.error(
					`Error setting localStorage key "${key}":`,
					error,
				);
			}
		},
		[key, storedValue],
	);

	return [storedValue, setValue];
};

// Usage:
const [theme, setTheme] = useLocalStorage<'light' | 'dark'>('theme', 'light');
```

### Debounced Hook

```typescript
export const useDebounce = <T>(value: T, delay: number): T => {
	const [debouncedValue, setDebouncedValue] = useState<T>(value);

	useEffect(() => {
		const handler = setTimeout(() => {
			setDebouncedValue(value);
		}, delay);

		return () => {
			clearTimeout(handler);
		};
	}, [value, delay]);

	return debouncedValue;
};

// Usage in search component:
const SearchComponent: React.FC = () => {
	const [searchTerm, setSearchTerm] = useState('');
	const debouncedSearchTerm = useDebounce(searchTerm, 300);

	const { data: results } = useApi<SearchResult[]>(
		`/api/search?q=${debouncedSearchTerm}`,
		{ enabled: !!debouncedSearchTerm }
	);

	return (
		<div>
			<input
				type="text"
				value={searchTerm}
				onChange={(e) => setSearchTerm(e.target.value)}
				placeholder="Search..."
			/>
			{results && <SearchResults results={results} />}
		</div>
	);
};
```

## 🎨 Form Patterns with Zod

### Form Hook with Validation

```typescript
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const UserFormSchema = z.object({
	name: z.string().min(1, 'Name is required'),
	email: z.string().email('Invalid email address'),
	age: z.number().min(18, 'Must be at least 18 years old'),
	role: z.enum(['user', 'admin'], {
		errorMap: () => ({ message: 'Role must be either user or admin' })
	}),
});

type UserFormData = z.infer<typeof UserFormSchema>;

interface UseUserFormProps {
	initialData?: Partial<UserFormData>;
	onSubmit: (data: UserFormData) => Promise<void>;
}

export const useUserForm = ({ initialData, onSubmit }: UseUserFormProps) => {
	const form = useForm<UserFormData>({
		resolver: zodResolver(UserFormSchema),
		defaultValues: {
			name: '',
			email: '',
			age: 18,
			role: 'user',
			...initialData,
		},
	});

	const handleSubmit = form.handleSubmit(async (data) => {
		try {
			await onSubmit(data);
			form.reset();
		} catch (error) {
			// Handle submission error
			console.error('Form submission failed:', error);
		}
	});

	return {
		form,
		handleSubmit,
		isSubmitting: form.formState.isSubmitting,
		errors: form.formState.errors,
	};
};

// Form component:
export const UserForm: React.FC<UseUserFormProps> = (props) => {
	const { form, handleSubmit, isSubmitting, errors } = useUserForm(props);

	return (
		<form onSubmit={handleSubmit} className={styles.form}>
			<div className={styles.field}>
				<label htmlFor="name">Name</label>
				<input
					id="name"
					type="text"
					{...form.register('name')}
					className={errors.name ? styles.error : ''}
				/>
				{errors.name && (
					<span className={styles.errorMessage}>{errors.name.message}</span>
				)}
			</div>

			<div className={styles.field}>
				<label htmlFor="email">Email</label>
				<input
					id="email"
					type="email"
					{...form.register('email')}
					className={errors.email ? styles.error : ''}
				/>
				{errors.email && (
					<span className={styles.errorMessage}>{errors.email.message}</span>
				)}
			</div>

			<button type="submit" disabled={isSubmitting}>
				{isSubmitting ? 'Saving...' : 'Save User'}
			</button>
		</form>
	);
};
```

## 🛡️ Error Boundary Patterns

### Generic Error Boundary

```typescript
interface ErrorBoundaryState {
	hasError: boolean;
	error?: Error;
}

interface ErrorBoundaryProps {
	children: React.ReactNode;
	fallback?: React.ComponentType<{ error: Error; resetError: () => void }>;
	onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

export class ErrorBoundary extends React.Component<
	ErrorBoundaryProps,
	ErrorBoundaryState
> {
	constructor(props: ErrorBoundaryProps) {
		super(props);
		this.state = { hasError: false };
	}

	static getDerivedStateFromError(error: Error): ErrorBoundaryState {
		return { hasError: true, error };
	}

	componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
		this.props.onError?.(error, errorInfo);
		console.error('Error caught by boundary:', error, errorInfo);
	}

	resetError = () => {
		this.setState({ hasError: false, error: undefined });
	};

	render() {
		if (this.state.hasError && this.state.error) {
			const FallbackComponent = this.props.fallback;

			if (FallbackComponent) {
				return <FallbackComponent error={this.state.error} resetError={this.resetError} />;
			}

			return (
				<div className={styles.errorBoundary}>
					<h2>Something went wrong</h2>
					<p>{this.state.error.message}</p>
					<button onClick={this.resetError}>Try again</button>
				</div>
			);
		}

		return this.props.children;
	}
}

// Custom error fallback component:
const CustomErrorFallback: React.FC<{ error: Error; resetError: () => void }> = ({
	error,
	resetError,
}) => (
	<div className={styles.customError}>
		<h3>Oops! Something went wrong</h3>
		<details>
			<summary>Error details</summary>
			<pre>{error.message}</pre>
		</details>
		<button onClick={resetError}>Reset</button>
	</div>
);

// Usage:
<ErrorBoundary
	fallback={CustomErrorFallback}
	onError={(error, errorInfo) => {
		// Send to error reporting service
		console.error('App error:', error, errorInfo);
	}}
>
	<UserPage />
</ErrorBoundary>
```

## 📊 State Management Patterns

### Zustand Store Pattern

```typescript
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface UserState {
	users: User[];
	currentUser: User | null;
	loading: boolean;
	error: string | null;
}

interface UserActions {
	fetchUsers: () => Promise<void>;
	addUser: (user: Omit<User, 'id'>) => Promise<void>;
	updateUser: (id: number, updates: Partial<User>) => Promise<void>;
	deleteUser: (id: number) => Promise<void>;
	setCurrentUser: (user: User | null) => void;
	clearError: () => void;
}

type UserStore = UserState & UserActions;

export const useUserStore = create<UserStore>()(
	devtools(
		(set, get) => ({
			// Initial state
			users: [],
			currentUser: null,
			loading: false,
			error: null,

			// Actions
			fetchUsers: async () => {
				set({ loading: true, error: null });
				try {
					const response = await fetch('/api/users');
					const users = await response.json();
					set({ users, loading: false });
				} catch (error) {
					set({
						error: error instanceof Error ? error.message : 'Failed to fetch users',
						loading: false
					});
				}
			},

			addUser: async (userData) => {
				set({ loading: true, error: null });
				try {
					const response = await fetch('/api/users', {
						method: 'POST',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify(userData),
					});
					const newUser = await response.json();
					set((state) => ({
						users: [...state.users, newUser],
						loading: false
					}));
				} catch (error) {
					set({
						error: error instanceof Error ? error.message : 'Failed to add user',
						loading: false
					});
				}
			},

			updateUser: async (id, updates) => {
				set({ loading: true, error: null });
				try {
					const response = await fetch(`/api/users/${id}`, {
						method: 'PATCH',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify(updates),
					});
					const updatedUser = await response.json();
					set((state) => ({
						users: state.users.map((user) =>
							user.id === id ? updatedUser : user
						),
						loading: false,
					}));
				} catch (error) {
					set({
						error: error instanceof Error ? error.message : 'Failed to update user',
						loading: false
					});
				}
			},

			deleteUser: async (id) => {
				set({ loading: true, error: null });
				try {
					await fetch(`/api/users/${id}`, { method: 'DELETE' });
					set((state) => ({
						users: state.users.filter((user) => user.id !== id),
						loading: false,
					}));
				} catch (error) {
					set({
						error: error instanceof Error ? error.message : 'Failed to delete user',
						loading: false
					});
				}
			},

			setCurrentUser: (user) => set({ currentUser: user }),
			clearError: () => set({ error: null }),
		}),
		{ name: 'user-store' }
	)
);

// Usage in components:
const UserList: React.FC = () => {
	const { users, loading, error, fetchUsers, deleteUser } = useUserStore();

	useEffect(() => {
		fetchUsers();
	}, [fetchUsers]);

	if (loading) return <LoadingSpinner />;
	if (error) return <ErrorMessage error={error} />;

	return (
		<div>
			{users.map((user) => (
				<UserCard
					key={user.id}
					user={user}
					onDelete={() => deleteUser(user.id)}
				/>
			))}
		</div>
	);
};
```

## 🧪 Testing Patterns

### Component Testing

```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { UserCard } from './UserCard.tsx';

const mockUser = {
	id: 1,
	name: 'John Doe',
	email: 'john@example.com',
	role: 'user' as const,
};

describe('UserCard', () => {
	it('should render user information correctly', () => {
		render(<UserCard user={mockUser} />);

		expect(screen.getByText('John Doe')).toBeInTheDocument();
		expect(screen.getByText('john@example.com')).toBeInTheDocument();
	});

	it('should call onEdit when edit button is clicked', async () => {
		const user = userEvent.setup();
		const mockOnEdit = vi.fn();

		render(<UserCard user={mockUser} onEdit={mockOnEdit} />);

		const editButton = screen.getByRole('button', { name: /edit/i });
		await user.click(editButton);

		expect(mockOnEdit).toHaveBeenCalledWith(mockUser);
	});

	it('should not render edit button when onEdit is not provided', () => {
		render(<UserCard user={mockUser} />);

		expect(screen.queryByRole('button', { name: /edit/i })).not.toBeInTheDocument();
	});
});
```

### Hook Testing

```typescript
import { renderHook, act } from '@testing-library/react';
import { vi } from 'vitest';
import { useLocalStorage } from './useLocalStorage.ts';

// Mock localStorage
const localStorageMock = {
	getItem: vi.fn(),
	setItem: vi.fn(),
	removeItem: vi.fn(),
	clear: vi.fn(),
};

Object.defineProperty(window, 'localStorage', {
	value: localStorageMock,
});

describe('useLocalStorage', () => {
	beforeEach(() => {
		localStorageMock.getItem.mockClear();
		localStorageMock.setItem.mockClear();
	});

	it('should return initial value when localStorage is empty', () => {
		localStorageMock.getItem.mockReturnValue(null);

		const { result } = renderHook(() =>
			useLocalStorage('test-key', 'default'),
		);

		expect(result.current[0]).toBe('default');
	});

	it('should return stored value from localStorage', () => {
		localStorageMock.getItem.mockReturnValue(
			JSON.stringify('stored-value'),
		);

		const { result } = renderHook(() =>
			useLocalStorage('test-key', 'default'),
		);

		expect(result.current[0]).toBe('stored-value');
	});

	it('should update localStorage when value changes', () => {
		localStorageMock.getItem.mockReturnValue(null);

		const { result } = renderHook(() =>
			useLocalStorage('test-key', 'default'),
		);

		act(() => {
			result.current[1]('new-value');
		});

		expect(localStorageMock.setItem).toHaveBeenCalledWith(
			'test-key',
			JSON.stringify('new-value'),
		);
		expect(result.current[0]).toBe('new-value');
	});
});
```

### Integration Testing

```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { MemoryRouter } from '#libs/router';
import { UserPage } from './User.page.tsx';

// Mock fetch
global.fetch = vi.fn();

const renderWithRouter = (component: React.ReactElement) => {
	return render(
		<MemoryRouter initialEntries={['/']}>
			{component}
		</MemoryRouter>
	);
};

describe('UserPage Integration', () => {
	beforeEach(() => {
		vi.resetAllMocks();
	});

	it('should load and display user data', async () => {
		const mockUser = {
			id: 1,
			name: 'John Doe',
			email: 'john@example.com',
		};

		(fetch as unknown as vi.MockedFunction<typeof fetch>).mockResolvedValueOnce({
			ok: true,
			json: async () => mockUser,
		} as Response);

		renderWithRouter(<UserPage userId="1" />);

		// Initially shows loading
		expect(screen.getByText(/loading/i)).toBeInTheDocument();

		// Wait for user data to load
		await waitFor(() => {
			expect(screen.getByText('John Doe')).toBeInTheDocument();
		});

		expect(screen.getByText('john@example.com')).toBeInTheDocument();
	});

	it('should handle edit user flow', async () => {
		const user = userEvent.setup();
		const mockUser = {
			id: 1,
			name: 'John Doe',
			email: 'john@example.com',
		};

		// Mock initial user fetch
		(fetch as jest.MockedFunction<typeof fetch>)
			.mockResolvedValueOnce({
				ok: true,
				json: async () => mockUser,
			} as Response)
			// Mock update user
			.mockResolvedValueOnce({
				ok: true,
				json: async () => ({ ...mockUser, name: 'Jane Doe' }),
			} as Response);

		renderWithRouter(<UserPage userId="1" />);

		// Wait for user to load
		await waitFor(() => {
			expect(screen.getByText('John Doe')).toBeInTheDocument();
		});

		// Click edit button
		const editButton = screen.getByRole('button', { name: /edit/i });
		await user.click(editButton);

		// Edit form should appear
		const nameInput = screen.getByLabelText(/name/i);
		await user.clear(nameInput);
		await user.type(nameInput, 'Jane Doe');

		// Submit form
		const saveButton = screen.getByRole('button', { name: /save/i });
		await user.click(saveButton);

		// Wait for update to complete
		await waitFor(() => {
			expect(screen.getByText('Jane Doe')).toBeInTheDocument();
		});

		// Verify API was called correctly
		expect(fetch).toHaveBeenCalledWith('/api/users/1', {
			method: 'PATCH',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ name: 'Jane Doe' }),
		});
	});
});
```

## 🚀 Performance Optimization Patterns

### Memoization Patterns

```typescript
// Memoize expensive calculations
const ExpensiveComponent: React.FC<{ data: ComplexData[] }> = ({ data }) => {
	const processedData = useMemo(() => {
		return data
			.filter(item => item.isActive)
			.sort((a, b) => a.priority - b.priority)
			.map(item => ({
				...item,
				computedValue: heavyComputation(item),
			}));
	}, [data]);

	return (
		<div>
			{processedData.map(item => (
				<DataItem key={item.id} item={item} />
			))}
		</div>
	);
};

// Memoize components to prevent unnecessary re-renders
const DataItem = React.memo<{ item: ProcessedDataItem }>(({ item }) => {
	return (
		<div className={styles.item}>
			<h3>{item.name}</h3>
			<p>{item.computedValue}</p>
		</div>
	);
});

// Memoize callbacks to prevent child re-renders
const ParentComponent: React.FC = () => {
	const [filter, setFilter] = useState('');
	const [data, setData] = useState<DataItem[]>([]);

	const handleItemClick = useCallback((id: number) => {
		// Handle click without recreating function on every render
		setData(prev => prev.map(item =>
			item.id === id ? { ...item, selected: !item.selected } : item
		));
	}, []);

	const filteredData = useMemo(() =>
		data.filter(item => item.name.includes(filter)),
		[data, filter]
	);

	return (
		<div>
			<input
				value={filter}
				onChange={(e) => setFilter(e.target.value)}
				placeholder="Filter items..."
			/>
			<ItemList data={filteredData} onItemClick={handleItemClick} />
		</div>
	);
};
```

### Lazy Loading Patterns

```typescript
// Lazy load components
const LazyUserProfile = React.lazy(() => import('./UserProfile.tsx'));
const LazyAdminPanel = React.lazy(() => import('./AdminPanel.tsx'));

const App: React.FC = () => {
	return (
		<BrowserRouter>
			<Suspense fallback={<LoadingSpinner />}>
				<Routes>
					<Route path="/profile" element={<LazyUserProfile />} />
					<Route path="/admin" element={<LazyAdminPanel />} />
				</Routes>
			</Suspense>
		</BrowserRouter>
	);
};

// Lazy load data with intersection observer
export const useLazyLoad = <T>(
	fetchData: () => Promise<T>,
	options: IntersectionObserverInit = {}
) => {
	const [data, setData] = useState<T | null>(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<Error | null>(null);
	const [ref, setRef] = useState<HTMLElement | null>(null);

	useEffect(() => {
		if (!ref) return;

		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting && !data && !loading) {
					setLoading(true);
					fetchData()
						.then(setData)
						.catch(setError)
						.finally(() => setLoading(false));
				}
			},
			options
		);

		observer.observe(ref);
		return () => observer.disconnect();
	}, [ref, data, loading, fetchData, options]);

	return { data, loading, error, ref: setRef };
};

// Usage:
const LazySection: React.FC = () => {
	const { data, loading, error, ref } = useLazyLoad(
		() => fetch('/api/expensive-data').then(r => r.json()),
		{ threshold: 0.1 }
	);

	return (
		<div ref={ref} className={styles.section}>
			{loading && <LoadingSpinner />}
			{error && <ErrorMessage error={error} />}
			{data && <ExpensiveComponent data={data} />}
		</div>
	);
};
```

## 📱 Responsive and Accessibility Patterns

### Responsive Hook

```typescript
export const useMediaQuery = (query: string): boolean => {
	const [matches, setMatches] = useState(false);

	useEffect(() => {
		const media = window.matchMedia(query);
		setMatches(media.matches);

		const listener = (event: MediaQueryListEvent) => {
			setMatches(event.matches);
		};

		media.addEventListener('change', listener);
		return () => media.removeEventListener('change', listener);
	}, [query]);

	return matches;
};

export const useBreakpoint = () => {
	const isMobile = useMediaQuery('(max-width: 768px)');
	const isTablet = useMediaQuery('(min-width: 769px) and (max-width: 1024px)');
	const isDesktop = useMediaQuery('(min-width: 1025px)');

	return { isMobile, isTablet, isDesktop };
};

// Usage in component:
const ResponsiveComponent: React.FC = () => {
	const { isMobile, isTablet, isDesktop } = useBreakpoint();

	return (
		<div className={cn(
			styles.container,
			isMobile && styles.mobile,
			isTablet && styles.tablet,
			isDesktop && styles.desktop
		)}>
			{isMobile ? <MobileNav /> : <DesktopNav />}
			<main>
				{isDesktop ? (
					<div className={styles.gridLayout}>
						<Sidebar />
						<Content />
					</div>
				) : (
					<Content />
				)}
			</main>
		</div>
	);
};
```

### Accessibility Patterns

```typescript
// Focus management hook
export const useFocusManagement = () => {
	const lastFocusedElement = useRef<HTMLElement | null>(null);

	const saveFocus = useCallback(() => {
		lastFocusedElement.current = document.activeElement as HTMLElement;
	}, []);

	const restoreFocus = useCallback(() => {
		if (lastFocusedElement.current) {
			lastFocusedElement.current.focus();
		}
	}, []);

	const trapFocus = useCallback((containerRef: React.RefObject<HTMLElement>) => {
		const container = containerRef.current;
		if (!container) return;

		const focusableElements = container.querySelectorAll(
			'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
		);

		const firstElement = focusableElements[0] as HTMLElement;
		const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

		const handleTabKey = (e: KeyboardEvent) => {
			if (e.key !== 'Tab') return;

			if (e.shiftKey) {
				if (document.activeElement === firstElement) {
					lastElement.focus();
					e.preventDefault();
				}
			} else {
				if (document.activeElement === lastElement) {
					firstElement.focus();
					e.preventDefault();
				}
			}
		};

		container.addEventListener('keydown', handleTabKey);
		firstElement?.focus();

		return () => {
			container.removeEventListener('keydown', handleTabKey);
		};
	}, []);

	return { saveFocus, restoreFocus, trapFocus };
};

// Accessible modal component
export const Modal: React.FC<{
	isOpen: boolean;
	onClose: () => void;
	title: string;
	children: React.ReactNode;
}> = ({ isOpen, onClose, title, children }) => {
	const modalRef = useRef<HTMLDivElement>(null);
	const { saveFocus, restoreFocus, trapFocus } = useFocusManagement();

	useEffect(() => {
		if (isOpen) {
			saveFocus();
			const cleanup = trapFocus(modalRef);
			return cleanup;
		} else {
			restoreFocus();
		}
	}, [isOpen, saveFocus, restoreFocus, trapFocus]);

	useEffect(() => {
		const handleEscape = (e: KeyboardEvent) => {
			if (e.key === 'Escape') {
				onClose();
			}
		};

		if (isOpen) {
			document.addEventListener('keydown', handleEscape);
			document.body.style.overflow = 'hidden';
		}

		return () => {
			document.removeEventListener('keydown', handleEscape);
			document.body.style.overflow = 'unset';
		};
	}, [isOpen, onClose]);

	if (!isOpen) return null;

	return (
		<div
			className={styles.overlay}
			onClick={onClose}
			role="dialog"
			aria-modal="true"
			aria-labelledby="modal-title"
		>
			<div
				ref={modalRef}
				className={styles.modal}
				onClick={(e) => e.stopPropagation()}
			>
				<header className={styles.header}>
					<h2 id="modal-title">{title}</h2>
					<button
						onClick={onClose}
						aria-label="Close modal"
						className={styles.closeButton}
					>
						×
					</button>
				</header>
				<div className={styles.content}>
					{children}
				</div>
			</div>
		</div>
	);
};
```

This comprehensive patterns guide covers the most important React TypeScript development patterns you'll need for building scalable, maintainable applications. Each pattern includes practical examples and follows modern React best practices.
