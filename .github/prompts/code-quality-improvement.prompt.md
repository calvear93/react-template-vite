---
mode: agent
description: 'Improve code quality following React TypeScript template standards and best practices'
---

# Code Quality Improvement Prompt

Improve the code quality of [FILE/COMPONENT] by:

1. Applying TypeScript and React best practices
2. Improving error handling and validation
3. Optimizing React performance (memoization, lazy loading)
4. Enhancing code readability and maintainability
5. Following the project's coding standards
6. Ensuring proper dependency injection with IoC container
7. Adding missing JSDoc documentation
8. Improving test coverage for components and hooks
9. Applying consistent naming conventions
10. Removing code duplication and improving reusability

## Maintain:

- Backward compatibility
- Existing functionality and component behavior
- Test coverage
- Type safety
- Project architecture patterns
- Accessibility features

## Code Quality Areas:

### TypeScript & React Best Practices:

- Use explicit types instead of `any`
- Implement proper interface definitions for props
- Apply union types and generics appropriately
- Use type guards for runtime type checking
- Implement proper React patterns (hooks, functional components)

### Error Handling:

- Implement proper error boundaries
- Use meaningful error messages for users
- Apply proper loading and error states
- Follow React error handling patterns

### Performance Optimization:

- Identify and fix React performance bottlenecks
- Implement React.memo, useMemo, useCallback appropriately
- Optimize component re-renders
- Implement lazy loading for code splitting

### Code Organization:

- Apply single responsibility principle to components
- Remove code duplication across components
- Improve component and variable naming
- Organize imports properly (external → internal → relative)
- Extract custom hooks for reusable logic

### Accessibility & UX:

- Ensure proper ARIA attributes
- Implement keyboard navigation
- Provide meaningful error messages
- Add loading states for better UX

## Quality Checklist:

- [ ] TypeScript strict mode compliance
- [ ] Proper error handling and error boundaries implemented
- [ ] React performance optimizations applied
- [ ] Code duplication removed
- [ ] JSDoc documentation updated
- [ ] Test coverage maintained for components and hooks
- [ ] Naming conventions followed
- [ ] React architecture patterns respected
- [ ] Dependencies properly injected via IoC
- [ ] Accessibility guidelines followed
- [ ] CSS Modules and styling properly organized
- [ ] Configuration externalized
