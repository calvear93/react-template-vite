# Skill: Zod schema design (React)

Design type-safe Zod 4 schemas for forms, API responses, and complex prop validation.

## When to use

Defining or reviewing any data shape, form validation, or runtime-validated boundary.

## Guidelines

- Co-locate schemas as `*.schema.ts`; derive types with `z.infer` — never hand-write a
  duplicate interface.
- Provide actionable messages: `z.string().min(1, 'Name is required')`.
- Use Zod 4 top-level formats: `z.email()`, `z.uuid()`, `z.iso.date()` (not the deprecated
  `z.string().email()`).
- Coerce external/string inputs at the edge: `z.coerce.number()`, `z.coerce.boolean()`.
- Derive variants instead of redefining: `.omit()` for create, `.partial()` for update,
  `.pick()` for field-level validation.
- Validate API responses with `schema.parse(...)`/`safeParse(...)` before trusting them.

## Pattern

```typescript
import { z } from 'zod';

export const UserSchema = z.object({
	id: z.coerce.number().optional(),
	name: z.string().min(1, 'Name is required').max(100),
	email: z.email('Invalid email format'),
	isActive: z.boolean().default(true),
});

export type User = z.infer<typeof UserSchema>;

export const CreateUserSchema = UserSchema.omit({ id: true });
export type CreateUserData = z.infer<typeof CreateUserSchema>;

export const UpdateUserSchema = UserSchema.partial();
export type UpdateUserData = z.infer<typeof UpdateUserSchema>;
```

Form validation uses Zod directly via a small hook (this template has no `react-hook-form`):
collect with `useState`, validate with `safeParse`, surface `error.issues` per field. See
`.github/instructions/patterns.instructions.md` → "Form with Zod validation".

## AOT compilation (`z.compile()`, Zod 4.5) — opt-in

`z.compile(schema)` returns a clone whose validator runs a generated fast path first and falls
back to the runtime parser for anything it can't model. **No API or type change** —
`.parse`/`.safeParse`, `z.infer`, `.omit`/`.partial`, `.refine`/`.transform` all behave
identically. Measured ~2–4x faster on valid payloads.

This template validates schemas mostly at **startup** or on form submit (parsed once, not per
render) — a one-time cost, not a hot path — so `z.compile()` isn't applied by default; the
~85 KB it adds to whichever bundle imports it usually isn't worth it there. Reach for it if a
schema genuinely sits on a hot path (e.g. an API layer parsing many responses per second):

```typescript
const _UserSchema = z.object({/* ... */});

export const UserSchema = z.compile(_UserSchema);

// derived schemas are not compiled by inheritance — re-wrap them
export const CreateUserSchema = z.compile(_UserSchema.omit({ id: true }));
```

## Lint notes

Single quotes, inline `type` imports, sorted object members (id-like first). No `any`.
