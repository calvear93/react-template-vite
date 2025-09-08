---
mode: agent
description: 'Create a custom React hook following React TypeScript template best practices'
---

# Custom Hook Creation Prompt

Create a new custom React hook for [HOOK_DESCRIPTION] following these requirements:

## Core Requirements

### 1. Hook Structure

- Use `use` prefix in function name (e.g., `useUserData`, `useApiCall`)
- Implement proper TypeScript return types and generics
- Follow React hooks rules and patterns
- Include proper error handling and cleanup

### 2. TypeScript Integration

- Define comprehensive return type interfaces
- Use generics for reusable hooks
- Include proper parameter typing
- Export both hook and related types

### 3. State Management

- Use appropriate React hooks (useState, useEffect, useCallback, useMemo)
- Handle loading, error, and success states
- Implement proper cleanup with useEffect
- Integrate with custom IoC container when needed

### 4. Error Handling

- Provide meaningful error messages
- Handle network errors and timeouts
- Include retry mechanisms where appropriate
- Log errors for debugging purposes

### 5. Performance

- Use useMemo and useCallback for optimization
- Prevent unnecessary re-renders
- Implement proper dependency arrays
- Handle subscription cleanup

## Implementation Patterns

### Basic Data Fetching Hook

```typescript
import { useState, useEffect, useCallback } from 'react';
import { useInjection } from './app.ioc.ts'; // adjust path based on hook location

interface UseApiResult<T> {
	data: T | null;
	loading: boolean;
	error: string | null;
	refetch: () => Promise<void>;
}

interface UseApiOptions {
	enabled?: boolean;
	onSuccess?: (data: any) => void;
	onError?: (error: Error) => void;
}

/**
 * Custom hook for API data fetching with loading and error states.
 * Provides automatic refetch capability and proper cleanup.
 *
 * @param url - API endpoint URL
 * @param options - Configuration options for the hook
 * @returns Object containing data, loading state, error, and refetch function
 */
export const useApi = <T>(
	url: string,
	options: UseApiOptions = {},
): UseApiResult<T> => {
	const { enabled = true, onSuccess, onError } = options;
	const httpClient = useInjection(HttpClient);

	const [data, setData] = useState<T | null>(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const fetchData = useCallback(async () => {
		if (!enabled) return;

		try {
			setLoading(true);
			setError(null);

			const result = await httpClient.get<T>(url);
			setData(result);
			onSuccess?.(result);
		} catch (err) {
			const errorMessage =
				err instanceof Error ? err.message : 'Unknown error';
			setError(errorMessage);
			onError?.(err as Error);
		} finally {
			setLoading(false);
		}
	}, [url, enabled, httpClient, onSuccess, onError]);

	useEffect(() => {
		fetchData();
	}, [fetchData]);

	const refetch = useCallback(() => fetchData(), [fetchData]);

	return { data, loading, error, refetch };
};
```

### Form Handling Hook

```typescript
interface UseFormOptions<T> {
	initialValues: T;
	validationSchema: z.ZodSchema<T>;
	onSubmit: (values: T) => Promise<void>;
}

interface UseFormResult<T> {
	values: T;
	errors: Partial<Record<keyof T, string>>;
	isSubmitting: boolean;
	handleChange: (field: keyof T, value: any) => void;
	handleSubmit: (e: React.FormEvent) => Promise<void>;
	reset: () => void;
	setFieldError: (field: keyof T, error: string) => void;
}

/**
 * Custom hook for form state management with Zod validation.
 * Handles form submission, validation, and error states.
 *
 * @param options - Form configuration including initial values and validation
 * @returns Form state and handlers for form management
 */
export const useForm = <T extends Record<string, any>>({
	initialValues,
	validationSchema,
	onSubmit,
}: UseFormOptions<T>): UseFormResult<T> => {
	const [values, setValues] = useState<T>(initialValues);
	const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
	const [isSubmitting, setIsSubmitting] = useState(false);

	const validateField = useCallback(
		(field: keyof T, value: any) => {
			try {
				const fieldSchema = validationSchema.pick({ [field]: true });
				fieldSchema.parse({ [field]: value });
				setErrors((prev) => ({ ...prev, [field]: undefined }));
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
		},
		[validationSchema],
	);

	const handleChange = useCallback(
		(field: keyof T, value: any) => {
			setValues((prev) => ({ ...prev, [field]: value }));
			validateField(field, value);
		},
		[validateField],
	);

	const handleSubmit = useCallback(
		async (e: React.FormEvent) => {
			e.preventDefault();

			try {
				setIsSubmitting(true);
				validationSchema.parse(values);
				await onSubmit(values);
			} catch (error) {
				if (error instanceof z.ZodError) {
					const fieldErrors: Partial<Record<keyof T, string>> = {};
					error.errors.forEach((err) => {
						if (err.path[0]) {
							fieldErrors[err.path[0] as keyof T] = err.message;
						}
					});
					setErrors(fieldErrors);
				}
			} finally {
				setIsSubmitting(false);
			}
		},
		[values, validationSchema, onSubmit],
	);

	const reset = useCallback(() => {
		setValues(initialValues);
		setErrors({});
		setIsSubmitting(false);
	}, [initialValues]);

	const setFieldError = useCallback((field: keyof T, error: string) => {
		setErrors((prev) => ({ ...prev, [field]: error }));
	}, []);

	return {
		values,
		errors,
		isSubmitting,
		handleChange,
		handleSubmit,
		reset,
		setFieldError,
	};
};
```

### Local Storage Hook

```typescript
/**
 * Custom hook for localStorage state management with TypeScript support.
 * Automatically syncs state with localStorage and handles serialization.
 *
 * @param key - localStorage key
 * @param initialValue - Initial value if no stored value exists
 * @returns Tuple of [value, setValue] similar to useState
 */
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
```

### Debounced Value Hook

```typescript
/**
 * Custom hook for debouncing values to optimize performance.
 * Useful for search inputs and API calls triggered by user input.
 *
 * @param value - Value to debounce
 * @param delay - Delay in milliseconds
 * @returns Debounced value
 */
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
```

## Technical Checklist

### Essential Features

- [ ] `use` prefix in function name
- [ ] Proper TypeScript return types and generics
- [ ] Integration with React hooks patterns
- [ ] Error handling and cleanup implementation
- [ ] Loading states for async operations
- [ ] Proper dependency arrays in useEffect/useCallback

### Advanced Features

- [ ] Integration with custom IoC container (useInjection from ./app.ioc.ts)
- [ ] Performance optimization (useMemo, useCallback)
- [ ] Generic types for reusability
- [ ] Proper subscription cleanup
- [ ] Error boundaries integration
- [ ] Retry mechanisms for failed operations

### Code Quality

- [ ] No hardcoded values (use configuration injection)
- [ ] Comprehensive error handling
- [ ] Proper TypeScript typing throughout
- [ ] Clean and readable code structure
- [ ] JSDoc documentation with parameter descriptions

### Testing Coverage

- [ ] Unit tests for hook behavior
- [ ] Testing with different parameter combinations
- [ ] Error scenario testing
- [ ] Cleanup and memory leak testing
- [ ] Performance testing for optimization

### Hook Patterns

- [ ] Follows React hooks rules (no conditional calls)
- [ ] Proper cleanup in useEffect
- [ ] Stable references with useCallback/useMemo
- [ ] Appropriate use of useState, useEffect, etc.
- [ ] Integration with other hooks and context

Generate the custom hook following these patterns and ensure it integrates seamlessly with the existing React TypeScript architecture.
