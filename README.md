<h2 align="center"><b>Vite React Skeleton</b></h2>
<h3 align="center"><b>SPA</b></h3>

<br />

<p align="center">
  <a href="https://reactjs.org/" target="blank"><img src="https://upload.wikimedia.org/wikipedia/commons/a/a7/React-icon.svg" width="220" alt="React Logo" /></a>
</p>

<p align="center">
  Vite skeleton for React with TypeScript.
</p>

<p align="center">
  <a href="https://github.com/calvear93/react-template" target="_blank">
	<img src="https://img.shields.io/github/license/calvear93/react-template" alt="Package License" />
  </a>
</p>

## 📥 **Getting Started**

- Replace globally these terms:
    - `(((base-path)))` web base path, i.e. web (for get /web/\*)
    - `(((app-name)))` app name, i.e. home-web
    - `(((app-title)))` app title, i.e. Sample API
    - `(((project-name)))` project name, i.e. my-project

- Install [Node.js](https://nodejs.org/) (see `engines.node` in `package.json`).
- Install [pnpm](https://pnpm.io/installation) (see `engines.pnpm` in `package.json`).
- Run `pnpm install`.
- Run `pnpm env:schema` (keeps env schema in sync).
- Start with `pnpm start:dev` (or run tests with `pnpm test:dev`).

- Using Docker.
    - Exec `docker build --no-cache --build-arg ENV=dev -f Dockerfile --tag image_name .`
    - Exec `docker run -d -it -p 8080:8080/tcp --name container_name image_name`
    - Open `http://localhost:8080/` in browser

## 📋 **Environments**

This template uses an environment loader (`env` CLI) and ships with two environment names:

- **dev**: local development
- **release**: production-like settings

You can add more environments (e.g. `qa`, `prod`) by creating the corresponding files under `env/` and updating `env/appsettings.json` if needed.

## 🧪 **Executing**

Project uses **pnpm scripts** to run, test, and build.
Many scripts are environment-scoped via `:<env>` where `<env>` is typically `dev` or `release`.

| Command                         | Action                         |
| ------------------------------- | ------------------------------ |
| pnpm start:`<env>`              | executes the app               |
| pnpm build:`<env>`              | build the app                  |
| pnpm preview                    | builds and serves the app      |
| pnpm test:`<env>`               | executes tests                 |
| pnpm test:`<env>` --coverage    | executes tests with coverage   |
| pnpm test:`<env>` --watch=false | executes tests without watcher |
| pnpm env:schema                 | updates env JSON schema        |
| pnpm format                     | code format                    |
| pnpm lint                       | code/styles review             |
| pnpm stylelint                  | CSS linting                    |
| pnpm test:mutation              | mutation testing (Stryker)     |

## 🏗️ **Architecture Overview**

This React application is built with a modular architecture featuring:

- **📦 Dependency Injection (IoC)**: Clean dependency management with React Context based IoC container
- **🛣️ Routing System**: Central route configuration with lazy loading and layout support
- **🎛️ Feature Flags**: Runtime feature toggles for controlled deployments
- **⚛️ State Management**: Jotai atoms for fine-grained reactive state
- **🧩 Component Architecture**: Organized components with clear separation of concerns

## 📦 **Dependency Injection (IoC)**

The application uses an Inversion of Control (IoC) container built on top of Jotai for managing dependencies.

### Setting Up IoC Container

```typescript
// app/app.ioc.ts
import { createContainer } from '#libs/ioc';

export const { container, useInjection } = createContainer();

// Define tokens for type safety
export const USER_SERVICE = 'user_service';
export const CONFIG_SERVICE = 'config_service';

// Bind implementations
container.bind(HttpClient, new HttpClient()); // with classes
container.bind(USER_SERVICE, new UserService()); // or tokens
container.bind(CONFIG_SERVICE, new ConfigService());
```

### Using Dependency Injection

```typescript
// In components - adjust path based on component location
import { useInjection } from '../app.ioc.ts';

export const UserProfile: React.FC = () => {
	const httpClient = useInjection<HttpClient>();

	const fetchUserData = async () => {
		const data = await httpClient.get('/api/user');
		return data;
	};

	// Component logic...
};
```

### Benefits

- **Testability**: Easy to mock dependencies in tests
- **Flexibility**: Swap implementations without changing components
- **Type Safety**: Full TypeScript support with token-based injection
- **Performance**: Lazy instantiation and singleton support

## 🛣️ **Routing System**

The application uses a custom routing system built on React Router with enhanced features.

### Route Definition

```typescript
// app/app.routes.tsx
import { lazy } from 'react';
import { type RouteDefinition } from '#libs/router';
import { AppLayout } from './layouts/app/App.layout.tsx';

export const routes: RouteDefinition[] = [
	{
		Layout: AppLayout,
		children: [
			{
				path: '/',
				Component: lazy(() => import('./pages/main/Main.page.tsx')),
			},
			{
				path: '/detail/:id?',
				Component: lazy(() => import('./pages/detail/Detail.page.tsx')),
				loader: async ({ params }) => {
					const { id } = params;
					return id ? await fetchDetailData(id) : null;
				},
			},
			{
				path: '/admin',
				Layout: AdminLayout, // Nested layout
				children: [
					{
						path: 'users',
						Component: lazy(
							() => import('./pages/admin/Users.page.tsx'),
						),
					},
				],
			},
		],
	},
];
```

### Creating Router

```typescript
// app/App.router.tsx
import { createRouter } from '#libs/router';
import { routes } from './app.routes.tsx';

const Router = createRouter({
	routes,
	loader: <div>Loading...</div>, // Global loading component
	type: 'browser', // 'browser' | 'hash' | 'memory'
});

export const AppRouter: React.FC = () => {
	// Add any authorization logic here
	return <Router />;
};
```

### Navigation

```typescript
// Using the custom Link component
import { Link } from '#libs/router';

export const Navigation: React.FC = () => (
	<nav>
		<Link to="/">Home</Link>
		<Link to="/detail/123">Detail</Link>
		<Link to="/admin/users">Admin Users</Link>
	</nav>
);

// Using hooks
import { useRouter } from '#libs/router';

export const SomeComponent: React.FC = () => {
	const { navigate, params, location } = useRouter();

	const handleNavigation = () => {
		navigate('/detail/456');
	};

	return <button onClick={handleNavigation}>Go to Detail</button>;
};
```

### Features

- **Lazy Loading**: Automatic code splitting for better performance
- **Nested Layouts**: Support for complex layout hierarchies
- **Data Loaders**: Pre-fetch data before route rendering
- **Type Safety**: Full TypeScript support for routes and parameters
- **Flexible Routing**: Browser, hash, or memory routing modes

## 🎛️ **Feature Flags**

The application includes a robust feature flag system for controlled feature rollouts.

### Setting Up Features

```typescript
// app/app.features.ts
import { FeatureHandler } from '#libs/feature';

export const featureHandler = new FeatureHandler({
	// Static features
	FEATURE_NEW_UI: true,
	FEATURE_BETA_DASHBOARD: false,

	// Environment-based features
	FEATURE_DEBUG_MODE: import.meta.env.NODE_ENV === 'development',
	FEATURE_ANALYTICS: import.meta.env.PROD === true,

	// Runtime features (from API, localStorage, etc.)
	FEATURE_PREMIUM: globalThis.USER_FEATURES?.premium || false,
});
```

### Using Feature Flags in Components

```typescript
// Hook-based usage
import { useFeature } from '#libs/feature';

export const Dashboard: React.FC = () => {
	const isBetaEnabled = useFeature('FEATURE_BETA_DASHBOARD');

	return (
		<div>
			{isBetaEnabled ? (
				<BetaDashboard />
			) : (
				<StandardDashboard />
			)}
		</div>
	);
};

// HOC-based usage
import { withFeatures } from '#libs/feature';

export const MyComponent = withFeatures({
	fallback: <div>Feature not available</div>,
	loading: <div>Loading feature...</div>,
	features: {
		FEATURE_NEW_UI: lazy(() => import('./MyComponent.v2.tsx')),
		FEATURE_OLD_UI: lazy(() => import('./MyComponent.v1.tsx')),
	},
});
```

### Provider Setup

```typescript
// app/App.tsx
import { FeatureProvider } from '#libs/feature';
import { featureHandler } from './app.features.ts';

export const App: React.FC = () => (
	<FeatureProvider handler={featureHandler}>
		<AppRouter />
	</FeatureProvider>
);
```

### Runtime Feature Management

```typescript
// Listening to feature changes
featureHandler.addOnChangeListener(({ changedFeatures }) => {
	console.log('Changed features:', changedFeatures);
	// Handle feature changes (analytics, UI updates, etc.)
});

// Updating features at runtime
featureHandler.set('FEATURE_BETA_DASHBOARD', true);

// Bulk updates
featureHandler.setAll({
	FEATURE_NEW_UI: false,
	FEATURE_BETA_DASHBOARD: true,
});
```

### Testing with Features

```typescript
// In tests
import { FeatureHandler, FeatureProvider } from '#libs/feature';

describe('Component with features', () => {
	test('renders beta version when enabled', () => {
		const features = new FeatureHandler({
			FEATURE_BETA_DASHBOARD: true,
		});

		render(
			<FeatureProvider handler={features}>
				<Dashboard />
			</FeatureProvider>
		);

		expect(screen.getByTestId('beta-dashboard')).toBeInTheDocument();
	});
});
```

### Benefits

- **Safe Deployments**: Roll out features gradually
- **A/B Testing**: Easy feature experimentation
- **Runtime Control**: Toggle features without deployments
- **Environment Flexibility**: Different features per environment
- **Clean Code**: Avoid branching in version control

## 🔗 **Integration Patterns**

### IoC + Routing

```typescript
// Inject services in route loaders
const userLoader = async ({ params }) => {
	const userService = container.get<UserService>(USER_SERVICE);
	return await userService.getUser(params.id);
};

export const routes = [
	{
		path: '/user/:id',
		Component: UserPage,
		loader: userLoader,
	},
];
```

### Features + IoC

```typescript
// Feature-dependent service injection
export const ApiService = () => {
	const features = useFeatureHandler();
	const isNewApiEnabled = features.get('FEATURE_NEW_API');

	return useInjection(isNewApiEnabled ? NEW_API_SERVICE : LEGACY_API_SERVICE);
};
```

### Routing + Features

```typescript
// Feature-dependent routing
export const getRoutes = (features: FeatureHandler): RouteDefinition[] => [
	{
		Layout: AppLayout,
		children: [
			{
				path: '/',
				Component: lazy(() => import('./pages/main/Main.page.tsx')),
			},
			// Conditional routes based on features
			...(features.get('FEATURE_ADMIN_PANEL')
				? [
						{
							path: '/admin',
							Component: lazy(
								() => import('./pages/admin/Admin.page.tsx'),
							),
						},
					]
				: []),
		],
	},
];
```

Each system (IoC, Routing, Features) includes comprehensive test coverage with mocking strategies and integration patterns.

## 🧰 Configuring fnm (Fast Node Manager)

fnm (Fast Node Manager) is a lightweight Node.js version manager used by this template to run multiple Node versions easily.

- Install fnm following the official instructions: https://github.com/Schniz/fnm
- On Windows, fnm stores the default Node alias file at:
  `C:\Users\{username}\AppData\Roaming\fnm\aliases\default`

Important: Add `C:\Users\{username}\AppData\Roaming\fnm\aliases\default` to your Windows System PATH so Node MCP servers can find the fnm-managed Node; then restart your terminals.
