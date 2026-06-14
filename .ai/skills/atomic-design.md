# Skill: Atomic Design

This template organizes its UI with **Atomic Design** (Brad Frost). **Every component has a level,
and you compose upward only.** Following it is mandatory for new components. Deep rules:
[AGENTS.md](../../AGENTS.md); component conventions: the `react-patterns` skill.

> **Atoms ≠ store.** Here "atoms" are the smallest **UI components**. App **state** lives in the
> `store/` layer (`*.store.ts`), not here — see `src/app/store/`.

## When to use

Creating, placing, or reviewing any component, layout, or page.

## The five levels (mapped to this template)

| Level         | Lives in                        | What it is                                                                   | Examples                                             |
| ------------- | ------------------------------- | ---------------------------------------------------------------------------- | ---------------------------------------------------- |
| **Atoms**     | `src/app/components/atoms/`     | Smallest building blocks; presentational, stateless, no app logic            | `Button`, `Input`, `Icon`, `Badge`, `Spinner`        |
| **Molecules** | `src/app/components/molecules/` | A few atoms combined into one simple unit                                    | `FormField` (label+input+error), `SearchBox`, `Card` |
| **Organisms** | `src/app/components/organisms/` | Complex, self-contained sections; may hold local state / read the store      | `Header`, `Footer`, `DataTable`, a full form         |
| **Templates** | `src/app/layouts/`              | Page skeletons: arrange organisms, define regions, no real data              | `App.layout`                                         |
| **Pages**     | `src/app/pages/`                | A routed template filled with real data/state; wires the store, IoC, routing | `Main.page`, `Detail.page`                           |

## Rules

- **Compose upward only.** Molecules use atoms; organisms use molecules/atoms; templates use
  organisms; pages use templates. Never reach downward (an atom must not import an organism).
- **Atoms & molecules are presentational** — props in, JSX out; no data fetching, no store reads,
  no routing. Keep them reusable and dumb.
- **State enters at organisms / pages.** Read the `store/` (`useAtom*`) and inject services (IoC,
  `useInjection`) at the organism or page level, then pass data down as props.
- **One responsibility per component**; extract logic into hooks (`useX`); type props explicitly.
- **Styling:** CSS Modules per component (`*.module.css`), co-located.
- **Promote, don't duplicate:** an atom/molecule reused across pages belongs under `components/`;
  page-only pieces stay under `src/app/pages/<page>/components/`.

## Placement & scaffolds

Start from a scaffold in `.vscode/__templates__/` and put the file under the right level folder:

- **Atoms / molecules** (presentational) → `react-component-stateless`.
- **Organisms** (may hold state) → `react-component`; feature-gated variants →
  `react-component-versioned`.
- **Templates** → `react-layout`. **Pages** → `react-page`.

If unsure of the level, pick the **lowest** one that still makes sense, and split when a component
grows more than one responsibility.
