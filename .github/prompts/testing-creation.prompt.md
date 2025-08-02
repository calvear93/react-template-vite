---
mode: agent
description: 'Create comprehensive tests for React components and hooks using Vitest and React Testing Library'
---

# Testing Creation Prompt

Create comprehensive tests for [COMPONENT/HOOK_NAME] following React TypeScript template testing best practices:

## Core Requirements

### 1. Testing Framework Setup

- Use Vitest as the testing framework
- Use React Testing Library for component testing
- Use @testing-library/user-event for user interactions
- Follow testing best practices with proper setup and cleanup

### 2. Test Structure

- Organize tests in logical describe blocks
- Use descriptive test names that explain the behavior
- Include setup and teardown when necessary
- Group related tests together

### 3. Coverage Requirements

- Test component rendering with different props
- Test user interactions and event handlers
- Test loading, error, and success states
- Test accessibility features
- Test edge cases and error scenarios

### 4. Mocking Strategy

- Mock external dependencies appropriately
- Use MSW for API mocking when needed
- Mock custom IoC container dependencies
- Avoid over-mocking internal React behavior

## Implementation Patterns

### Component Testing Template

```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { ComponentName } from './ComponentName.tsx';

// Mock dependencies
const mockOnAction = vi.fn();
const mockService = {
	getData: vi.fn(),
	updateData: vi.fn(),
};

// Mock IoC container
vi.mock('#libs/ioc', () => ({
	useInjection: vi.fn((token) => {
		if (token === 'ServiceName') return mockService;
		return {};
	}),
}));

describe('ComponentName', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('Rendering', () => {
		it('should render with required props', () => {
			const props = {
				title: 'Test Title',
				data: { id: '1', name: 'Test Data' },
			};

			render(<ComponentName {...props} />);

			expect(screen.getByText('Test Title')).toBeInTheDocument();
			expect(screen.getByText('Test Data')).toBeInTheDocument();
		});

		it('should render loading state correctly', () => {
			render(<ComponentName title="Test" isLoading={true} />);

			expect(screen.getByRole('progressbar')).toBeInTheDocument();
			expect(screen.getByText(/loading/i)).toBeInTheDocument();
		});

		it('should render error state correctly', () => {
			const errorMessage = 'Something went wrong';
			render(<ComponentName title="Test" error={errorMessage} />);

			expect(screen.getByRole('alert')).toBeInTheDocument();
			expect(screen.getByText(errorMessage)).toBeInTheDocument();
		});
	});

	describe('User Interactions', () => {
		it('should call onAction when button is clicked', async () => {
			const user = userEvent.setup();
			render(<ComponentName title="Test" onAction={mockOnAction} />);

			const button = screen.getByRole('button', { name: /action/i });
			await user.click(button);

			expect(mockOnAction).toHaveBeenCalledTimes(1);
		});

		it('should handle form submission correctly', async () => {
			const user = userEvent.setup();
			render(<ComponentName title="Test" onSubmit={mockOnAction} />);

			const input = screen.getByLabelText(/name/i);
			const submitButton = screen.getByRole('button', { name: /submit/i });

			await user.type(input, 'Test Name');
			await user.click(submitButton);

			expect(mockOnAction).toHaveBeenCalledWith({
				name: 'Test Name',
			});
		});

		it('should handle keyboard navigation', async () => {
			const user = userEvent.setup();
			render(<ComponentName title="Test" onAction={mockOnAction} />);

			const button = screen.getByRole('button', { name: /action/i });

			// Focus and trigger with keyboard
			button.focus();
			await user.keyboard('{Enter}');

			expect(mockOnAction).toHaveBeenCalledTimes(1);
		});
	});

	describe('Accessibility', () => {
		it('should have proper ARIA attributes', () => {
			render(<ComponentName title="Test" />);

			const element = screen.getByRole('region');
			expect(element).toHaveAttribute('aria-label', 'ComponentName');
		});

		it('should be keyboard accessible', () => {
			render(<ComponentName title="Test" onAction={mockOnAction} />);

			const button = screen.getByRole('button', { name: /action/i });
			expect(button).toHaveAttribute('tabIndex', '0');
		});

		it('should have proper heading hierarchy', () => {
			render(<ComponentName title="Main Title" />);

			const heading = screen.getByRole('heading', { level: 2 });
			expect(heading).toHaveTextContent('Main Title');
		});
	});

	describe('Error Handling', () => {
		it('should handle async operation errors', async () => {
			mockService.getData.mockRejectedValue(new Error('API Error'));

			render(<ComponentName title="Test" />);

			await waitFor(() => {
				expect(screen.getByText(/api error/i)).toBeInTheDocument();
			});
		});

		it('should retry failed operations', async () => {
			const user = userEvent.setup();
			mockService.getData
				.mockRejectedValueOnce(new Error('First failure'))
				.mockResolvedValueOnce({ data: 'success' });

			render(<ComponentName title="Test" />);

			// Wait for initial error
			await waitFor(() => {
				expect(screen.getByText(/first failure/i)).toBeInTheDocument();
			});

			// Click retry button
			const retryButton = screen.getByRole('button', { name: /retry/i });
			await user.click(retryButton);

			// Wait for success
			await waitFor(() => {
				expect(screen.getByText('success')).toBeInTheDocument();
			});

			expect(mockService.getData).toHaveBeenCalledTimes(2);
		});
	});

	describe('Edge Cases', () => {
		it('should handle empty data gracefully', () => {
			render(<ComponentName title="Test" data={[]} />);

			expect(screen.getByText(/no data available/i)).toBeInTheDocument();
		});

		it('should handle invalid props gracefully', () => {
			// Suppress console.error for this test
			const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

			render(<ComponentName title="" />);

			expect(screen.getByText(/please provide a title/i)).toBeInTheDocument();

			consoleSpy.mockRestore();
		});
	});
});
```

### Hook Testing Template

```typescript
import { renderHook, act } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { useCustomHook } from './useCustomHook.ts';

// Mock dependencies
const mockHttpClient = {
	get: vi.fn(),
	post: vi.fn(),
};

vi.mock('#libs/ioc', () => ({
	useInjection: vi.fn(() => mockHttpClient),
}));

describe('useCustomHook', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('Initial State', () => {
		it('should return initial state correctly', () => {
			const { result } = renderHook(() => useCustomHook('test-url'));

			expect(result.current.data).toBeNull();
			expect(result.current.loading).toBe(false);
			expect(result.current.error).toBeNull();
		});
	});

	describe('Data Fetching', () => {
		it('should fetch data successfully', async () => {
			const mockData = { id: '1', name: 'Test Data' };
			mockHttpClient.get.mockResolvedValue(mockData);

			const { result } = renderHook(() => useCustomHook('test-url'));

			act(() => {
				result.current.refetch();
			});

			expect(result.current.loading).toBe(true);

			await act(async () => {
				await new Promise((resolve) => setTimeout(resolve, 0));
			});

			expect(result.current.data).toEqual(mockData);
			expect(result.current.loading).toBe(false);
			expect(result.current.error).toBeNull();
		});

		it('should handle fetch errors', async () => {
			const error = new Error('Network error');
			mockHttpClient.get.mockRejectedValue(error);

			const { result } = renderHook(() => useCustomHook('test-url'));

			act(() => {
				result.current.refetch();
			});

			await act(async () => {
				await new Promise((resolve) => setTimeout(resolve, 0));
			});

			expect(result.current.data).toBeNull();
			expect(result.current.loading).toBe(false);
			expect(result.current.error).toBe('Network error');
		});
	});

	describe('Hook Cleanup', () => {
		it('should cleanup properly on unmount', () => {
			const { unmount } = renderHook(() => useCustomHook('test-url'));

			// No errors should be thrown on unmount
			expect(() => unmount()).not.toThrow();
		});
	});

	describe('Hook Dependencies', () => {
		it('should refetch when URL changes', async () => {
			const { result, rerender } = renderHook(
				({ url }) => useCustomHook(url),
				{ initialProps: { url: 'test-url-1' } },
			);

			expect(mockHttpClient.get).toHaveBeenCalledWith('test-url-1');

			rerender({ url: 'test-url-2' });

			expect(mockHttpClient.get).toHaveBeenCalledWith('test-url-2');
			expect(mockHttpClient.get).toHaveBeenCalledTimes(2);
		});
	});
});
```

### Integration Testing Template

```typescript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { PageComponent } from './PageComponent.tsx';

// Wrapper for components that need router context
const RouterWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
	<BrowserRouter>{children}</BrowserRouter>
);

describe('PageComponent Integration', () => {
	it('should handle complete user workflow', async () => {
		const user = userEvent.setup();

		render(<PageComponent />, { wrapper: RouterWrapper });

		// User interaction flow
		const nameInput = screen.getByLabelText(/name/i);
		const emailInput = screen.getByLabelText(/email/i);
		const submitButton = screen.getByRole('button', { name: /submit/i });

		await user.type(nameInput, 'John Doe');
		await user.type(emailInput, 'john@example.com');
		await user.click(submitButton);

		// Verify the complete workflow
		await waitFor(() => {
			expect(screen.getByText(/success/i)).toBeInTheDocument();
		});
	});
});
```

## Technical Checklist

### Test Coverage

- [ ] Component renders correctly with different props
- [ ] User interactions trigger expected behaviors
- [ ] Loading, error, and success states are tested
- [ ] Accessibility features work as expected
- [ ] Edge cases and error scenarios are handled
- [ ] Form validation and submission tested
- [ ] Navigation and routing tested (for pages)

### Best Practices

- [ ] Tests are independent and isolated
- [ ] Proper mocking of external dependencies
- [ ] Use of appropriate testing utilities
- [ ] Descriptive test names and structure
- [ ] Setup and cleanup handled correctly
- [ ] No brittle implementation details tested

### Accessibility Testing

- [ ] ARIA attributes and roles tested
- [ ] Keyboard navigation functionality
- [ ] Screen reader compatibility
- [ ] Focus management
- [ ] Color contrast considerations

### Performance Testing

- [ ] No memory leaks in component tests
- [ ] Proper cleanup of event listeners
- [ ] Hook dependency optimization
- [ ] Re-render behavior testing

Generate comprehensive tests following these patterns and ensure they cover all critical functionality and edge cases.
