# Organisms (Atomic Design)

**Complex, self-contained** sections composed of molecules/atoms. **State can enter here**: they
read the `store/` (`useAtom*`) and inject services via IoC (`useInjection`), then pass data down
as props.

**Examples:** `Header`, `Footer`, `DataTable`, a full form.

## Rules

- Compose molecules/atoms; state/services enter at this level (or pages), not below.
- Extract logic into hooks (`useX`); CSS Modules; typed props.
- Scaffold: `react-component` (stateful) or `react-component-versioned` (feature-flagged).

Full methodology: the [`atomic-design`](../../../../.ai/skills/atomic-design.md) skill.
