# IOC (Inversion of Control)

This library provides a lightweight Inversion of Control (IoC) container for React applications using Jotai atoms. It enables dependency injection patterns with type safety and React integration.

## Overview

The IOC library offers:

- **Dependency Injection**: Manage and inject dependencies throughout your application
- **Type Safety**: Full TypeScript support with strongly typed injections
- **React Integration**: Seamless integration with React components and hooks
- **Atom-based**: Built on Jotai atoms for optimal performance and reactivity
- **Scoped Providers**: Support for multiple container scopes within the same application

## Core Concepts

### Container

A container manages dependency bindings and provides resolution mechanisms. Each container maintains its own isolated set of dependencies.

### Binding

The process of associating a token (class constructor or string) with a concrete implementation or instance.

### Injection

The process of retrieving a dependency from the container using its token.

## Getting Started

### Creating a Container

```typescript
// app.ioc.ts
import { createContainer } from '@libs/ioc';

export const {
	InversionOfControlProvider,
	useInjection,
	container
} = createContainer();

// Define tokens for string-based bindings
export const HTTP_CLIENT = 'HTTP_CLIENT';
export const CONFIG_SERVICE = 'CONFIG_SERVICE';
```

### Setting Up the Provider

Wrap your application with the IoC provider:

```tsx
// App.tsx
import { InversionOfControlProvider } from './app.ioc';

export const App = () => (
	<InversionOfControlProvider>
		<MyApplication />
	</InversionOfControlProvider>
);
```

### Binding Dependencies

#### Class-based Binding

```typescript
// services/HttpClient.ts
export class HttpClient {
	async get(url: string) {
		return fetch(url);
	}
}

// app.ioc.ts
import { HttpClient } from './services/HttpClient';

// Bind using class constructor as token
container.bind(HttpClient, new HttpClient());
```

#### Token-based Binding

```typescript
// services/ConfigService.ts
export interface IConfigService {
	getApiUrl(): string;
	isFeatureEnabled(feature: string): boolean;
}

export class ConfigService implements IConfigService {
	getApiUrl() {
		return import.meta.env.VITE_API_URL;
	}

	isFeatureEnabled(feature: string) {
		return import.meta.env[`VITE_${feature}`] === 'true';
	}
}

// app.ioc.ts
export const CONFIG_SERVICE = 'CONFIG_SERVICE';

container.bind(CONFIG_SERVICE, new ConfigService());
```

## Usage in Components

### Using Class Tokens

```tsx
import { useInjection } from './app.ioc';
import { HttpClient } from './services/HttpClient';

export const UserProfile = () => {
	const httpClient = useInjection(HttpClient);

	const [user, setUser] = useState(null);

	useEffect(() => {
		httpClient.get('/api/user/profile')
			.then(response => response.json())
			.then(setUser);
	}, [httpClient]);

	return <div>{user?.name}</div>;
};
```

### Using String Tokens

```tsx
import { useInjection, CONFIG_SERVICE } from './app.ioc';
import type { IConfigService } from './services/ConfigService';

export const ApiComponent = () => {
	const config = useInjection<IConfigService>(CONFIG_SERVICE);
	const apiUrl = config.getApiUrl();

	const isNewFeatureEnabled = config.isFeatureEnabled('NEW_FEATURE');

	return (
		<div>
			<p>API URL: {apiUrl}</p>
			{isNewFeatureEnabled && <NewFeatureComponent />}
		</div>
	);
};
```

## Advanced Patterns

### Factory Pattern

```typescript
// factories/ApiClientFactory.ts
export class ApiClientFactory {
	constructor(
		private baseUrl: string,
		private timeout: number = 5000
	) {}

	createClient() {
		return new HttpClient(this.baseUrl, this.timeout);
	}
}

// app.ioc.ts
export const API_CLIENT_FACTORY = 'API_CLIENT_FACTORY';

container.bind(
	API_CLIENT_FACTORY,
	new ApiClientFactory(import.meta.env.VITE_API_URL)
);
```

### Service Locator Pattern

```tsx
export const ServiceComponent = () => {
	const httpClient = useInjection(HttpClient);
	const config = useInjection<IConfigService>(CONFIG_SERVICE);
	const factory = useInjection<ApiClientFactory>(API_CLIENT_FACTORY);

	// Use multiple services together
	const apiClient = factory.createClient();
	const endpoint = config.getApiUrl();

	return <div>Service Component</div>;
};
```

### Conditional Bindings

```typescript
// app.ioc.ts
import { DevConfigService } from './services/DevConfigService';
import { ProdConfigService } from './services/ProdConfigService';

// Bind different implementations based on environment
const configService = import.meta.env.DEV
	? new DevConfigService()
	: new ProdConfigService();

container.bind(CONFIG_SERVICE, configService);
```

## Multiple Containers

You can create multiple containers for different scopes:

```typescript
// auth.ioc.ts - Authentication-specific container
export const {
	InversionOfControlProvider: AuthProvider,
	useInjection: useAuthInjection,
	container: authContainer
} = createContainer();

export const AUTH_SERVICE = 'AUTH_SERVICE';
authContainer.bind(AUTH_SERVICE, new AuthService());

// app.ioc.ts - Application-wide container
export const {
	InversionOfControlProvider: AppProvider,
	useInjection: useAppInjection,
	container: appContainer
} = createContainer();
```

### Nested Providers

```tsx
export const App = () => (
	<AppProvider>
		<AuthProvider>
			<MyApplication />
		</AuthProvider>
	</AppProvider>
);
```

## Best Practices

### Interface-Based Dependencies

Define interfaces for better testability and flexibility:

```typescript
// interfaces/IUserService.ts
export interface IUserService {
	getCurrentUser(): Promise<User>;
	updateUser(user: Partial<User>): Promise<void>;
}

// services/UserService.ts
export class UserService implements IUserService {
	// Implementation
}

// services/MockUserService.ts (for testing)
export class MockUserService implements IUserService {
	// Mock implementation
}
```

### Centralized Binding Configuration

Keep all bindings in a centralized configuration:

```typescript
// app.ioc.ts
export const configureContainer = () => {
	// Core services
	container.bind(HttpClient, new HttpClient());
	container.bind(USER_SERVICE, new UserService());
	container.bind(CONFIG_SERVICE, createConfigService());

	// Environment-specific bindings
	if (import.meta.env.DEV) {
		container.bind(LOGGER_SERVICE, new ConsoleLogger());
	} else {
		container.bind(LOGGER_SERVICE, new RemoteLogger());
	}
};
```

### Lazy Initialization

Use factory functions for lazy initialization:

```typescript
export const EXPENSIVE_SERVICE = 'EXPENSIVE_SERVICE';

container.bind(EXPENSIVE_SERVICE, () => {
	// This will only be created when first injected
	return new ExpensiveService();
});
```

### Testing with IOC

Mock dependencies for testing:

```typescript
// MyComponent.test.tsx
import { render } from '@testing-library/react';
import { createContainer } from '@libs/ioc';

describe('MyComponent', () => {
	it('should render with mocked dependencies', () => {
		const { InversionOfControlProvider, container } = createContainer();

		// Bind mocks
		container.bind(HTTP_CLIENT, new MockHttpClient());
		container.bind(CONFIG_SERVICE, new MockConfigService());

		render(
			<InversionOfControlProvider>
				<MyComponent />
			</InversionOfControlProvider>
		);

		// Test assertions
	});
});
```

## TypeScript Tips

### Strongly Typed Tokens

```typescript
// Create typed tokens
export const createTypedToken = <T>(name: string) => name as string & { __type: T };

export const HTTP_CLIENT = createTypedToken<HttpClient>('HTTP_CLIENT');
export const CONFIG_SERVICE = createTypedToken<IConfigService>('CONFIG_SERVICE');

// Usage provides better type inference
const httpClient = useInjection(HTTP_CLIENT); // Type: HttpClient
const config = useInjection(CONFIG_SERVICE); // Type: IConfigService
```
