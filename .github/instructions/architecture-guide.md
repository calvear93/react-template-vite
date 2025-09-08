---
applyTo: 'src/**/*'
description: 'Structural patterns and conventions'
---

# Project Architecture Guide

## 📁 Page Structure Pattern

Each page follows a strict hierarchical pattern under `src/app/pages/`:

```
src/app/pages/{page-name}/
├── {PageName}.page.tsx                  # Main page component
├── {PageName}.page.module.css           # Page-specific styles
├── {PageName}.page.spec.tsx             # Page component tests
├── components/                          # Page-specific components
│   ├── {Component}.tsx                  # Reusable components
│   ├── {Component}.module.css           # Component styles
│   └── {Component}.spec.tsx             # Component tests
├── atoms/                               # Page-specific state atoms
│   ├── {feature}.atom.ts                # State management
│   └── {feature}.atom.spec.ts           # Atom tests
└── __mocks__/                           # Mock data for testing
    └── {mock-name}.mock.ts              # Test mock implementations
```

## 🧩 Component Structure Pattern

Reusable components are organized under `src/app/` with consistent structure:

```
src/app/components/{component-category}/
├── {ComponentName}.tsx                  # Component implementation
├── {ComponentName}.module.css           # Component styles
├── {ComponentName}.spec.tsx             # Component tests
├── {ComponentName}.stories.tsx          # Storybook stories (optional)
└── types/                               # Component-specific types
    └── {component}.types.ts             # TypeScript interfaces
```

## 🔧 Library Structure Pattern

Custom libraries are organized under `src/libs/` with consistent structure:

```
src/libs/{library-name}/
├── index.ts                    # Public API exports
├── README.md                   # Library documentation
├── {main-functionality}.ts     # Core implementation
├── exceptions/                 # Custom exceptions
├── react/                      # React-specific implementations
│   ├── {feature}.hook.ts       # Custom hooks
│   ├── {feature}.hook.spec.tsx # Hook tests
│   ├── {Feature}.provider.tsx  # Context providers
│   └── {feature}.hoc.tsx       # Higher-order components
├── types/                      # TypeScript type definitions
├── __mocks__/                  # Mock implementations for testing
└── {library-name}.spec.ts      # Library unit tests
```

## 🎯 Configuration Architecture

### Environment Configuration Pattern

```typescript
// env/settings/settings.ts
import { z } from 'zod';

const AppConfigSchema = z.object({
	apiUrl: z.url(),
	timeout: z.coerce.number().default(10000),
	retries: z.coerce.number().default(3),
	enableFeatureFlags: z.coerce.boolean().default(false),
});

export type AppConfig = z.infer<typeof AppConfigSchema>;

export const appConfig = (): AppConfig => {
	return AppConfigSchema.parse({
		apiUrl: import.meta.env.VITE_API_URL,
		timeout: import.meta.env.VITE_API_TIMEOUT,
		retries: import.meta.env.VITE_API_RETRIES,
		enableFeatureFlags: import.meta.env.VITE_ENABLE_FEATURE_FLAGS,
	});
};
```

### IoC Container Configuration

```typescript
// app.ioc.ts
import { createContainer } from '#libs/ioc';
import { appConfig } from '../env/settings/settings.js';

export const { container, useInjection, InversionOfControlProvider } =
	createContainer();

// Configuration binding
container.bind('APP_CONFIG', appConfig());

// Service bindings
container.bind(HttpClient, new HttpClient(appConfig().apiUrl));
container.bind(UserService, new UserService());
```

## 🎯 Implementation Patterns

### Schema Validation Pattern

```typescript
// pages/user/schemas/user.schema.ts
import { z } from 'zod';

export const UserSchema = z.object({
	id: z.number().optional(),
	name: z.string().min(1, 'Name is required').max(100),
	email: z.email('Invalid email format'),
	createdAt: z.date().optional(),
	isActive: z.boolean().default(true),
});

export type User = z.infer<typeof UserSchema>;

// For create operations (exclude auto-generated fields)
export const CreateUserSchema = UserSchema.omit({
	id: true,
	createdAt: true,
});

export type CreateUserData = z.infer<typeof CreateUserSchema>;

// For update operations (make all fields optional)
export const UpdateUserSchema = UserSchema.partial();

export type UpdateUserData = z.infer<typeof UpdateUserSchema>;
```

### Component Pattern

```typescript
// components/user/UserCard.tsx
import React, { useState } from 'react';
import { useInjection } from './app.ioc.ts'; // adjust path based on component location
import { UserService } from './services/user.service.ts';
import { User, UpdateUserData } from './schemas/user.schema.ts';
import styles from './UserCard.module.css';

interface UserCardProps {
  /** User data to display */
  user: User;
  /** Callback when user is updated */
  onUpdate?: (user: User) => void;
  /** Loading state */
  isLoading?: boolean;
}

/**
 * UserCard - Displays user information with edit capabilities
 */
export const UserCard: React.FC<UserCardProps> = ({
	user,
	onUpdate,
	isLoading = false
}) => {
	const [isEditing, setIsEditing] = useState(false);
	const userService = useInjection(UserService);

	const handleUpdate = async (data: UpdateUserData) => {
		try {
			const updatedUser = await userService.updateUser(user.id!, data);
			onUpdate?.(updatedUser);
			setIsEditing(false);
		} catch (error) {
			console.error('Failed to update user:', error);
		}
	};

	if (isLoading) {
		return <div className={styles.loading}>Loading...</div>;
	}

	return (
		<div className={styles.card}>
			{/* Component implementation */}
		</div>
	);
};
```

### Custom Hook Pattern

```typescript
// hooks/useUser.ts
import { useState, useEffect } from 'react';
import { useInjection } from './app.ioc.ts'; // adjust path based on component location
import { UserService } from '../services/user.service.ts';
import {
	User,
	CreateUserData,
	UpdateUserData,
} from '../schemas/user.schema.ts';

export const useUser = (userId?: number) => {
	const [user, setUser] = useState<User | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const userService = useInjection(UserService);

	const fetchUser = async (id: number) => {
		setIsLoading(true);
		setError(null);
		try {
			const userData = await userService.getUser(id);
			setUser(userData);
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Unknown error');
		} finally {
			setIsLoading(false);
		}
	};

	const createUser = async (data: CreateUserData) => {
		setIsLoading(true);
		try {
			const newUser = await userService.createUser(data);
			setUser(newUser);
			return newUser;
		} catch (err) {
			setError(
				err instanceof Error ? err.message : 'Failed to create user',
			);
			throw err;
		} finally {
			setIsLoading(false);
		}
	};

	const updateUser = async (data: UpdateUserData) => {
		if (!user) return;
		setIsLoading(true);
		try {
			const updatedUser = await userService.updateUser(user.id!, data);
			setUser(updatedUser);
			return updatedUser;
		} catch (err) {
			setError(
				err instanceof Error ? err.message : 'Failed to update user',
			);
			throw err;
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		if (userId) {
			fetchUser(userId);
		}
	}, [userId]);

	return {
		user,
		isLoading,
		error,
		createUser,
		updateUser,
		refetch: () => (userId ? fetchUser(userId) : Promise.resolve()),
	};
};
```

### Service Pattern

```typescript
// services/user.service.ts
import {
	User,
	CreateUserData,
	UpdateUserData,
} from '../schemas/user.schema.ts';

export class UserService {
	private baseUrl: string;

	constructor(baseUrl: string = '/api/users') {
		this.baseUrl = baseUrl;
	}

	async getUser(id: number): Promise<User> {
		const response = await fetch(`${this.baseUrl}/${id}`);
		if (!response.ok) {
			throw new Error(`Failed to fetch user: ${response.statusText}`);
		}
		return response.json();
	}

	async createUser(data: CreateUserData): Promise<User> {
		const response = await fetch(this.baseUrl, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(data),
		});
		if (!response.ok) {
			throw new Error(`Failed to create user: ${response.statusText}`);
		}
		return response.json();
	}

	async updateUser(id: number, data: UpdateUserData): Promise<User> {
		const response = await fetch(`${this.baseUrl}/${id}`, {
			method: 'PATCH',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(data),
		});
		if (!response.ok) {
			throw new Error(`Failed to update user: ${response.statusText}`);
		}
		return response.json();
	}
}
```

### Page Component Pattern

```typescript
// pages/user/User.page.tsx
import React from 'react';
import { useParams } from 'react-router-dom';
import { useUser } from './hooks/useUser.ts';
import { UserCard } from './components/UserCard.tsx';
import { LoadingSpinner } from '#app/components/ui/LoadingSpinner.tsx';
import { ErrorMessage } from '#app/components/ui/ErrorMessage.tsx';
import styles from './User.page.module.css';

export const UserPage: React.FC = () => {
	const { userId } = useParams<{ userId: string }>();
	const { user, isLoading, error, updateUser } = useUser(
		userId ? parseInt(userId, 10) : undefined
	);

	if (isLoading) {
		return <LoadingSpinner />;
	}

	if (error) {
		return <ErrorMessage message={error} />;
	}

	if (!user) {
		return <ErrorMessage message="User not found" />;
	}

	return (
		<div className={styles.container}>
			<h1 className={styles.title}>User Profile</h1>
			<UserCard
				user={user}
				onUpdate={updateUser}
      />
    </div>
  );
};
```

## 📦 Router Configuration Pattern

### Route definitions

```typescript
// app.routes.tsx
import { lazy } from 'react';
import type { RouteObject } from 'react-router-dom';

const UserPage = lazy(() => import('./pages/user/User.page.tsx'));
const HomePage = lazy(() => import('./pages/main/Main.page.tsx'));

export const routes: RouteObject[] = [
  {
    path: '/',
    element: <HomePage />,
  },
  {
    path: '/users/:userId',
    element: <UserPage />,
  },
];
```

### Router setup

```typescript
// App.router.tsx
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { routes } from './app.routes.tsx';
import { AppLayout } from './layouts/app/App.layout.tsx';

const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: routes,
  },
]);

export const AppRouter: React.FC = () => {
  return <RouterProvider router={router} />;
};
```

## 🛠️ Testing Structure

### Test file placement

- Place `.spec.tsx` files alongside their corresponding source files
- Use the same directory structure for tests as for source code

### Test naming convention

- Component tests: `{ComponentName}.spec.tsx`
- Hook tests: `{hookName}.hook.spec.tsx`
- Page tests: `{PageName}.page.spec.tsx`
- Service tests: `{service-name}.service.spec.ts`

### Test patterns

```typescript
// Component test with IoC dependency injection
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { InversionOfControlProvider } from '../../app.ioc.ts';
import { UserCard } from './UserCard.tsx';

describe('UserCard', () => {
	it('should render user information correctly with injected dependencies', () => {
		const user = { id: 1, name: 'John Doe', email: 'john@example.com' };

		// Mock IoC container dependencies
		const mockIoCValues = new Map();
		mockIoCValues.set('USER_SERVICE', mockUserService);
		mockIoCValues.set('CONFIG_SERVICE', mockConfigService);

		render(
			<InversionOfControlProvider values={mockIoCValues}>
				<UserCard user={user} />
			</InversionOfControlProvider>,
		);

		expect(screen.getByText('John Doe')).toBeInTheDocument();
		expect(screen.getByText('john@example.com')).toBeInTheDocument();
	});
});

// Hook test example
describe('useUser', () => {
	it('should fetch user data on mount', async () => {
		const { result, waitForNextUpdate } = renderHook(() => useUser(1));

		expect(result.current.isLoading).toBe(true);
		await waitForNextUpdate();
		expect(result.current.user).toBeDefined();
	});
});
```

## 🔍 Import Path Conventions

### Relative imports within page/component

```typescript
// Within the same page/component, use relative imports
import { UserService } from '../services/user.service.ts';
import { UserSchema } from '../schemas/user.schema.ts';
import { useUser } from '../hooks/useUser.ts';
```

### Absolute imports for libraries

```typescript
// For shared libraries, use path aliases
import { useInjection } from './app.ioc.ts'; // adjust path based on component location
import { useFeature } from '#libs/feature';
import { useRouter } from '#libs/router';
```

### Cross-component imports

```typescript
// For other components/pages, use absolute paths from app
import { LoadingSpinner } from '#app/components/ui/LoadingSpinner.tsx';
import { UserCard } from '#app/components/user/UserCard.tsx';
```

## 📝 Documentation Requirements

### Component documentation

- Each component should include JSDoc comments with usage examples
- Document all props with TypeScript interfaces and JSDoc descriptions
- Include accessibility notes and usage guidelines

### README files

- Each library must include a comprehensive README.md
- Include examples, API reference, and usage instructions
- Document all public interfaces and methods

## 🔒 Security Architecture Principles

### Authentication Strategy

- Implement secure authentication state management
- Use HTTP-only cookies for sensitive tokens when possible
- Validate user input with Zod schemas on client and server
- Implement proper error boundaries for graceful error handling

### Validation Strategy

- All form data must use Zod schemas for validation
- Validate API responses for type safety
- Handle validation errors with user-friendly messages
- Sanitize user inputs to prevent XSS attacks

## 🏗️ Performance Guidelines

### Component Organization

- Keep components focused and cohesive
- Separate concerns between UI, logic, and data fetching
- Use dependency injection properly via IoC container
- Export only necessary public interfaces

### React Performance

- Use React.memo for expensive components
- Implement useMemo and useCallback for optimization
- Lazy load components and pages for code splitting
- Optimize re-renders with proper state management

### Import Strategy

- Use barrel exports (index.ts) for clean public APIs
- Avoid circular dependencies between components
- Use absolute imports for shared libraries (#libs/\*)
- Group imports logically (external → internal → relative)

## 📝 Documentation Standards

### Required Documentation

- Each component should have JSDoc comments with usage examples
- Document all props with TypeScript interfaces
- Include comprehensive README.md files for all libraries
- Add accessibility guidelines for interactive components

### Documentation Structure

- JSDoc comments for components and hooks
- Usage examples for different scenarios
- Accessibility notes and ARIA requirements
- Complete API reference for public interfaces

## 🎨 Styling Architecture

### CSS Modules Strategy

- Use CSS Modules for component-specific styles
- Apply UnoCSS utilities for common patterns
- Follow consistent naming conventions (camelCase)
- Organize styles logically within components

### Responsive Design

- Mobile-first responsive design approach
- Use CSS Grid and Flexbox for layouts
- Implement consistent spacing and typography
- Support both light and dark themes
