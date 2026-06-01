# Skill: SDD — Plan

Turn an approved spec into a technical design. **How, grounded in this template's architecture.**

## When to use

After `/specify`, once `spec.md` is approved. Input: `specs/NNN-<slug>/spec.md`.

## Procedure

1. **Read the spec** and `AGENTS.md` + `.github/instructions/architecture-guide.instructions.md`.
   Explore the relevant existing code (`src/app/`, `src/libs/`) before designing.
2. **Write `specs/NNN-<slug>/plan.md`** from `.ai/templates/plan.template.md`.
3. **Design within the template's conventions:**
    - Feature code under `src/app/` (`pages/`, `components/`, `layouts/`, `atoms/`); shared
      code in `src/libs/`.
    - Business logic in **custom hooks**, not components. Components stay declarative.
    - Data shapes as **Zod schemas** (`zod-schema` skill); derive types with `z.infer`.
    - Services/config via the **IoC container** (`ioc-binding` skill) — never hardcode config
      or read `import.meta.env` scattered in components.
    - Routes are **lazy** and registered in `app.routes.tsx` via `#libs/router`.
    - Use feature flags (`#libs/feature`) for progressive/experimental behavior.
4. **Map acceptance criteria → testing strategy** (Vitest + RTL; `vitest-tdd` skill).
5. **Call out risks/trade-offs:** accessibility (jsx-a11y), performance (memo/lazy), edge cases.
6. **Stay minimal (YAGNI).** No task list yet — that is `/tasks`.

## Output

- The plan path and a short summary of the approach + affected areas.
- Flag any spec ambiguity discovered (loop back to `/specify` if needed).
- **Next step:** `/tasks`.
