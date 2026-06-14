# Molecules (Atomic Design)

A few **atoms** combined into one simple unit with a clear purpose. They stay presentational
(props in, JSX out).

**Examples:** `FormField` (label + input + error), `SearchBox` (input + button), `Card`.

## Rules

- Compose atoms; do **not** reach organisms or read the `store/`.
- Co-located CSS Modules; typed props; one responsibility.
- Scaffold: `react-component-stateless`.

Full methodology: the [`atomic-design`](../../../../.ai/skills/atomic-design.md) skill.
