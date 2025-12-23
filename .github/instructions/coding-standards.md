---
applyTo: 'src/**/*.{ts,cts,mts}'
description: 'Coding style instructions for TypeScript files'
---

# TypeScript Code Style Guidelines

## 🎨 Code Formatting

- **Indentation**: Use tabs (not spaces, length 4) for indentation
- **Line Length**: Limit lines to 80 characters
- **Quotes**: Use single quotes for strings
- **Arrow Functions**: Always use parentheses around arrow function parameters
- **Bracket Spacing**: Add spaces inside object brackets
- **Bracket Same Line**: Place closing bracket on new line
- **Complexity limit**: Maximum cyclomatic complexity of 15
- **Magic numbers**: Avoid magic numbers (use named constants)
- **Unused variables**: Remove unused imports and variables
- **Prefer const**: Use `const` for variables that don't change
- **Promise handling**: Always handle promises properly
- **Semicolons**: Always use semicolons at end of statements
- **Trailing commas**: Use trailing commas in all multi-line constructs

### Test Organization

```typescript
describe('UserService', () => {
	// shared variables
	let service: UserService;
	let repository: UserRepository;

	// mocks
	const mockRepository: Mock<UserRepository> = {
		findById: vi.fn(),
		save: vi.fn(),
		delete: vi.fn(),
	};

	// hooks
	beforeAll(async () => {
		service = new UserService(mockRepository);
	});

	afterEach(() => {
		// be explicit about mock cleanup
		vi.clearAllMocks();
	});

	// tests
	describe('when finding users', () => {
		test('should return user when ID exists', () => {
			// arrange
			const userId = 1;
			const expectedUser = { id: 1, name: 'John' };
			mockRepository.findById.mockResolvedValue(expectedUser);

			// act
			const result = service.findById(userId);

			// assert
			expect(result).resolves.toEqual(expectedUser);
			expect(mockRepository.findById).toHaveBeenCalledWith(userId);
		});

		test('should throw when user not found', () => {
			// arrange
			const userId = 999;
			mockRepository.findById.mockResolvedValue(null);

			// act & assert
			expect(() => service.findById(userId)).rejects.toThrow(
				NotFoundException,
			);
		});
	});

	describe('when creating users', () => {
		test('should save user successfully', () => {
			// arrange
			const userData = { name: 'John', email: 'john@example.com' };

			// act
			const result = service.createUser(userData);

			// assert
			expect(result).toBeDefined();
			expect(mockRepository.save).toHaveBeenCalledWith(userData);
		});
	});
});
```

### Test Structure and Comments

**Required test commenting pattern:**

1. **Section Organization**: Always use these section comments in order:
    - `// shared variables` - for test variables and dependencies
    - `// mocks` - for mock objects and factory functions
    - `// hooks` - for beforeAll, beforeEach, afterEach, afterAll
    - `// tests` - to separate the test organization from actual tests

2. **Test Case Structure**: Always use arrange/act/assert pattern:
    - `// arrange` - setup test data, mocks, and initial state
    - `// act` - execute the function or method under test
    - `// assert` - verify expectations and results
    - `// act & assert` - when action and assertion are combined (e.g., expect().toThrow())

```typescript
// use 'test' function over 'it'
test('should create user when valid data provided', () => {
	// arrange
	const userData = { name: 'John', email: 'john@example.com' };

	// act
	const result = service.createUser(userData);

	// assert
	expect(result).toBeDefined();
	expect(mockRepository.save).toHaveBeenCalledWith(userData);
});

// for error cases that throw immediately
test('should throw BadRequestException for invalid email', () => {
	// arrange
	const invalidUserData = { name: 'John', email: 'invalid-email' };

	// act & assert
	expect(() => service.createUser(invalidUserData)).toThrow(
		BadRequestException,
	);
});
```

## 🏗️ Naming Conventions

### Classes, Interfaces, Types and Enums

```typescript
// use PascalCase for classes, interfaces, types, and enums
export const UserCard: React.FC = () => {};
export interface UserData {}
export type UserRole = 'admin' | 'user';

// PascalCase for enums with SCREAMING_SNAKE_CASE for members
export enum UserStatus {
	ACTIVE,
	INACTIVE,
	PENDING_VERIFICATION,
}

// prefer const enums for better performance
const enum WeekEndDayEnum {
	SUNDAY,
	SATURDAY,
}
```

### Methods, Variables and Properties

```typescript
// use camelCase for methods, variables, and properties
const userData = {};
const isUserActive = true;

getUserProfile() {}
validateUserData() {}

// use underscore prefix for private members
class UserService {
	private _repository: UserRepository;
	private _logger: Logger;

	private _validateInput() {}
}
```

### Constants

```typescript
// use SCREAMING_SNAKE_CASE for module-level constants and primitives
// NOTE: do not hardcode environment-specific URLs in app code; inject them via config.
const API_BASE_URL = 'https://example.invalid';
const MAX_RETRY_ATTEMPTS = 3;
const PI = 3.1415;
const EARTH_RATIO = 6_371;
```

### Files and Directories

- **File Names**: Use kebab-case for all file names (e.g., `user-service.ts`, `auth-guard.spec.ts`)
- **Directory Names**: Use kebab-case for directory names (e.g., `user-management/`, `auth-modules/`)
- **Module Organization**: Follow feature-based modules with clear separation of concerns
- **Barrel Exports**: Use index.ts files for clean imports and exports
- **Test Files**: Use `.spec.ts` suffix for unit tests, `.e2e-spec.ts` for integration tests

### Important File Suffixes

Use these semantic suffixes to clearly identify file content and purpose in this React SPA:

| **Suffix**      | **Purpose**             | **Example**            | **Exports**           |
| --------------- | ----------------------- | ---------------------- | --------------------- |
| `.tsx`          | React components        | `UserCard.tsx`         | `const UserCard`      |
| `.page.tsx`     | Page components         | `User.page.tsx`        | `const UserPage`      |
| `.layout.tsx`   | Layout components       | `App.layout.tsx`       | `const AppLayout`     |
| `.hook.ts`      | Custom React hooks      | `useUser.hook.ts`      | `const useUser`       |
| `.service.ts`   | Business logic services | `user.service.ts`      | `const userService`   |
| `.schema.ts`    | Validation schemas      | `user.schema.ts`       | `const UserSchema`    |
| `.interface.ts` | TypeScript interfaces   | `user.interface.ts`    | `interface IUser`     |
| `.type.ts`      | Type definitions        | `user.type.ts`         | `type UserRole`       |
| `.enum.ts`      | Enumerations            | `status.enum.ts`       | `enum UserStatus`     |
| `.atom.ts`      | State atoms             | `user.atom.ts`         | `const userAtom`      |
| `.spec.ts`      | Unit tests              | `user.service.spec.ts` | test functions        |
| `.test.ts`      | Integration tests       | `user.module.test.ts`  | test functions        |
| `.e2e.ts`       | End-to-end tests        | `user.e2e.ts`          | test functions        |
| `.guard.ts`     | Authentication guards   | `auth.guard.ts`        | `class AuthGuard`     |
| `.decorator.ts` | Custom decorators       | `roles.decorator.ts`   | decorator functions   |
| `.config.ts`    | Configuration objects   | `app.config.ts`        | configuration objects |
| `.utils.ts`     | Utility functions       | `string.utils.ts`      | utility functions     |
| `.constants.ts` | Shared constants        | `router.constants.ts`  | constant values       |
| `.factory.ts`   | Factory functions       | `http.factory.ts`      | factory functions     |
| `.provider.tsx` | React providers         | `Feature.provider.tsx` | provider components   |

### Boolean Variables

```typescript
// use meaningful prefixes: is, are, has, have, can, etc.
const isEnabled = false;
const hasAccess = true;
const canEdit = true;
const areUsersDisabled = true;

// avoid negative boolean names unless for optimization
// ❌ Bad
const isNotEnabled = true;
// ✅ Good
const isEnabled = false;

// ✅ Acceptable for optimization (when true case is more common)
const isNotCached = false; // when most items are cached
const isNotOptimized = true; // when optimization is rare
```

## 🎯 TypeScript Specific Rules

### Type Annotations and Interfaces

```typescript
// always use explicit types for function parameters and return types
async createUser(userData: UserDto): Promise<UserDto> {
	return this.userService.create(userData);
}

// prefer interfaces for object types instead of type aliases
interface UserConfig {
	readonly apiKey: string;
	timeout: number;
}

// use type aliases for unions or primitives extensions
type UserRole = 'admin' | 'user' | 'moderator';
type UserId = string;
```

### Function Declarations

```typescript
// prefer arrow functions over function declarations
const sum = (n1: number, n2: number) => {
	return n1 + n2;
};

// prefer inline typing over separate type declarations
// ❌ Avoid
const sum: (n1: number, n2: number) => number = (n1, n2) => {
	return n1 + n2;
};

// ✅ Prefer
const sum = (n1: number, n2: number) => {
	return n1 + n2;
};

// export type if needed in other modules
export type SumFn = typeof sum;
```

### Default Parameters and Optional Properties

```typescript
// use default parameters instead of post-assignments
// ❌ Bad
const myFn = (myArg: string | undefined) => {
	const myArgValue = myArg || 'default value';
};

// ✅ Good
const myFn = (myArg = 'default value') => {
	// ...
};

// prefer optional modifier over undefined
// ❌ Bad
const myFn = (myArg: string | undefined) => {
	// ...
};

// ✅ Good
const myFn = (myArg?: string) => {
	// ...
};
```

### Parameter Objects

```typescript
// use parameter objects for more than 3 arguments
// ❌ Bad
const myFn = (m1: number, m2: number, m3: number, m4: number) => {
	// ...
};

// ✅ Good
interface MyFnInput {
	m1: number;
	m2: number;
	m3: number;
	m4: number;
}

const myFn = ({ m1, m2, m3, m4 }: MyFnInput) => {
	// ...
};
```

### Null Coalescing and Assignment

```typescript
// prefer ?? (nullish coalescing) over || or ternary
// ❌ Bad
let myVar = myVar || 'default value';
let myVar = myVar ? myVar : 'default value';

// ✅ Good
let myVar = myVar ?? 'default value';

// even better with nullish assignment
myVar ??= 'default value';
```

### Decorators

```typescript
// place decorators on separate lines, grouped logically
@ApiKey()
// JSX element
export const UserCard: React.FC<UserCardProps> = ({ user, onEdit }) => {
	return (
		<div className={styles.card}>
			<h2>{user.name}</h2>
			<p>{user.email}</p>
			<button onClick={() => onEdit?.(user)}>Edit</button>
		</div>
	);
};

// custom hook
export const useUser = (userId: number) => {
	const [user, setUser] = useState<User | null>(null);
	// hook implementation
	return { user, setUser };
};
```

## 🔧 React Specific Patterns

### Component Structure Order

```typescript
// follow specific order: imports, types/interfaces, component function,
// sub-components, exports
export const UserCard: React.FC<UserCardProps> = ({ user, onEdit }) => {
	// 1. State and refs
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const cardRef = useRef<HTMLDivElement>(null);

	// 2. Custom hooks and context
	const { currentUser } = useAuth();
	const { updateUser } = useUserService();

	// 3. Effects and lifecycle
	useEffect(() => {
		// component mount logic
	}, []);

	// 4. Event handlers
	const handleEdit = useCallback((user: User) => {
		onEdit?.(user);
	}, [onEdit]);

	const handleDelete = async () => {
		// async operation
	};

	// 5. Computed values
	const isEditable = useMemo(() => {
		return currentUser?.id === user.id;
	}, [currentUser, user]);

	// 6. Render
	return (
		<div ref={cardRef} className={styles.card}>
			{/* JSX content */}
		</div>
	);
};
```

### Custom Hooks Pattern

```typescript
export const useUser = (userId: number) => {
	const [user, setUser] = useState<User | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const fetchUser = useCallback(async () => {
		setIsLoading(true);
		try {
			const userData = await userService.findById(userId);
			setUser(userData);
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Unknown error');
		} finally {
			setIsLoading(false);
		}
	}, [userId]);

	useEffect(() => {
		fetchUser();
	}, [fetchUser]);

	return { user, isLoading, error, refetch: fetchUser };
};
```

### DTO Classes with Zod

```typescript
// use Zod with ZodDto pattern and provide schema names for OpenAPI
const UserSchema = z
	.object({
		id: z.coerce.number(),
		name: z.string().min(1),
		email: z.email(),
		phone: phone(), // custom validator
		createdAt: epoch(), // custom validator
	})
	.meta({ description: 'User DTO schema' });

export class UserDto extends ZodDto(UserSchema, 'User') {}
```

### Page Component Structure

```typescript
// src/pages/user/User.page.tsx
interface UserPageProps {
	userId: string;
}

export const UserPage: React.FC<UserPageProps> = ({ userId }) => {
	const { user, isLoading, error } = useUser(userId);
	const navigate = useNavigate();

	if (isLoading) return <LoadingSpinner />;
	if (error) return <ErrorBoundary error={error} />;

	return (
		<div className={styles.page}>
			<UserCard user={user} onEdit={handleEdit} />
		</div>
	);
};
```

### Feature Organization and Barrel Exports

```typescript
// use index.ts files (barrels) to group related exports
// src/app/pages/user/index.ts
export * from './User.page.tsx';
export * from './components/index.ts';
export * from './hooks/index.ts';
export * from './types/index.ts';

// clear feature structure
// src/app/features/user/
//   components/
//     UserCard.tsx
//     UserForm.tsx
//   hooks/
//     useUser.ts
//     useUserService.ts
//   pages/
//     User.page.tsx
//   types/
//     user.types.ts
//   index.ts
```

## 💬 Comment Styles

### Inline Comments

```typescript
// use lowercase for inline comments unless it's a proper noun or acronym
const userData = {}; // user information object
const apiUrl = 'https://api.example.com'; // API endpoint URL
const UUID_PATTERN = /^[0-9a-f]{8}-/; // UUID regex pattern

// proper nouns and acronyms remain capitalized
const jwtToken = '...'; // JWT authentication token
const httpClient = new HttpClient(); // HTTP client instance
const reactComponent = {}; // React component configuration

// JSDoc annotations also use lowercase (except proper nouns/acronyms)
/**
 * @param userData - the user data to create
 * @returns the created user data
 * @throws {BadRequestException} when user data is invalid
 * @throws {NotFoundException} when user ID not found
 * @example createUser({ name: 'John', email: 'john@example.com' })
 */

// single line comments should start with single space
// ✅ Good
// one line comment

// ❌ Bad
//one line comment
//      one line comment

// never follow single line comments with blank lines
// ✅ Good
const x = 1;
// This comment is valid
const y = 2;

// ❌ Bad
const x = 1;
// This comment is not valid

const y = 2;
```

### Anchor Comments for Special Attention

```typescript
// TODO: #123456 add case sensitive support
// FIXME: #123457 empty lists handling
// NOTE: this requires special attention

// SECTION: hooks
beforeAll(() => {
	/* ... */
});
afterAll(() => {
	/* ... */
});

// SECTION: tests
test('should create user', () => {
	/* ... */
});
```

### Block Comments

```typescript
/*
 * API configuration for external services
 * includes timeout and retry settings
 */

/*
 * React Context provider for authentication
 * implements JWT validation and user state
 */
```

### JSDoc Comments

```typescript
/**
 * JSDoc comments should start with uppercase.
 * These are used for documentation generation.
 *
 * @param userData - the user data to create
 * @returns the created user data
 * @throws {BadRequestException} when user data is invalid
 */
async createUser(userData: UserDto): Promise<UserDto> {}

/**
 * API service for handling external requests.
 * Includes retry logic and error handling.
 */
export class ApiService {}
```

### Meaningful Comments

```typescript
// ❌ Bad - comments that restate the obvious
// redirects to contact page
this.router.navigateByUrl(`/${ROOT}/contact`);

// deserializes products struct
this.parseProducts(products);

// ✅ Good - comments that explain why or provide context
// Use exponential backoff to handle rate limiting from external API
await this.retryWithBackoff(() => this.apiCall());

// Business rule: users in trial period have limited access
if (user.trialExpired && !user.isPremium) {
	throw new ForbiddenException('Trial period expired');
}
```

## �📚 Documentation Standards

### JSDoc Comments

```typescript
/**
 * Creates a new user in the system.
 *
 * @param userData - The user data to create
 * @returns The created user data
 * @throws {BadRequestException} When user data is invalid
 */
async createUser(userData: UserDto): Promise<UserDto> {}
```

## 📚 Documentation Standards

### JSDoc Comments

```typescript
/**
 * Creates a new user in the system.
 *
 * @param userData - the user data to create
 * @returns the created user data
 * @throws {BadRequestException} when user data is invalid
 */
async createUser(userData: UserDto): Promise<UserDto> {}
```

### Component Documentation

```typescript
// separate prop type definitions for components
export interface UserCardProps {
	user: User;
	onEdit?: (user: User) => void;
	className?: string;
}

export interface UserCardRef {
	focus: () => void;
	scrollIntoView: () => void;
}

/**
 * User card component with edit functionality
 * @param user - User data to display
 * @param onEdit - Optional callback for edit action
 * @param className - Additional CSS classes
 */
export const UserCard = forwardRef<UserCardRef, UserCardProps>(
	({ user, onEdit, className }, ref) => {
		// component implementation
	}
);
		],
	},
};
```

## ⚡ Performance and Best Practices

### Async/Await Usage

```typescript
// prefer async/await over Promises
async getUserData(id: number): Promise<UserDto> {
	try {
		const user = await this.userService.findById(id);
		return user;
	} catch (error) {
		this.logger.error(`Failed to get user ${id}`, error);
		throw error;
	}
}
```

### Error Handling

```typescript
// use specific error types and React error boundaries
export class UserNotFoundError extends Error {
	constructor(id: number) {
		super(`User with ID ${id} not found`);
		this.name = 'UserNotFoundError';
	}
}

export const useUserData = (id: number) => {
	const [user, setUser] = useState<User | null>(null);
	const [error, setError] = useState<Error | null>(null);

	useEffect(() => {
		const fetchUser = async () => {
			try {
				if (!id || id <= 0) {
					throw new Error('Invalid user ID');
				}

				const userData = await userService.findById(id);
				if (!userData) {
					throw new UserNotFoundError(id);
				}

				setUser(userData);
			} catch (err) {
				setError(err as Error);
			}
		};

		fetchUser();
	}, [id]);

	return { user, error };
};
```

### Meaningful Names and Context

```typescript
// ❌ Bad - requires mental mapping
const u = getUser();
const s = getSubscription();
const t = charge(u, s);

// ✅ Good - explicit and clear
const user = getUser();
const subscription = getSubscription();
const transaction = charge(user, subscription);

// ❌ Bad - unnecessary context repetition
type Car = {
	carMake: string;
	carModel: string;
	carColor: string;
};

// ✅ Good - context is already clear from type name
type Car = {
	make: string;
	model: string;
	color: string;
};
```

### Function and Class Organization

```typescript
// group related types and interfaces with their classes (ducks style)
export interface UserProviderConfig {
	apiKey: string;
	timeout: number;
}

export class UserProvider {
	constructor(config: UserProviderConfig) {
		// ...
	}
}

// rather than separate files for simple, related types
```

## 🚫 Anti-Patterns to Avoid

### General TypeScript Anti-Patterns

- **Don't use `any` type**: Always provide specific types
- **Don't ignore async/await**: Handle promises properly
- **Don't use function declarations**: Prefer arrow functions for consistency
- **Don't mix tabs and spaces**: Use only tabs for indentation (tabWidth: 4)
- **Don't exceed 80 character line limit**: Break long lines appropriately
- **Don't use `var`**: Use `const` or `let` instead
- **Avoid use `#` private fields**: Use `private` modifier for better introspection
- **Avoid use regular enums unless necessary**: Prefer `const enum` for better performance

### Naming Anti-Patterns

```typescript
// ❌ Bad - non-meaningful names
function between(a1: number, a2: number, a3: number): boolean {
	return a2 <= a1 && a1 <= a3;
}

// ✅ Good - meaningful names
function isBetween(value: number, left: number, right: number): boolean {
	return left <= value && value <= right;
}

// ❌ Bad - non-pronounceable names
class Subs {
	public ccId: number;
	public billingAddrId: number;
}

// ✅ Good - pronounceable names
class Subscription {
	public creditCardId: number;
	public billingAddressId: number;
}
```

### Comment Anti-Patterns

```typescript
// ❌ Bad - obvious comments that add no value
const isEnabled = true; // sets isEnabled to true
this.users.push(user); // adds user to users array

// ❌ Bad - outdated or incorrect comments
// calculates tax (but function actually calculates total)
function calculateTotal(price: number): number {
	return price * 1.21;
}

// ❌ Bad - commented out code (use version control instead)
// const oldLogic = () => {
//     // old implementation
// };
```

### Function Anti-Patterns

```typescript
// ❌ Bad - too many parameters
const processUser = (
	id: number,
	name: string,
	email: string,
	age: number,
	address: string,
	phone: string,
) => {
	// ...
};

// ✅ Good - use parameter object
interface ProcessUserParams {
	id: number;
	name: string;
	email: string;
	age: number;
	address: string;
	phone: string;
}

const processUser = (params: ProcessUserParams) => {
	// ...
};

// ❌ Bad - using || for null coalescing
const value = myVar || 'default';

// ✅ Good - using ?? for null coalescing
const value = myVar ?? 'default';
```

## 🎯 TypeScript Preferences

- **Explicit Types**: Always use explicit types, avoid `any`
- **Async/Await**: Prefer async/await over Promises
- **Template Literals**: Use template literals for string interpolation
- **Error Handling**: Include proper error handling with try-catch blocks
- **JSDoc Comments**: Add JSDoc comments for all public methods and complex logic
