# Plan: <feature name>

- **Spec:** ./spec.md
- **Status:** draft | approved

> Technical design that satisfies the spec. Respect `AGENTS.md` and
> `.github/instructions/architecture-guide.instructions.md`. No task breakdown here (that is
> `/tasks`).

## Approach

<High-level technical approach in a few sentences. Note the key decision(s) and why.>

## Affected areas

- **Pages:** `src/app/pages/<...>` — <new/changed>
- **Components:** `src/app/components/<...>`
- **Hooks:** `<...>.hook.ts` — business logic
- **Atoms:** `src/app/atoms/<...>` — shared state (if any)
- **Schemas (Zod):** `<...>.schema.ts`
- **Services / IoC:** bindings in `app.ioc.ts`, injected via `useInjection`
- **Routing:** `app.routes.tsx` (lazy) — <new routes>
- **Libs touched:** `#libs/ioc` · `#libs/router` · `#libs/feature`

## Data & validation

- Zod schemas (and create/update variants). See the `zod-schema` skill.

## Dependency injection

- New services/config and where they bind. Never hardcode config. See the `ioc-binding` skill.

## Testing strategy

- Which acceptance criteria map to which tests (Vitest + RTL). See the `vitest-tdd` skill.

## Risks / trade-offs

- <Edge cases, performance, accessibility, migration concerns.>
