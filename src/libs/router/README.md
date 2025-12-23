# Router

This library provides enhanced routing capabilities for React applications, built on top of React Router. It offers simplified route configuration, layout management, and additional utilities for modern React applications.

## Overview

The Router library extends React Router with:

- **Simplified Configuration**: Declarative route definitions with automatic code splitting
- **Layout Support**: Nested layouts with automatic route wrapping
- **Type Safety**: Full TypeScript support with strongly typed route definitions
- **Lazy Loading**: Built-in support for code splitting and lazy loading
- **Multiple Router Types**: Support for browser, hash, and memory routers
- **Custom Hooks**: Additional utilities for common routing patterns

## Core Components

### createRouter

Creates a router instance with pre-configured routes and layout support.

```typescript
import { createRouter } from '#libs/router';
import { AppLayout } from '../app/layouts/app/App.layout.tsx';
import { lazy } from 'react';

const MyRouter = createRouter({
	type: 'browser', // 'browser' | 'hash' | 'memory'
	routes: [
		{
			Layout: AppLayout,
			children: [
				{
					path: '/',
					Component: lazy(() => import('../app/pages/main/Main.page.tsx')),
				},
				{
					path: '/detail/:id?',
					Component: lazy(() => import('../app/pages/detail/Detail.page.tsx')),
				},
			],
		},
	],
	fallback: <div>Loading...</div>, // Optional loading fallback
});

export const App = () => <MyRouter />;
```

### Route Configuration

#### Basic Route Structure

```typescript
import type { RouteDefinition } from '#libs/router';

export const routes: RouteDefinition[] = [
	{
		path: '/',
		Component: HomePage,
	},
	{
		path: '/about',
		Component: lazy(() => import('../app/pages/AboutPage.tsx')),
	},
];
```

#### Layout Routes

```typescript
export const routes: RouteDefinition[] = [
	{
		// Root layout (defaults to '/' if path not specified)
		Layout: AppLayout,
		children: [
			{
				path: '/',
				Component: HomePage,
			},
			{
				path: '/dashboard',
				Layout: DashboardLayout, // Nested layout
				children: [
					{
						path: '/dashboard/overview',
						Component: DashboardOverview,
					},
					{
						path: '/dashboard/settings',
						Component: DashboardSettings,
					},
				],
			},
		],
	},
];
```

#### Protected Routes

```typescript
import { ProtectedLayout } from '../app/layouts/protected/Protected.layout.tsx';

export const protectedRoutes: RouteDefinition[] = [
	{
		Layout: ProtectedLayout, // This layout handles authentication
		children: [
			{
				path: '/profile',
				Component: ProfilePage,
			},
			{
				path: '/settings',
				Component: SettingsPage,
			},
		],
	},
];
```

## Router Types

### Browser Router

Standard HTML5 history API routing (recommended for most applications):

```typescript
const router = createRouter({
	type: 'browser',
	routes: myRoutes,
});
```

### Hash Router

Uses URL hash for routing (useful for static hosting):

```typescript
const router = createRouter({
	type: 'hash',
	routes: myRoutes,
});
```

### Memory Router

In-memory routing (useful for testing and embedded applications):

```typescript
const router = createRouter({
	type: 'memory',
	routes: myRoutes,
	initialEntries: ['/'], // Optional initial route
});
```

## Custom Hooks

### useHashValue

Returns the current URL hash value without the '#' symbol:

```typescript
import { useHashValue } from '#libs/router';

export const MyComponent = () => {
	const hash = useHashValue();

	return <div>Current hash: {hash}</div>;
};
```

## Advanced Patterns

### Multiple Router Setup

Create separate routers for different application sections:

```typescript
// PublicRouter.tsx
export const PublicRouter = createRouter({
	type: 'browser',
	routes: publicRoutes,
});

// PrivateRouter.tsx
export const PrivateRouter = createRouter({
	type: 'browser',
	routes: privateRoutes,
});

// App.tsx
export const App = () => {
	const { isAuthenticated } = useAuth();

	return isAuthenticated ? <PrivateRouter /> : <PublicRouter />;
};
```

### Conditional Route Loading

```typescript
import { useFeature } from '#libs/feature';

export const ConditionalRoutes = () => {
	const [betaFeatures] = useFeature('BETA_FEATURES');

	const routes = [
		{
			path: '/',
			Component: HomePage,
		},
		...(betaFeatures
			? [
					{
						path: '/beta',
						Component: lazy(
							() => import('../app/pages/BetaPage.tsx'),
						),
					},
				]
			: []),
	];

	return createRouter({ type: 'browser', routes });
};
```

### Route Guards

```typescript
// guards/AuthGuard.tsx
export const AuthGuard = ({ children }: PropsWithChildren) => {
	const { isAuthenticated, isLoading } = useAuth();

	if (isLoading) return <LoadingSpinner />;
	if (!isAuthenticated) return <Navigate to="/login" replace />;

	return <>{children}</>;
};

// Route configuration with guards
export const protectedRoutes = [
	{
		Layout: ({ children }) => <AuthGuard>{children}</AuthGuard>,
		children: [
			{
				path: '/dashboard',
				Component: DashboardPage,
			},
		],
	},
];
```

### Error Boundaries

```typescript
// components/RouteErrorBoundary.tsx
export const RouteErrorBoundary = ({ children }: PropsWithChildren) => (
	<ErrorBoundary
		fallback={<ErrorPage />}
		onError={(error) => console.error('Route error:', error)}
	>
		{children}
	</ErrorBoundary>
);

// Route configuration with error boundaries
export const routes = [
	{
		Layout: ({ children }) => (
			<RouteErrorBoundary>
				<AppLayout>{children}</AppLayout>
			</RouteErrorBoundary>
		),
		children: [
			// Your routes here
		],
	},
];
```

## Layout Patterns

### Basic Layout

```tsx
// layouts/AppLayout.tsx
export const AppLayout = ({ children }: PropsWithChildren) => (
	<div className='app-layout'>
		<Header />
		<main className='main-content'>{children}</main>
		<Footer />
	</div>
);
```

### Conditional Layout

```tsx
// layouts/ConditionalLayout.tsx
export const ConditionalLayout = ({ children }: PropsWithChildren) => {
	const location = useLocation();
	const isFullScreen = location.pathname.includes('/fullscreen');

	if (isFullScreen) {
		return <>{children}</>;
	}

	return (
		<div className='standard-layout'>
			<Sidebar />
			<main>{children}</main>
		</div>
	);
};
```

### Layout with Context

```tsx
// layouts/DashboardLayout.tsx
export const DashboardLayout = ({ children }: PropsWithChildren) => {
	const [sidebarOpen, setSidebarOpen] = useState(true);

	return (
		<DashboardProvider value={{ sidebarOpen, setSidebarOpen }}>
			<div className='dashboard-layout'>
				<DashboardSidebar />
				<main className='dashboard-content'>{children}</main>
			</div>
		</DashboardProvider>
	);
};
```

## Best Practices

### Route Organization

Organize routes by feature or section:

```typescript
// routes/index.ts
export { authRoutes } from './auth.routes.ts';
export { dashboardRoutes } from './dashboard.routes.ts';
export { publicRoutes } from './public.routes.ts';

// routes/dashboard.routes.ts
export const dashboardRoutes = [
	{
		path: '/dashboard',
		Layout: DashboardLayout,
		children: [
			{
				path: '/dashboard/overview',
				Component: lazy(
					() => import('../app/pages/dashboard/Overview.page.tsx'),
				),
			},
			// More dashboard routes...
		],
	},
];
```

### Code Splitting

Use React.lazy() for automatic code splitting:

```typescript
import { lazy } from 'react';

// Good: Lazy load pages
const HomePage = lazy(() => import('../app/pages/Home.page.tsx'));
const AboutPage = lazy(() => import('../app/pages/About.page.tsx'));

// Better: Lazy load with named exports
const HomePage = lazy(() =>
	import('../app/pages/Home.page.tsx').then((module) => ({
		default: module.HomePage,
	})),
);
```

### Route Parameters

```typescript
// Type-safe route parameters
interface RouteParams {
	id: string;
	category?: string;
}

export const DetailPage = () => {
	const { id, category } = useParams<RouteParams>();

	return (
		<div>
			<h1>Detail {id}</h1>
			{category && <p>Category: {category}</p>}
		</div>
	);
};
```

### Navigation Utilities

```typescript
// utils/navigation.ts
export const navigationUtils = {
	goToHome: () => navigate('/'),
	goToProfile: (userId: string) => navigate(`/profile/${userId}`),
	goBack: () => navigate(-1),
	reload: () => window.location.reload(),
};

// Usage in components
export const MyComponent = () => {
	const handleProfileClick = () => {
		navigationUtils.goToProfile('123');
	};

	return <button onClick={handleProfileClick}>View Profile</button>;
};
```

### Route Testing

```typescript
// tests/routes.test.tsx
import { render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from '#libs/router';

describe('Routes', () => {
	it('should render home page', () => {
		const router = createMemoryRouter(routes, {
			initialEntries: ['/'],
		});

		render(<RouterProvider router={router} />);

		expect(screen.getByText('Welcome')).toBeInTheDocument();
	});

	it('should render 404 for unknown routes', () => {
		const router = createMemoryRouter(routes, {
			initialEntries: ['/unknown-route'],
		});

		render(<RouterProvider router={router} />);

		expect(screen.getByText('Page Not Found')).toBeInTheDocument();
	});
});
```
