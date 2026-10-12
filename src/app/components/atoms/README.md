# Atoms (Atomic Design)

The **smallest** UI blocks: presentational, no app state, no business logic. Props in, JSX out.
Reusable and "dumb".

**Examples:** `Button`, `Input`, `Icon`, `Badge`, `Spinner`.

## Rules

- No `store/` reads, no `fetch`, no routing. Props only.
- Co-located CSS Modules (`*.module.css`); typed props; a single responsibility.
- Scaffold: `react-component-stateless`.

Full methodology: the [`structure-state`](../../../../.ai/skills/structure-state.md) skill.
