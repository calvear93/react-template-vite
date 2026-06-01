# Skill: SDD — Implement

Execute the task list with a test-first (TDD) loop, reusing the template's existing skills.

## When to use

After `/tasks`. Input: `specs/NNN-<slug>/tasks.md`.

## Procedure

Work tasks **in order**. For each unchecked task:

1. **Red** — write or adjust the test named in the task first; run it and watch it fail
   (`pnpm test:dev --run`). See the `vitest-tdd` skill for structure and mocking.
2. **Green** — implement the minimum to pass. Reuse the matching task prompt instead of
   reinventing patterns:
    - Component → `.github/prompts/component-creation.prompt.md`
    - Page → `.github/prompts/page-creation.prompt.md`
    - Hook → `.github/prompts/custom-hook-creation.prompt.md`
    - Tests → `.github/prompts/testing-creation.prompt.md`
    - Schemas → `zod-schema` skill · DI → `ioc-binding` skill
3. **Refactor** — clean up while green; keep components declarative, logic in hooks, config
   injected (never hardcoded / no scattered `import.meta.env`).
4. **Conform to the lint contract** (this repo's ESLint): inline `type` imports, single
   quotes, lowercase comments, `Number.parseInt`, sorted imports/JSX props, self-closing
   tags, accessible markup (jsx-a11y), no `console.log`. Run `pnpm lint` as you go.
5. **Check the task off** in `tasks.md` and move on.

Keep changes minimal and atomic. If reality diverges from the plan, note it and, if material,
update `plan.md`/`tasks.md` rather than silently drifting.

## Output

- Summary of files changed per task and current test status.
- **Next step:** `/verify` once all tasks are checked.
