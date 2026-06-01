# AGENTS.md

> Single source of truth for **all** AI coding assistants working in this repository
> (GitHub Copilot, Claude, Gemini, Codex, Cursor, and any agent that reads `AGENTS.md`).

This is a modern, production-ready **React + TypeScript SPA template** built on Vite. It
emphasizes type safety end-to-end, dependency injection via a custom IoC container,
feature flags, type-safe routing, and comprehensive testing.

## How to use this document

- This file is the canonical, tool-agnostic instruction set. `CLAUDE.md`, `GEMINI.md`,
  and `.github/copilot-instructions.md` are thin pointers to this file — **do not**
  duplicate guidance into them.
- Keep this file as the high-level contract (stack, rules, conventions). Long-form
  detail lives in the deep references at the bottom; link to them instead of repeating.
- User instructions (a direct request in chat) always take precedence over this file.

## Tech stack

| Area              | Choice                                     |
| ----------------- | ------------------------------------------ |
| Framework         | React 19+ with TypeScript 5+               |
| Build tool        | Vite (HMR dev server + production builds)  |
| Router            | React Router 7+ via `#libs/router`         |
| Validation        | Zod 4+ (TypeScript-first schemas)          |
| Local/atom state  | Jotai + React hooks                        |
| Dependency inject | Custom IoC container via `#libs/ioc`       |
| Feature flags     | Custom system via `#libs/feature`          |
| Styling           | CSS Modules + UnoCSS (atomic CSS)          |
| Testing           | Vitest + React Testing Library (happy-dom) |
| Coverage          | Vitest Coverage V8 (target ≥ 80%)          |
| Mutation testing  | Stryker Mutator                            |
| Env loading       | `@calvear/env` (`env/` folder)             |
| Tooling           | ESLint + Prettier + Stylelint, pnpm        |
| Runtime           | Node `>=24`, pnpm `>=11`                   |

## Commands

```bash
pnpm start:dev                   # dev server with HMR (dev environment)
pnpm start:release               # dev server (release environment)
pnpm test:dev                    # tests in watch mode
pnpm test:dev --run              # tests once (no watch)
pnpm test:dev --coverage --run   # tests once with coverage (CI/validation)
pnpm test:mutation               # Stryker mutation tests (validate test quality)
pnpm lint                        # ESLint (cached)
pnpm stylelint                   # CSS linting
pnpm format                      # Prettier (write)
pnpm env:schema                  # regenerate env JSON schema after config changes
pnpm build:dev                   # build (dev environment)
pnpm build:release               # build (release environment)
pnpm preview                     # build dev + preview locally
```

Run `pnpm lint && pnpm format && pnpm test:dev --coverage --run` before finalizing
non-trivial changes.

## Project structure

```
src/
  app/            feature code: pages, components, layouts, atoms, app.ioc, app.routes
  libs/           reusable libraries (ioc, router, feature) with their own README
env/              environment configuration (appsettings.json + <env> files)
```

Path aliases (see `package.json#imports`): `#libs/ioc`, `#libs/router`, `#libs/feature`.
See **architecture-guide** for full folder topology and wiring.

## Core principles

- **Type safety first** — leverage TypeScript and Zod from UI to data layer; never `any`.
- **Inject, never hardcode** — all config and services flow through the IoC container.
- **Logic in hooks** — keep components declarative; move business logic into custom hooks.
- **Accessibility by default** — semantic HTML and ARIA on every interactive component.
- **Test what you ship** — unit + integration tests; meaningful assertions (mutation-aware).
- **YAGNI** — minimal, atomic changes; no speculative abstractions.

## Critical rules

These are non-negotiable. Violations should be fixed before code is considered done.

### Configuration & dependency injection

- **NEVER** hardcode URLs, API keys, or configuration inside components, hooks, or services.
- Keep `import.meta.env` access centralized in a config/bootstrap layer (e.g. an
  `app.config.ts` parsed with Zod) instead of scattering it across components and hooks.
- Define non-secret config in `env/appsettings.json`; secrets in `env/<env>.env.json` /
  `env/<env>.local.env.json` (this template ships `dev` and `release` as examples).
- Bind config and services in the bootstrap layer (`app.ioc.ts`, which calls
  `createContainer()` from `#libs/ioc`) and consume them with the `useInjection` hook.
  See **architecture-guide** → Configuration architecture.

### Language policy

- All code and documentation is in **English**: identifiers, comments, props, errors, docs.
- **Exception:** preserve business-domain terms in their original language when the user
  explicitly defines them as domain entities (e.g. `Siniestro`, `Episodio`). Implementation
  around them stays in English.

### TypeScript & validation

- Explicit types everywhere; no `any` (prefer `unknown` + narrowing).
- Use Zod schemas for form data, API responses, and complex prop validation.
- Prefer `async`/`await` over raw Promises; always handle the error path.

### Accessibility

- Use semantic elements and proper ARIA roles/labels; ensure keyboard navigation and
  focus management for interactive components.

## Code style (essentials)

- Tabs for indentation (width 4); single quotes; semicolons; trailing commas (all); ~80 col width.
- Arrow functions with parens around params; named exports preferred over default exports.
- Include `.ts`/`.tsx` extensions in relative imports; use `#libs/*` aliases for libraries.
- Import order: external packages → `#libs/*` → relative imports.
- Files `kebab-case`, components `PascalCase`, functions/vars `camelCase`,
  module constants `SCREAMING_SNAKE_CASE`, private members prefixed `_`.

Full ruleset, file-suffix table, and anti-patterns: **coding-standards**.

## Testing

- Vitest + React Testing Library; assert on user-visible output, not internals.
- Inject mocked dependencies with `InversionOfControlProvider` + a `mockIoCValues` Map.
- Cover happy path, loading/error states, and at least one edge case. Target ≥ 80% coverage.
- Place `*.spec.tsx`/`*.spec.ts` alongside source files.

Worked test recipes: **patterns** → Testing patterns.

## Commit conventions

Use **Conventional Commits with Gitmoji**:

```
<type>(<optional scope>) <gitmoji>: <description>
```

Examples:

```
feat(auth) ✨: add token refresh flow
fix(router) 🐛: resolve lazy route fallback
refactor(hooks) ♻️: extract data-fetching logic
test(user) ✅: cover edit error state
chore(deps) 🔧: bump vite
```

Common types: `feat` ✨, `fix` 🐛, `docs` 📚, `style` 🎨, `refactor` ♻️, `perf` ⚡,
`test` ✅, `chore` 🔧, `ci`, `build`. Security 🔒, UI 💄, remove 🗑️, move 🚚.

## Deep references

| Document                                                                      | Scope                                                                          |
| ----------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| [Architecture guide](.github/instructions/architecture-guide.instructions.md) | Folder topology, IoC/config wiring, routing, feature flags, import conventions |
| [Coding standards](.github/instructions/coding-standards.instructions.md)     | Formatting, naming, file suffixes, TypeScript rules, comments, anti-patterns   |
| [Patterns](.github/instructions/patterns.instructions.md)                     | Copy-paste recipes: components, hooks, services, schemas, forms, errors, tests |
| [Code exemplars](exemplars.md)                                                | Pointers to high-quality real examples in this repo                            |
| [README](README.md)                                                           | Human-facing project documentation and setup                                   |

Task-specific prompts (Copilot/VS Code) live in `.github/prompts/`; reusable agent
definitions in `.github/agents/`.
