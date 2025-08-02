# Feature

This library provides a comprehensive feature flag management system for React applications. It offers a reactive approach to feature toggling with fine-grained control and type safety.

## Overview

The Feature library enables developers to:

- **Manage feature flags**: Toggle features on/off dynamically
- **Reactive updates**: Components automatically re-render when feature flags change
- **Type-safe**: Full TypeScript support with strongly typed feature definitions
- **Storage integration**: Persist feature flags to localStorage or other storage providers
- **Event-driven**: Listen to feature flag changes across the application

## Core Components

### FeatureHandler

The main class that manages feature flags and provides reactivity through event emission.

```typescript
import { FeatureHandler } from '@libs/feature';

const features = new FeatureHandler({
	FEATURE_X_V1: true,
	FEATURE_Y_V2: import.meta.env.FEATURE_Y_V2 === 'true',
	FEATURE_Z_V2: globalThis.FEATURES?.Z_V2 ?? false,
});

// Check if feature is enabled
if (features.get('FEATURE_X_V1')) {
	console.log('Feature X V1 is enabled!');
}

// Listen to changes
features.addOnChangeListener(({ changedFeatures }) => {
	console.log('Features changed:', changedFeatures);
});

// Update feature flag
features.set('FEATURE_X_V1', false);
```

### FeatureProvider

React context provider that makes the FeatureHandler available throughout the component tree.

```tsx
import { FeatureProvider } from '@libs/feature';

export const App = () => (
	<FeatureProvider handler={features}>
		<MyApplication />
	</FeatureProvider>
);
```

## React Hooks

### useFeatureHandler

Returns the FeatureHandler instance from context. Use this when you need direct access to the handler methods.

```typescript
import { useFeatureHandler } from '@libs/feature';

export const MyComponent = () => {
	const handler = useFeatureHandler();

	const toggleFeature = () => {
		const current = handler.get('MY_FEATURE');
		handler.set('MY_FEATURE', !current);
	};

	return <button onClick={toggleFeature}>Toggle Feature</button>;
};
```

### useFeature

Returns a feature flag value and a setter function. The component will automatically re-render when the feature flag changes.

```typescript
import { useFeature } from '@libs/feature';

export const MyComponent = () => {
	const [isEnabled, setFeature] = useFeature('MY_FEATURE');

	return (
		<div>
			<p>Feature is {isEnabled ? 'enabled' : 'disabled'}</p>
			<button onClick={() => setFeature(!isEnabled)}>
				Toggle Feature
			</button>
		</div>
	);
};
```

## Higher-Order Components

### withFeatures

A HOC that provides feature flags as props to wrapped components.

```typescript
import { withFeatures } from '@libs/feature';

interface MyComponentProps {
	myFeature: boolean;
	anotherFeature: boolean;
}

const MyComponent = ({ myFeature, anotherFeature }: MyComponentProps) => (
	<div>
		{myFeature && <NewFeatureComponent />}
		{anotherFeature && <AnotherFeatureComponent />}
	</div>
);

export default withFeatures({
	myFeature: 'MY_FEATURE',
	anotherFeature: 'ANOTHER_FEATURE',
})(MyComponent);
```

## Storage Integration

### linkStorageToFeatureHandler

Links a storage provider (like localStorage) to automatically persist and restore feature flags.

```typescript
import { FeatureHandler, linkStorageToFeatureHandler } from '@libs/feature';

const features = new FeatureHandler({
	FEATURE_A: false,
	FEATURE_B: true,
});

// Link to localStorage with key 'app-features'
linkStorageToFeatureHandler(features, 'app-features');

// Features will now be persisted to and restored from localStorage
```

## Events

### FeatureChangedEvent

Event emitted when feature flags change, containing information about what changed.

```typescript
import type { FeatureOnChangeListener } from '@libs/feature';

const listener: FeatureOnChangeListener = ({ changedFeatures, handler }) => {
	Object.entries(changedFeatures).forEach(([feature, value]) => {
		console.log(`Feature ${feature} changed to ${value}`);
	});
};

features.addOnChangeListener(listener);
```

## Best Practices

### Feature Flag Naming

Use descriptive, uppercase names with version suffixes:

```typescript
const features = new FeatureHandler({
	NEW_DASHBOARD_V2: true,
	EXPERIMENTAL_SEARCH_V1: false,
	BETA_NOTIFICATIONS_V3: import.meta.env.VITE_BETA_FEATURES === 'true',
});
```

### Environment-Based Configuration

Configure feature flags based on environment:

```typescript
const features = new FeatureHandler({
	// Always enabled in development
	DEBUG_TOOLBAR: import.meta.env.DEV,
	// Controlled by environment variable
	NEW_API_V2: import.meta.env.VITE_NEW_API === 'true',
	// Enabled for specific environments
	ANALYTICS: import.meta.env.VITE_ENV !== 'development',
});
```

### Conditional Rendering

Use feature flags for conditional component rendering:

```tsx
export const Dashboard = () => {
	const [newDashboard] = useFeature('NEW_DASHBOARD_V2');

	return (
		<div>
			{newDashboard ? <NewDashboardComponent /> : <LegacyDashboard />}
		</div>
	);
};
```

### Route Protection

Combine with routing for feature-gated pages:

```tsx
import { useFeature } from '@libs/feature';
import { Navigate } from 'react-router';

export const BetaFeaturePage = () => {
	const [betaEnabled] = useFeature('BETA_FEATURES_V1');

	if (!betaEnabled) {
		return <Navigate to='/' replace />;
	}

	return <BetaContent />;
};
```
