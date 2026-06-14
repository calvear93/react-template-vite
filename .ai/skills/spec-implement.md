# Skill: Spec — Implement

Execute the change's task list with a typecheck → test → fix loop, reusing the template's
existing prompts. This is the only lifecycle skill with **stack-specific** commands.

## When to use

After `/spec-tasks`. Input: `specs/changes/<change-id>/tasks.md`.

## Stack quality gates — React + Vite + TypeScript

The implement loop runs against the local Vite/Vitest toolchain:

```bash
pnpm install                  # restore dependencies (first run)
pnpm test:dev                 # Vitest in watch mode while iterating (--run for one-shot)
pnpm test:dev <pattern>       # focus a subset of specs by file/name pattern
pnpm lint                     # ESLint (cached, auto-fix)
pnpm stylelint                # CSS linting
pnpm build:dev                # type-checked production build (verifies typecheck)
```

> Porting to another stack: replace only this section and the per-step commands below with the
> repo's build/test/lint loop. The rest of the procedure is stack-agnostic.

## Procedure

Work tasks **in order**. For each unchecked task:

1. **Red** — write or adjust the co-located Vitest spec named in the task first (`*.spec.tsx` /
   `*.spec.ts` next to the source). Run it and watch it fail for the right reason
   (`pnpm test:dev <pattern>`). See the `vitest-tdd` skill for structure and mocking.
2. **Green** — implement the minimum to pass, reusing the matching prompt instead of
   reinventing patterns:
    - Component → `.ai/prompts/create-component.md`
    - Page → `.ai/prompts/create-page.md`
    - Custom hook → `.ai/prompts/create-hook.md`
    - Tests → `.ai/prompts/create-test.md`
    - Zod schemas → `zod-schema` skill · IoC bindings → `ioc-binding` skill
    - Vite/build config → `vite-config` skill
3. **Typecheck clean** — keep the build green (`pnpm build:dev`) and fix every type error
   before moving on. Inject config/services through the IoC container; never hardcode URLs/keys
   or scatter `import.meta.env`.
4. **Conform to the conventions** (`AGENTS.md` + `coding-standards`): tabs (width 4); single
   quotes; semicolons; trailing commas; named exports; `#libs/*` aliases; inline `type`
   imports; sorted imports/JSX props; self-closing tags; accessible markup (jsx-a11y); no
   `any`; no `console.log`. Run `pnpm lint` (and `pnpm stylelint` for CSS) as you go.
5. **Check the task off** in `tasks.md`, run `pnpm test:dev --run`, and move on.

Keep changes minimal and atomic. If reality diverges from the design, note it and, if
material, update `design.md`/`tasks.md` — and update the **deltas** if the observable behavior
itself changed (the deltas must still describe what you shipped). Do not silently drift.

## Output

- Summary of files changed per task and current typecheck/test status.
- **Next step:** `/spec-archive` once all tasks are checked.
