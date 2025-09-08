---
mode: agent
description: 'Create a new React component following React TypeScript template best practices'
---

# React Component Creation Prompt

Create a new React component for [COMPONENT_DESCRIPTION] following these requirements:

## Core Requirements

### 1. Component Structure

- Use React.FC type with proper TypeScript props interface
- Implement functional component with modern React patterns
- Follow atomic design principles (atoms, molecules, organisms)
- Use descriptive component and file naming (PascalCase for components)

### 2. TypeScript Integration

- Define comprehensive props interface with JSDoc comments
- Use Zod validation for complex props or form data
- Include proper generic types when applicable
- Export both component and props interface

### 3. Styling & Design

- Apply CSS Modules for component-specific styling
- Use UnoCSS utilities for common patterns (spacing, colors, layout)
- Implement responsive design that works on all screen sizes
- Follow consistent design system patterns

### 4. Accessibility & UX

- Include proper ARIA attributes (labels, roles, descriptions)
- Use semantic HTML elements appropriately
- Ensure keyboard navigation support
- Handle focus management for interactive elements
- Provide meaningful error messages and feedback

### 5. State Management

- Use React hooks for local component state
- Integrate with custom IoC container when needed (useInjection hook from ./app.ioc.ts)
- Handle loading, error, and success states appropriately
- Implement proper cleanup with useEffect when necessary

### 6. Error Handling

- Include error boundaries for async operations
- Validate inputs and provide user-friendly error messages
- Handle edge cases gracefully
- Log errors appropriately for debugging

### 7. Testing & Documentation

- Create comprehensive unit tests with React Testing Library
- Test user interactions and accessibility features
- Include JSDoc comments with prop descriptions
- Document complex business logic and patterns

## Implementation Patterns

### Basic Component Template

```typescript
interface ComponentNameProps {
	/** Description of the prop with expected format */
	propName: string;
	/** Optional callback for user interactions */
	onAction?: (data: ActionData) => void;
	/** Loading state for async operations */
	isLoading?: boolean;
	/** Additional CSS classes for styling */
	className?: string;
}

/**
 * [Component description explaining purpose and functionality]
 *
 * @param props - Component props
 * @returns JSX element with [functionality description]
 */
export const ComponentName: React.FC<ComponentNameProps> = ({
	propName,
	onAction,
	isLoading = false,
	className,
}) => {
	// Component implementation
};
```

### Component with IoC Integration

```typescript
import { useInjection } from './app.ioc.ts'; // adjust path based on component location

export const DataComponent: React.FC<DataComponentProps> = ({ userId }) => {
	const httpClient = useInjection(HttpClient);
	const config = useInjection(AppConfig);

	// Use injected dependencies
};
```

### Form Component with Validation

```typescript
const FormSchema = z.object({
	name: z.string().min(1, 'Name is required'),
	email: z.string().email('Invalid email format'),
});

type FormData = z.infer<typeof FormSchema>;

export const FormComponent: React.FC<FormProps> = ({ onSubmit }) => {
	// Form implementation with Zod validation
};
```

## Technical Checklist

### Essential Features

- [ ] TypeScript interface defined with JSDoc comments
- [ ] React.FC implementation with proper props typing
- [ ] CSS Modules created with responsive styling
- [ ] Accessibility features (ARIA attributes, semantic HTML)
- [ ] Error handling for all user interactions
- [ ] Loading states for async operations
- [ ] Unit tests covering component behavior and interactions

### Advanced Features

- [ ] Integration with custom IoC container when needed
- [ ] Zod validation for complex data structures
- [ ] Error boundaries for async error handling
- [ ] Performance optimization (React.memo, useMemo, useCallback)
- [ ] Internationalization support if applicable
- [ ] Dark mode support if part of design system

### Code Quality

- [ ] No hardcoded values (use configuration injection)
- [ ] Proper separation of concerns (logic in custom hooks)
- [ ] Consistent naming conventions throughout
- [ ] Clean and readable code structure
- [ ] Comprehensive error handling and user feedback

### Testing Coverage

- [ ] Component renders correctly with different props
- [ ] User interactions trigger expected behaviors
- [ ] Loading and error states display appropriately
- [ ] Accessibility features work as expected
- [ ] Edge cases and error scenarios are handled

Generate the component following these patterns and ensure it integrates seamlessly with the existing React TypeScript architecture.
