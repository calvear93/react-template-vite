---
mode: agent
description: 'Create a new React page component following React TypeScript template best practices'
---

# React Page Creation Prompt

Create a new React page component for [PAGE_DESCRIPTION] following these requirements:

## Core Requirements

### 1. Page Structure

- Use `.page.tsx` suffix for page components
- Implement functional component with React.FC type
- Follow React Router v6+ patterns for routing
- Integrate with layout components (AppLayout or custom)

### 2. Data Management

- Handle route parameters with proper TypeScript typing
- Implement data fetching with loading states
- Use custom hooks for complex data operations
- Integrate with custom IoC container for services

### 3. State Management

- Use React hooks for page-level state
- Implement proper loading, error, and success states
- Handle form submissions and user interactions
- Manage URL state and navigation

### 4. User Experience

- Include SEO meta tags and proper document titles
- Implement responsive design for all device sizes
- Add proper loading indicators and error boundaries
- Handle authentication and authorization

### 5. Error Handling

- Implement error boundaries for graceful failure
- Provide meaningful error messages to users
- Handle network errors and timeout scenarios
- Include retry mechanisms for failed operations

## Implementation Patterns

### Basic Page Template

```typescript
interface PageNameProps {
	/** Route parameters from React Router */
	// Define specific params if known, e.g.: { id: string }
}

/**
 * [Page description explaining purpose and functionality]
 * Handles [specific features] with proper error handling and loading states.
 *
 * @returns JSX element with complete page layout
 */
export const PageName: React.FC = () => {
	const params = useParams<{ id: string }>();
	const navigate = useNavigate();

	// Page implementation
	return (
		<AppLayout>
			{/* Page content */}
		</AppLayout>
	);
};
```

### Page with Data Fetching

```typescript
import { useParams } from 'react-router-dom';
import { useInjection } from '../app.ioc.ts'; // adjust path based on page location

export const UserPage: React.FC = () => {
	const { id } = useParams<{ id: string }>();
	const httpClient = useInjection(HttpClient);

	const [user, setUser] = useState<User | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const fetchUser = async () => {
			try {
				setIsLoading(true);
				setError(null);
				const userData = await httpClient.get(`/users/${id}`);
				setUser(userData);
			} catch (err) {
				setError(err instanceof Error ? err.message : 'Failed to load user');
			} finally {
				setIsLoading(false);
			}
		};

		if (id) {
			fetchUser();
		}
	}, [id, httpClient]);

	if (isLoading) return <LoadingSpinner />;
	if (error) return <ErrorMessage error={error} />;
	if (!user) return <NotFound />;

	return (
		<AppLayout>
			<UserProfile user={user} />
		</AppLayout>
	);
};
```

### Page with Form Handling

```typescript
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { useInjection } from '../app.ioc.ts'; // adjust path based on page location

const FormSchema = z.object({
	title: z.string().min(1, 'Title is required'),
	description: z.string().optional(),
});

type FormData = z.infer<typeof FormSchema>;

export const CreateItemPage: React.FC = () => {
	const navigate = useNavigate();
	const httpClient = useInjection(HttpClient);

	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const handleSubmit = async (data: FormData) => {
		try {
			setIsSubmitting(true);
			setError(null);

			const result = await httpClient.post('/items', data);
			navigate(`/items/${result.id}`);
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Failed to create item');
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<AppLayout>
			<CreateItemForm
				onSubmit={handleSubmit}
				isSubmitting={isSubmitting}
				error={error}
			/>
		</AppLayout>
	);
};
```

## Technical Checklist

### Essential Features

- [ ] `.page.tsx` suffix used for file naming
- [ ] React.FC implementation with proper TypeScript
- [ ] Route parameters handled with useParams<T>
- [ ] Navigation implemented with useNavigate
- [ ] Layout component integration (AppLayout)
- [ ] Loading states for all async operations
- [ ] Error boundaries and error handling
- [ ] Responsive design implementation

### Data Management

- [ ] Custom IoC container integration (useInjection from ./app.ioc.ts)
- [ ] Proper data fetching patterns
- [ ] Loading, error, and success state management
- [ ] Form validation with Zod schemas
- [ ] URL state management when applicable
- [ ] Cleanup of subscriptions and effects

### User Experience

- [ ] SEO meta tags and document title
- [ ] Accessibility features (ARIA, semantic HTML)
- [ ] Loading indicators and progress feedback
- [ ] Error messages with retry options
- [ ] Responsive design for all screen sizes
- [ ] Keyboard navigation support

### Authentication & Security

- [ ] Authentication status checking
- [ ] Authorization for protected pages
- [ ] Proper error handling for auth failures
- [ ] Secure handling of sensitive data
- [ ] CSRF protection for form submissions

### Testing & Documentation

- [ ] Unit tests for page rendering
- [ ] Integration tests for data fetching
- [ ] User interaction testing
- [ ] Error scenario testing
- [ ] JSDoc documentation
- [ ] Accessibility testing

### Performance

- [ ] Code splitting with lazy loading
- [ ] Memoization for expensive operations
- [ ] Efficient re-rendering patterns
- [ ] Proper cleanup to prevent memory leaks
- [ ] Optimized bundle size

## Navigation Patterns

### Route Configuration

```typescript
// In route configuration
{
	path: '/users/:id',
	element: <UserPage />,
	errorElement: <ErrorBoundary />,
	loader: async ({ params }) => {
		// Pre-load data if needed
		return { userId: params.id };
	}
}
```

### Protected Routes

```typescript
export const ProtectedPage: React.FC = () => {
	const { isAuthenticated } = useAuth();
	const navigate = useNavigate();

	useEffect(() => {
		if (!isAuthenticated) {
			navigate('/login', { replace: true });
		}
	}, [isAuthenticated, navigate]);

	if (!isAuthenticated) {
		return <LoadingSpinner />;
	}

	return (
		<AppLayout>
			{/* Protected content */}
		</AppLayout>
	);
};
```

Generate the page component following these patterns and ensure it integrates seamlessly with the existing React TypeScript architecture and routing system.
