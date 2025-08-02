---
mode: agent
description: 'Create comprehensive component documentation using JSDoc and TypeScript'
---

# Component Documentation Prompt

Create comprehensive component documentation for [COMPONENT_NAME] including:

1. JSDoc comments with clear descriptions
2. TypeScript interface documentation
3. Usage examples with different prop combinations
4. Accessibility guidelines and ARIA attributes
5. Styling options and CSS Module classes
6. State management patterns
7. Integration examples with other components
8. Custom hook usage if applicable
9. Error handling patterns
10. Performance considerations

## Follow the project's documentation patterns:

- Use JSDoc standard comments
- Include realistic usage examples
- Document all props and their purposes
- Provide clear accessibility guidance
- Use consistent terminology

## Documentation Structure:

### Component Interface Documentation:

````typescript
/**
 * Props for the UserCard component
 * @interface UserCardProps
 */
interface UserCardProps {
	/** User data to display in the card */
	user: User;
	/** Callback fired when the edit button is clicked */
	onEdit?: (user: User) => void;
	/** Whether the card should be in a loading state */
	isLoading?: boolean;
	/** Additional CSS classes to apply */
	className?: string;
}

/**
 * UserCard - A reusable card component for displaying user information
 *
 * @component
 * @example
 * ```tsx
 * const user = { id: 1, name: 'John Doe', email: 'john@example.com' };
 *
 * <UserCard
 *   user={user}
 *   onEdit={(user) => console.log('Edit user:', user)}
 *   isLoading={false}
 * />
 * ```
 */
export const UserCard: React.FC<UserCardProps> = ({
	user,
	onEdit,
	isLoading,
	className,
}) => {
	// Component implementation
};
````

### Required Documentation Elements:

- **Component Description**: Brief description of what the component does
- **Props Interface**: All props with TypeScript types and JSDoc comments
- **Usage Examples**: Sample usage with different prop combinations
- **Accessibility Notes**: ARIA attributes and keyboard navigation
- **Styling Guide**: Available CSS classes and customization options
- **Performance Notes**: Memoization, re-render considerations
- **Integration Examples**: How to use with other components/hooks

## Documentation Checklist:

- [ ] JSDoc comments applied to component and props interface
- [ ] All props have clear descriptions and types
- [ ] Usage examples provided for common scenarios
- [ ] Accessibility guidelines documented
- [ ] CSS Module classes and styling options documented
- [ ] Performance considerations noted
- [ ] Error handling patterns explained
- [ ] Integration examples with other components provided
- [ ] Custom hooks usage documented if applicable
- [ ] Authentication requirements specified
- [ ] Parameter validation rules included
- [ ] Rate limiting information provided
- [ ] Integration examples included
- [ ] Consistent terminology used
