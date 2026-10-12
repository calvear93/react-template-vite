# AGENTS.md

These are the canonical, tool-agnostic instructions for every AI assistant in this repo.
`CLAUDE.md` and `GEMINI.md` only import this file, and the skills live in [`.ai/`](.ai/README.md).
Precedence: user instructions, then this file, then existing code patterns.

This is a **React 19 SPA template on Vite**: IoC, feature flags, a typed router, Atomic Design, and a PWA.

## Stack

- **Core:** React 19 with the **React Compiler** on, TypeScript 6 (strict), Vite 8.
- **App libs:** react-router 8 via `#libs/router`, Zod 4, jotai 3.
- **Styling:** UnoCSS + CSS Modules.
- **Build:** vite-plugin-pwa, `@calvear/env`.
- **Tests:** Vitest 5 + Testing Library (happy-dom), Stryker.
- **Runtime:** Node ≥ 24, pnpm ≥ 12.

## Commands

```bash
pnpm start:dev                  # dev server with HMR (http://localhost:3003)
pnpm test:dev --run [path]      # tests once (drop --run for watch)
pnpm test:mutation              # Stryker, for critical logic
pnpm lint --fix                 # ESLint + Prettier (style is enforced here)
pnpm stylelint                  # CSS lint
pnpm env:schema                 # after adding or renaming an env var
pnpm build:dev                  # production build (dist/)
pnpm gen:icons                  # regenerate PWA icons from the source SVG
```

**Gate** (must be green before a change is done):
`pnpm lint && pnpm stylelint && pnpm build:dev && pnpm test:dev --coverage --run`

## Layout

```
src/main.tsx, src/app/App.tsx   bootstrap + providers (IoC, features, router)
src/app/app.{ioc,features,routes}.ts(x)   DI bindings · feature flags · route table
src/app/components/{atoms,molecules,organisms}/   shared UI (Atomic Design)
src/app/layouts/<name>/         <Name>.layout.tsx (templates)
src/app/pages/<name>/           <Name>.page.tsx (+ .module.css, .spec.tsx, components/, store/)
src/app/store/                  app-wide jotai stores (*.store.ts)
src/libs/{ioc,feature,router}   #libs/* (each has a README: the API reference)
env/                            appsettings.json + <env>.env.json (see env/README.md)
.vscode/__templates__/          scaffolds: start every new file from one
```

The reference implementation is `src/app/pages/detail/` (page, lazy route, IoC, feature flags,
store and specs).

## Rules (the ones lint can't check)

- **No manual memoization.** The React Compiler handles it, so don't add `useMemo`,
  `useCallback` or `memo` unless profiling proves a need. Effects are only for syncing with
  external systems.
- **Config:** never hardcode URLs or keys. Use `import.meta.env.APP_*` directly, since Vite
  inlines it at build time. Only `APP_*` vars reach the browser, and everything there is
  **public**: no secrets in a SPA. `process` doesn't exist in the browser (lint-enforced);
  `process.env` is build-time only (`vite.config.ts`, `uno.config.ts`).
- **Services:** data access is a service bound in `app.ioc.ts` and resolved with `useInjection`,
  never a raw `fetch` in a component. Validate external data with Zod.
- **UI states:** every async UI handles loading, empty and error.
- **Structure and state:** follow [`structure-state`](.ai/skills/structure-state.md) for
  Atomic Design levels, page and layout files, and jotai stores.
- **App libs:** IoC, feature flags and routing work as described in
  [`app-libs`](.ai/skills/app-libs.md). Pages need a default export (`lazy()`).
- **Tests:** ship tests with the code, ≥ 80% coverage. See [`testing`](.ai/skills/testing.md).
  Auto-cleanup is **off**.
- **Types and checks:** prefer `unknown` or generics. `any` (a lint warning) is fine when an exact
  type adds complexity without safety. No `@ts-expect-error` or `eslint-disable` to dodge an
  error.
- **Style is tooling-owned.** Formatting, import, prop and member order, file naming and hooks
  rules are enforced by ESLint, Prettier and Stylelint. Run `pnpm lint --fix`.

## Language

Code, comments, docs and commits are in **English**. Exception: business-domain terms the user
defines as entities (e.g. `Siniestro`) keep their original name. Talk to the user in their
language.

## Commits

Use Conventional Commits + Gitmoji: `<type>(<scope>) <gitmoji>: <description>`.
For example: `feat(cart) ✨: add coupon field`, `fix(router) 🐛: …`, `refactor ♻️`, `test ✅`,
`docs 📚`, `chore(deps) 🔧`. For non-trivial changes, add `Refs: docs/changes/<file>.md` to the
commit body.

## How to work

Follow [`ways-of-working`](.ai/skills/ways-of-working.md). It covers autonomy, how to right-size
a change, change records ([`docs/changes/`](docs/changes/README.md)), and the Definition of Done.
