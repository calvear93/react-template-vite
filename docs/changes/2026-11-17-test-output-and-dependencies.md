---
status: done # planned | in-progress | done | dropped
---

# Vitest without pipeline reports, and the dependencies up to date

## Goal

This template has no pipeline: the reports `2026-11-17-performance-pass.md` kept for one (the list
of every test, lcov, Cobertura, JSON) are configuration nobody uses. And the dependencies with a
newer major are brought up to date, `typescript` apart.

## Plan

- [x] `vitest.config.ts`: the reporters of a desk only
- [x] `eslint-plugin-unicorn` 80, `vitest-mock-extended` 6, `pnpm` 12.21; what the new lint rules
      mark, fixed in the code

## Decisions

- One set of reporters: `default`, and the files not fully covered with a summary · revisits
  `2026-11-17-performance-pass.md`, which wrote the pipeline's reports when `CI` was set: there is
  no pipeline, and a project that adds one adds its reporters with it.
- `eslint-plugin-unicorn` 80.0.0 and `vitest-mock-extended` 6.0.1; `pnpm` 12.21.0 in
  `packageManager` and in the `PNPM_VER` of the `Dockerfile` · `typescript` stays on 6.0.3, as
  asked.
- `oxc-transform-react` stays on 0.156.0 · `@vitejs/plugin-react` 6.3.0 asks for
  `>=0.152.0 <0.157.0`, and the React Compiler goes through it.

## Verification

- Gate: `pnpm lint` and `pnpm stylelint` clean (no warning), `tsc --noEmit` clean,
  `pnpm build:dev` built, `pnpm test:dev --coverage --run` → 135 files, 1,890 tests passed;
  coverage 99.76 % / 97.98 % / 100 % / 99.93 % (run with `2026-11-17-kit-vite-plugin.md`).
- Unicorn 80 marks nothing in the code: the rules the config names are all still there.
- `pnpm why`: `eslint-plugin-unicorn@80.0.0`, `vitest-mock-extended@6.0.1`; `pnpm --version`
  12.21.0. A test run with coverage prints 307 lines.

## Not included / assumptions

- `typescript` 7 and `oxc-transform-react` 0.158, for the reasons above.
- The image was not built (Docker was not running): only its `PNPM_VER` changed.
