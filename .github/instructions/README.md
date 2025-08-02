# GitHub Instructions and Prompts

This directory contains comprehensive configuration and documentation for development tools and AI assistants working with this React TypeScript project.

## 📁 Directory Structure

### Instructions

- **`copilot-instructions.md`** - Main project instructions and development guidelines for GitHub Copilot
- **`architecture-guide.md`** - Detailed architecture patterns and project structure
- **`coding-standards.md`** - Code style guidelines, naming conventions, and best practices
- **`patterns.md`** - Comprehensive React TypeScript development patterns, testing strategies, and best practices

### Prompts

- **`component-creation.prompt.md`** - Comprehensive prompt for creating React components
- **`page-creation.prompt.md`** - Detailed prompt for creating page components
- **`custom-hook-creation.prompt.md`** - Guide for creating custom React hooks
- **`testing-creation.prompt.md`** - Comprehensive testing prompt with Vitest and React Testing Library
- **`component-documentation.prompt.md`** - Documentation generation prompts
- **`code-quality-improvement.prompt.md`** - Code improvement and refactoring prompts
- **`security-review.prompt.md`** - Security review and validation prompts

## 🚀 Quick Start for AI Assistants

### Project Context

This is a modern React TypeScript SPA template with:

- **Framework**: React v18+ with TypeScript v5+
- **Build Tool**: Vite for fast development and building
- **State Management**: React hooks + custom IoC container
- **Routing**: React Router v6+ with type-safe routing
- **Validation**: Zod v4+ for schema validation
- **Testing**: Vitest with React Testing Library
- **Styling**: CSS Modules + UnoCSS
- **Package Manager**: pnpm

### Essential Commands

```bash
pnpm start:dev                         # Development server with HMR
pnpm test:dev --coverage --run   # Tests with coverage
pnpm lint                        # Code quality checks
pnpm format                      # Code formatting
pnpm build                       # Production build
```

### Key Architecture Patterns

- **Feature-based organization** under `src/app/pages/` and `src/app/components/`
- **Custom IoC container** for dependency injection with React Context
- **Environment-specific configurations** with proper validation
- **Comprehensive testing** with unit tests and integration tests
- **Accessibility-first** development with ARIA support

## 🎯 AI Assistant Guidelines

### For GitHub Copilot

1. **Review `copilot-instructions.md`** for project context and patterns
2. **Use specific prompts** from the prompts directory for better code generation
3. **Follow dependency injection** patterns with the custom IoC container
4. **Never hardcode configurations** - use environment variables and injection

### For Other AI Assistants

1. **Read the architecture guide** to understand project structure
2. **Follow coding standards** for consistent code style
3. **Use the testing patterns** for comprehensive test coverage
4. **Apply accessibility guidelines** for inclusive design

## 🔧 Configuration Management

### Critical Rules

- **No hardcoded values** - all configuration must be externalized
- **Use dependency injection** through the custom IoC container
- **Type-safe configurations** with Zod schema validation
- **Environment-specific settings** for dev/qa/prod

### Example Pattern

```typescript
// ❌ WRONG - Hardcoded
const apiUrl = 'https://api.example.com';

// ✅ CORRECT - Injected
export const UserService: React.FC = () => {
	const httpClient = useInjection(HttpClient);
	const config = useInjection(AppConfig);

	return httpClient.get(`${config.apiBaseUrl}/users`);
};
```

## 📋 Development Workflow

1. **Component Creation**: Use `component-creation.prompt.md` for guidance
2. **Page Development**: Follow `page-creation.prompt.md` patterns
3. **Custom Hooks**: Apply `custom-hook-creation.prompt.md` best practices
4. **Testing**: Use `testing-creation.prompt.md` for comprehensive coverage
5. **Code Review**: Apply `code-quality-improvement.prompt.md` checks

## 🌟 Best Practices

### Component Development

- Use React.FC with proper TypeScript interfaces
- Apply CSS Modules with UnoCSS utilities
- Include accessibility features (ARIA, semantic HTML)
- Handle loading, error, and success states
- Write comprehensive tests with React Testing Library

### State Management

- Use React hooks for local state
- Integrate with IoC container for services
- Implement proper error boundaries
- Handle async operations gracefully

### Testing Strategy

- Unit tests for components and hooks
- Integration tests for user workflows
- Accessibility testing with proper tools
- Mock external dependencies appropriately

This documentation ensures consistent, high-quality code generation and development practices across all AI assistants and developers working on the project.

## Usage

These instruction files are automatically recognized by GitHub Copilot and provide context-aware code suggestions that follow the project's established patterns and conventions.
