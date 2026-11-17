---
status: done # planned | in-progress | done | dropped
---

# The kit's build rules live with the kit, as one tested Vite plugin

## Goal

`vite.config.ts` had grown to 338 lines, 250 of them the build rules of the UI kit (its chunks, its
side effects, the order of its layers, the list of what it loads on demand and its check), with
no test. The app's config should read as the app's; the kit's rules belong to the kit, tested.

## Plan

- [x] Tests first, on fake module graphs: the shell of the kit, the layers, the on-demand check,
      what the plugin adds to the config
- [x] `src/libs/ui-core/vite/`: `uiCore()` and its parts; `vite.config.ts` calls it
- [x] The build byte for byte the same as before; the docs point to the plugin

## Decisions

- One plugin, `uiCore()`, made of three: `kitChunks` adds the kit's groups of `codeSplitting` and
  its `moduleSideEffects` through the `config` hook (Vite joins them to the app's; the priorities
  decide), `kitLayers`, and `kitOnDemand` · the rules stay where the kit is, and move with it to
  another project.
- In `src/libs/ui-core/vite/`, split by what each part knows: `kit.paths.ts` (the kit's files,
  resolved from its own folder), `kit-shell.ts`, `on-demand.modules.ts` (the list, next to the
  kit, linked from `internal/on-demand.ts`), `ui-core.plugin.ts` · the barrel never exports them:
  they run in Node, at build time.
- A build where a module of the kit comes without its barrel fails, naming the barrel · a wrong
  path gave an empty shell, and the build went on with every module in another chunk.
- `kitShell` reads the code of a module loaded with the entry knowing the graph has it · the
  optional chain on it was a branch nothing could reach.
- The specs build fake module graphs, not a real build · a build takes seconds and could not show
  a cycle, a module the graph does not know, or a barrel that is missing.

## Verification

- Gate: see `2026-11-17-test-output-and-dependencies.md` (the same run); the five files of
  `vite/` are fully covered, with 21 tests: they failed first, as their modules did not exist.
- `vite.config.ts`: 338 lines → 90.
- `dist/` against the build before: 80 files, every script and stylesheet byte for byte the same,
  names and hashes too; only the source map of `ui-core` differs (it carries the new comment of
  `internal/on-demand.ts`).
- `settings.panes` taken out of `on-demand.modules.ts` → the build fails naming
  `components/settings-dialog/settings.panes.tsx`.
- Edge through playwright-core: the on-demand chunk is asked for after the first paint; with it
  blocked, «Settings» shows the toast; unblocked, the window opens with the focus on its tab; a
  confirmation opens with the focus on its cancel button. No console error.

## Not included / assumptions

- The screenshots of the pages were not taken again: the scripts and stylesheets of the build
  are the same bytes as those of the last comparison.
