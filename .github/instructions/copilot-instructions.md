---
applyTo: '**'
description: 'Main project instructions and development guidelines'
---

# React TypeScript Template Project Overview

This is a modern, production-ready React TypeScript template that provides a robust foundation for building scalable frontend applications. The template emphasizes developer experience, type safety, comprehensive testing, and modern React patterns.

## 🎯 Project Purpose

This template serves as a starting point for creating enterprise-grade React applications with:

- **Type-safe development** using TypeScript and Zod validation
- **Modern tooling** with Vite, Vitest, and pnpm for fast development cycles
- **Built-in libraries** for common patterns (IoC container, feature flags, routing)
- **Comprehensive testing** setup with unit tests, integration tests, and mutation testing
- **Production-ready** configuration with Docker support and environment management

## 🏗️ Architecture Overview

The project follows a modular architecture with:

- **Feature-based organization** under `src/app/pages/` and `src/app/components/`
- **Shared libraries** in `src/libs/` for reusable functionality
- **Custom hooks** for state management and business logic
- **Dependency injection** using custom IoC container with React Context
- **Environment-specific configurations** with JSON schema validation
- **Atomic design principles** with atoms, components, and layouts

## 🌐 Language Guidelines

**Programming and documentation language is English**, including:

- Variable names, function names, class names, component names
- Comments and code documentation
- Component props and interface definitions
- Error messages and logs
- README files and technical documentation

**Exception for business concepts**: When specific business entities or concepts are explicitly defined by the user (e.g., "Siniestro", "Episodio", "Encuentro", "Atención"), these domain-specific terms should be preserved in their original language when they represent core business entities that are part of the domain model.

Examples:

```typescript
// ✅ Correct - business entity preserved
export interface SiniestroProps {
	siniestro: Siniestro;
	onUpdate: (data: UpdateSiniestroData) => void;
}

export const SiniestroCard: React.FC<SiniestroProps> = ({ siniestro, onUpdate }) => {
	// implementation logic in English
	return <div>{siniestro.descripcion}</div>;
};

// ✅ Correct - technical terms in English
export const UserProfile: React.FC = () => {
	const { user, isLoading } = useUser();
	// all technical implementation in English
	return <div>{user?.name}</div>;
};
```

# Project Technology Stack

- **Framework**: React v18+ with TypeScript v5+
- **Build Tool**: Vite (fast build and dev server with HMR)
- **Router**: React Router v6+ (client-side routing)
- **Validation**: Zod v4+ (TypeScript-first schema validation)
- **Testing**: Vitest (fast unit testing framework)
- **Coverage**: Vitest Coverage V8
- **Mutation Testing**: Stryker Mutator
- **State Management**: React hooks + custom IoC container
- **Package Manager**: pnpm (fast, disk space efficient)
- **Code Quality**: ESLint + Prettier
- **Mocking**: MSW (Mock Service Worker)
- **Styling**: CSS Modules + UnoCSS (atomic CSS)

# Essential Commands

## 🚀 Quick Reference

```bash
pnpm start:dev                # Development server with HMR
pnpm test:dev --run     # Tests without coverage
pnpm test:dev --coverage --run  # Tests with coverage
pnpm test:dev           # Watch mode testing
pnpm lint               # Code quality checks
pnpm format             # Code formatting
pnpm build              # Production build
pnpm preview            # Preview production build
```

For comprehensive command documentation, see `patterns.md` quick reference section.

# Development Guidelines

## 🎯 Core Principles

- **Type Safety First**: Leverage TypeScript and Zod for complete type safety from UI to data layer
- **Test-Driven Development**: Write tests for all new functionality and maintain high test coverage
- **Component Architecture**: Organize code into reusable components with clear separation of concerns
- **Accessibility**: Ensure components are accessible and follow WCAG guidelines
- **Performance**: Optimize for Core Web Vitals and use React best practices

## 📚 Built-in Libraries Usage

### Zod Integration

- Create type-safe schemas with `z.object()`, `z.array()`, etc.
- Use Zod for form validation and API response validation
- Leverage custom validators for specialized data types
- Define schemas for component props when needed

```typescript
// ✅ Form validation example
const userSchema = z.object({
	name: z.string().min(1, 'Name is required'),
	email: z.email('Invalid email format'),
	age: z.number().min(18, 'Must be 18 or older'),
});

type UserFormData = z.infer<typeof userSchema>;
```

### IoC Container

- Use the custom IoC container for dependency injection
- Bind services and utilities at the application level
- Inject dependencies in components using `useInjection` hook
- Create scoped providers for testing and feature isolation

### Feature Flags

- Use the built-in feature flag system for gradual rollouts
- Define feature flags in configuration files
- Use `useFeature` hook to conditionally render components
- Link feature flags to localStorage for development testing

### React Router

- Use React Router v6 patterns with data loading
- Implement route-based code splitting with lazy loading
- Define routes using the type-safe routing configuration
- Use layout routes for shared UI patterns

## 🏗️ Component Development

### When creating new components:

1. **Define props interface** with TypeScript and optional Zod validation
2. **Implement component** following React best practices
3. **Add CSS Modules** for styling with UnoCSS utilities
4. **Create tests** with comprehensive coverage including user interactions
5. **Add Storybook stories** if it's a reusable component
6. **Document component** with JSDoc comments

### Component Structure:

```typescript
// ComponentName.tsx
interface ComponentNameProps {
	/** Description of the prop */
	title: string;
	/** Optional callback */
	onAction?: (data: string) => void;
}

export const ComponentName: React.FC<ComponentNameProps> = ({
	title,
	onAction,
}) => {
	// Custom hooks and state
	const { data, isLoading } = useCustomHook();

	// Event handlers
	const handleClick = useCallback(() => {
		onAction?.(data);
	}, [onAction, data]);

	// Render
	return (
		<div className={styles.container}>
			<h2 className={styles.title}>{title}</h2>
			{isLoading ? <Spinner /> : <Button onClick={handleClick}>Action</Button>}
		</div>
	);
};
```

### Best Practices:

- **Single Responsibility**: Each component should have one clear purpose
- **Composition over Inheritance**: Use composition patterns and render props
- **Performance**: Use React.memo, useMemo, and useCallback appropriately
- **Accessibility**: Include proper ARIA attributes and semantic HTML
- **Error Boundaries**: Implement error boundaries for robust error handling
- **Separation of Concerns**: Keep business logic in custom hooks

## 🧪 Testing Strategy

- **Unit Tests**: Test individual components and hooks in isolation
- **Integration Tests**: Test component interactions and user workflows
- **Mock External Dependencies**: Use MSW for API mocking and vi.mock for module mocking
- **Coverage Goals**: Maintain at least 80% code coverage across components and hooks
- **Mutation Testing**: Run periodic mutation tests to verify test quality
- **Visual Testing**: Use component snapshots for visual regression testing

### Testing Patterns:

```typescript
// Component testing example
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { UserCard } from './UserCard';

describe('UserCard', () => {
	it('should display user information correctly', () => {
		const user = { name: 'John Doe', email: 'john@example.com' };
		const onEdit = vi.fn();

		render(<UserCard user={user} onEdit={onEdit} />);

		expect(screen.getByText('John Doe')).toBeInTheDocument();
		expect(screen.getByText('john@example.com')).toBeInTheDocument();
	});

	it('should call onEdit when edit button is clicked', async () => {
		const user = { name: 'John Doe', email: 'john@example.com' };
		const onEdit = vi.fn();

		render(<UserCard user={user} onEdit={onEdit} />);

		fireEvent.click(screen.getByRole('button', { name: /edit/i }));

		expect(onEdit).toHaveBeenCalledWith(user);
	});
});
```

## 🎨 Styling Guidelines

- **CSS Modules**: Use CSS Modules for component-specific styles
- **UnoCSS**: Use atomic CSS classes for common utilities
- **Design System**: Follow consistent spacing, typography, and color schemes
- **Responsive Design**: Ensure components work across all device sizes
- **Dark Mode**: Support both light and dark themes when applicable

### Styling Structure:

```css
/* Component.module.css */
.container {
	@apply p-4 rounded-lg shadow-md;
	/* Component-specific styles */
	transition: transform 0.2s ease;
}

.container:hover {
	transform: translateY(-2px);
}

.title {
	@apply text-xl font-semibold text-gray-800;
}

.content {
	@apply mt-3 text-gray-600;
}
```

## 🔒 Security Considerations

- **Input Sanitization**: Sanitize all user inputs and validate with Zod
- **XSS Prevention**: Use React's built-in XSS protection and avoid dangerouslySetInnerHTML
- **CSRF Protection**: Implement proper CSRF tokens for state-changing operations
- **Content Security Policy**: Configure CSP headers for production deployments
- **Environment Variables**: Keep sensitive data in environment variables
- **Authentication**: Implement proper authentication and session management

## 📋 Code Review Checklist

- [ ] All new components include appropriate tests
- [ ] Component props are properly typed with TypeScript
- [ ] Zod schemas are used for form validation and data validation
- [ ] Components follow accessibility guidelines (ARIA, semantic HTML)
- [ ] CSS Modules are used for styling with proper naming conventions
- [ ] Error handling is implemented for async operations and user interactions
- [ ] Code follows established React patterns and conventions
- [ ] No hardcoded values (use environment variables or configuration)
- [ ] Performance implications have been considered (memoization, lazy loading)
- [ ] Components are responsive and work across different screen sizes

## 🚀 Deployment Preparation

- **Environment Configuration**: Ensure all required environment variables are documented
- **Build Optimization**: Verify bundle size and implement code splitting where needed
- **Dependencies**: Update package.json with any new dependencies
- **Documentation**: Update component documentation and README files
- **Testing**: Run full test suite including unit tests and integration tests
- **Build Verification**: Test the production build locally before deployment
- **Performance**: Run Lighthouse audits and optimize Core Web Vitals

# Configuration Management Rules - CRITICAL

## ❌ NEVER DO:

- Hardcode API URLs, keys, or any configuration directly in components
- Use `import.meta.env` directly in components or hooks
- Define configuration values inside component logic
- Store sensitive data in client-side code

## ✅ ALWAYS DO:

- Define non-secret config in `env/appsettings.json`
- Define secrets in `env/dev.local.env.json`, `env/qa.env.json`, etc.
- Create configuration interfaces and inject them via the IoC container
- Define configuration as far out as possible (in the app bootstrap)
- Use dependency injection for all configuration access
- Validate environment variables with Zod schemas

## 📂 Path Aliases and Import Conventions

- Use **package.json path aliases**: `#libs/ioc`, `#libs/feature`, `#libs/router`
- Always include **.ts/.tsx extension** in relative imports
- Group imports: external packages first, then internal modules, then relative imports
- Use **named imports** and avoid default exports where possible

### Import Order Example:

```typescript
// External packages
import React, { useCallback, useMemo } from 'react';
import { z } from 'zod';

// Internal libraries
import { useInjection } from '#libs/ioc';
import { useFeature } from '#libs/feature';

// Relative imports
import { UserCard } from './UserCard.tsx';
import styles from './UserList.module.css';
```

## 🚨 Common Pitfalls to Avoid

1. **Don't use `any` type** - Always provide explicit types for props and state
2. **Don't forget error handling** - Wrap async operations in try-catch or use error boundaries
3. **Don't skip validation** - Use Zod schemas for all form data and API responses
4. **Don't hardcode values** - Use environment variables and configuration
5. **Don't ignore accessibility** - Include proper ARIA attributes and semantic HTML
6. **Don't skip tests** - Create comprehensive unit and integration tests
7. **Don't ignore performance** - Use React.memo, useMemo, and useCallback appropriately
8. **Don't mix concerns** - Keep components focused, move business logic to custom hooks
9. **Don't forget responsive design** - Ensure components work on all screen sizes
10. **Don't ignore loading states** - Always provide feedback for async operations

## 🔧 Custom Hooks Patterns

### Data Fetching Hook:

```typescript
export const useUserData = (userId: string) => {
	const [data, setData] = useState<User | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const httpClient = useInjection(HttpClient);

	useEffect(() => {
		const fetchUser = async () => {
			try {
				setIsLoading(true);
				setError(null);
				const user = await httpClient.get(`/users/${userId}`);
				setData(user);
			} catch (err) {
				setError(err instanceof Error ? err.message : 'Unknown error');
			} finally {
				setIsLoading(false);
			}
		};

		if (userId) {
			fetchUser();
		}
	}, [userId, httpClient]);

	return { data, isLoading, error, refetch: () => fetchUser() };
};
```

### Form Hook with Validation:

```typescript
export const useUserForm = (initialData?: Partial<User>) => {
	const [data, setData] = useState(initialData || {});
	const [errors, setErrors] = useState<Record<string, string>>({});

	const userSchema = z.object({
		name: z.string().min(1, 'Name is required'),
		email: z.string().email('Invalid email format'),
		age: z.number().min(18, 'Must be 18 or older'),
	});

	const validateField = useCallback((field: string, value: any) => {
		try {
			userSchema.pick({ [field]: true }).parse({ [field]: value });
			setErrors((prev) => ({ ...prev, [field]: '' }));
			return true;
		} catch (error) {
			if (error instanceof z.ZodError) {
				setErrors((prev) => ({
					...prev,
					[field]: error.errors[0].message,
				}));
			}
			return false;
		}
	}, []);

	const validateAll = useCallback(() => {
		try {
			userSchema.parse(data);
			setErrors({});
			return true;
		} catch (error) {
			if (error instanceof z.ZodError) {
				const newErrors: Record<string, string> = {};
				error.errors.forEach((err) => {
					if (err.path[0]) {
						newErrors[err.path[0] as string] = err.message;
					}
				});
				setErrors(newErrors);
			}
			return false;
		}
	}, [data]);

	return {
		data,
		errors,
		setData,
		validateField,
		validateAll,
		isValid: Object.keys(errors).length === 0,
	};
};
```

## 🤖 GitHub Copilot Best Practices

### Essential npm Scripts for Development

Always use these specific commands in the project:

```bash
# Development - Start development server with hot reload
pnpm start:dev

# Testing - Run tests with coverage for validation
pnpm test:dev --coverage --run

# Testing - Watch mode for development
pnpm test:dev

# Linting - Check and fix code style/errors
pnpm lint

# Formatting - Format code with Prettier
pnpm format

# Building - Build for production
pnpm build

# Preview - Preview production build
pnpm preview
```

## 📝 Commit Guidelines

**ALWAYS use Conventional Commits with Gitmojis for all commit messages:**

### Commit Message Format

```
<type>[optional scope] <gitmoji>: <description>

[optional body]

[optional footer(s)]
```

### Examples

```bash
feat(auth) ✨: add JWT authentication middleware
fix(api) 🐛: resolve validation error in user creation endpoint
docs(readme) 📚: update installation instructions
style(components) 🎨: improve code formatting and structure
refactor(services) ♻️: extract common database operations
test(users) ✅: add integration tests for user CRUD operations
chore(deps) 🔧: update dependencies to latest versions
perf(database) ⚡: optimize query performance with indexes
feat ✨: v2025.1
```

### Common Gitmoji Types

- **✨ `:sparkles:`** - New features
- **🐛 `:bug:`** - Bug fixes
- **📚 `:books:`** - Documentation
- **🎨 `:art:`** - Code structure/format improvements
- **⚡ `:zap:`** - Performance improvements
- **✅ `:white_check_mark:`** - Tests
- **🔧 `:wrench:`** - Configuration changes
- **♻️ `:recycle:`** - Refactoring
- **🚀 `:rocket:`** - Deployment/releases
- **🔒 `:lock:`** - Security improvements
- **💄 `:lipstick:`** - UI/UX improvements
- **🚚 `:truck:`** - Moving/renaming files
- **🗑️ `:wastebasket:`** - Removing code/files
- **🩹 `:adhesive_bandage:`** - Simple fixes
- **📦 `:package:`** - Package/dependency updates

### Conventional Commit Types

- **feat**: New feature for the user
- **fix**: Bug fix for the user
- **docs**: Documentation changes
- **style**: Formatting, missing semicolons, etc.
- **refactor**: Code change that neither fixes a bug nor adds a feature
- **perf**: Performance improvements
- **test**: Adding missing tests or correcting existing tests
- **chore**: Build process or auxiliary tool changes
- **ci**: Changes to CI configuration files and scripts
- **build**: Changes that affect the build system or external dependencies

### Dependency Injection & Configuration Rules

**CRITICAL**: Never use hardcoded variables directly in code. All configuration must be:

1. **Defined externally** - All URLs, settings, and configurations in environment files
2. **Injected through IoC container** - Variables defined at the outermost layer
3. **Parametrizable** - Everything should be configurable via dependency injection
4. **Clean & Testable** - Keep business logic free from direct dependencies

**Example Pattern**:

```typescript
// ❌ WRONG - Hardcoded URL
const response = await fetch('https://api.example.com/users');

// ✅ CORRECT - Injected configuration
export const UserService: React.FC = () => {
	const httpClient = useInjection(HttpClient);
	const config = useInjection(AppConfig);

	const fetchUsers = async () => {
		return httpClient.get(`${config.apiBaseUrl}/users`);
	};
};
```

### Mock Service Worker (MSW) Integration

When integrating with APIs that don't exist yet, use the integrated MSW mock server:

**Location**: `src/__msw__/handlers.ts`

**Pattern**:

```typescript
import { http, HttpResponse } from 'msw';
import { faker } from '@faker-js/faker';

export const handlers = [
	// GET endpoint example
	http.get('*/api/users/:id', ({ params }) => {
		return HttpResponse.json({
			id: params.id,
			name: faker.person.fullName(),
			email: faker.internet.email(),
		});
	}),

	// POST endpoint example
	http.post('*/api/users', async ({ request }) => {
		const newUser = await request.json();
		return HttpResponse.json(
			{
				...newUser,
				id: faker.string.uuid(),
			},
			{ status: 201 },
		);
	}),
];
```

### Component Generation Best Practices

#### Write Descriptive Comments for Better Suggestions

```typescript
/**
 * User profile component that displays user information with edit capabilities.
 * Handles loading states, error conditions, and form validation.
 * Integrates with custom IoC container for dependency injection.
 *
 * @param user - User data object with id, name, and email
 * @param onEdit - Callback function triggered when edit button is clicked
 * @param isEditable - Controls whether edit functionality is available
 * @returns JSX element with accessible user profile interface
 */
export const UserProfile: React.FC<UserProfileProps> = ({
	user,
	onEdit,
	isEditable = true,
}) => {
	// Copilot will generate better implementation with this context
};
```

#### Use Specific Function Names

```typescript
// Good - Clear intent for Copilot
const useUserProfileWithEditCapabilities = (userId: string) => { ... }
const validateEmailAndPasswordForm = (formData: FormData) => { ... }
const fetchUserDataWithErrorHandling = async (id: string) => { ... }

// Less helpful for Copilot
const useUser = (id: string) => { ... }
const validate = (data: any) => { ... }
const fetch = async (id: string) => { ... }
```

#### Provide Context with Type Definitions

```typescript
interface UserProfileProps {
	/** User data with personal information */
	user: {
		id: string;
		name: string;
		email: string;
		avatar?: string;
	};
	/** Callback triggered when user initiates edit mode */
	onEdit: (user: User) => void;
	/** Controls visibility of edit buttons and form fields */
	isEditable?: boolean;
	/** Loading state for async operations */
	isLoading?: boolean;
}

// Now Copilot understands the context better
export const UserProfile: React.FC<UserProfileProps> = ({
	user,
	onEdit,
	isEditable = true,
	isLoading = false,
}) => {
	// Copilot will suggest appropriate component implementation
};
```

### Custom Prompts for Better Code Generation

#### For Components:

```
Create a React component for [feature] with:
- React.FC type with proper props interface
- CSS Modules for styling with UnoCSS utilities
- Accessibility attributes (ARIA labels, roles)
- Loading and error states
- Integration with custom IoC container
- Proper TypeScript types
- JSDoc documentation
- Unit tests with React Testing Library
- Responsive design considerations
```

#### For Custom Hooks:

```
Create a custom React hook for [functionality] with:
- Use prefix in function name
- Proper TypeScript return types
- Loading and error state management
- Cleanup with useEffect
- Memoization for expensive operations
- Integration with IoC container when needed
- Comprehensive unit tests
```

#### For Pages:

```
Create a React page component for [feature] with:
- .page.tsx suffix
- Layout integration (AppLayout or custom)
- Route parameter handling with TypeScript
- Data fetching with loading states
- Error boundaries for error handling
- SEO meta tags and accessibility
- Responsive design patterns
```

### Testing Prompts for Copilot

```typescript
/**
 * Create comprehensive tests for this component including:
 * - Component rendering with different props
 * - User interactions and event handlers
 * - Loading, error, and success states
 * - Accessibility features testing
 * - Edge cases and error scenarios
 * - Integration with mocked dependencies
 * - Keyboard navigation and screen reader compatibility
 */
```

### VS Code Settings for Optimal Copilot Experience

Add these settings to your VS Code `settings.json`:

```json
{
	"github.copilot.enable": {
		"*": true,
		"yaml": false,
		"plaintext": false
	},
	"github.copilot.advanced": {
		"listCount": 10,
		"inlineSuggestCount": 3
	},
	"github.copilot.editor.enableAutoCompletions": true,
	"github.copilot.editor.enableCodeActions": true,
	"github.copilot.chat.enabled": true,
	"github.copilot.chat.welcomeMessage": "always",
	"github.copilot.renameSuggestions.triggerAutomatically": true,
	"github.copilot.suggestions.experimental.enabled": true
}
```

This comprehensive setup ensures that GitHub Copilot generates code that follows the project's architecture, coding standards, and best practices consistently.
