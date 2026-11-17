---
status: done # planned | in-progress | done | dropped
---

# The kit ships with the pages that use it, its dialogs on demand

## Goal

The whole UI kit was one chunk and one stylesheet, preloaded before the first paint of every page
(about 233 kB of script and 129 kB of style). Only what the shell needs should come first; the
rest with the pages that use it, and the dialogs and the settings window when they are needed.

## Plan

- [x] Tell the bundler which kit modules have side effects (the barrel and the stylesheets)
- [x] Split the kit by rule, not by size: what the entry needs, what two pages or more share, what
      one page alone uses
- [x] State the order of the cascade layers at the top of every kit stylesheet
- [x] The dialogs of `useDialogs()` and the settings window loaded on demand, prefetched once the
      first paint is on screen; a load that fails answers the question and says so
- [x] Measured on a first visit; every page compared pixel by pixel with the build before

## Decisions

- `treeshake.moduleSideEffects`: the stylesheets and the barrel have side effects, every other
  module of the kit does not · imported through one barrel whose components import their
  stylesheets, the whole kit was kept wherever one component was used. No kit module runs for a
  side effect of its own (checked: no bare `import` besides stylesheets).
- Three groups with no size: `kitShell` (what the modules loaded with the entry take from the
  barrel, and what those import), what two pages or more use (`minShareCount: 2`), and what one
  page alone uses stays in that page's chunk · a group that joins modules by size tips over as
  soon as one more module is shared, and makes chunks that import each other.
- `kitLayers` writes `@layer reset, ui.tokens, ui.base, ui.components;` at the top of every kit
  stylesheet · the first stylesheet a browser reads decides the order of the layers, and once the
  kit is split the chunks decide which one is first.
- The dialogs of `useDialogs()` and the window of `SettingsDialog` are read from an on-demand store
  (`internal/on-demand.ts`, `useSyncExternalStore`), fetched once the first paint is on screen and
  the browser idle, or when first asked for · nothing of the first screen shows them · `lazy()` +
  Suspense: React holds what a click reveals some 300 ms even with the chunk there, and a rejected
  load above the router would stay rejected.
- A question whose dialog cannot be fetched is answered as cancelled, and a settings window that
  cannot be fetched closes; both say so with one toast, its text from the kit's languages
  (`onDemand.failed`, `onDemand.failedHint`) · a `confirm()` must never hang.
- `SETTINGS_LANGUAGES` moves to `settings.languages.ts` (the barrel exports it as before) · an app
  that reads it on its first screen would otherwise import the panes of the settings, and with
  them the on-demand chunk.
- The specs see those parts as loaded (`__mocks__/preload.setup.ts`, a setup file); the loading
  path has its own specs with fresh modules · the specs that open a dialog read it at once, as a
  browser does after the idle fetch.
- A browser with no `PerformanceObserver`, or one without `supportedEntryTypes`, prefetches at its
  idle moment · the prefetch runs in an effect: a throw there would reach the error boundary.
- `UI_ON_DEMAND` stays a list, checked by `kitOnDemand` at the end of the build: a kit module
  imported on demand from the kit, or one only the modules of the list import, that the list
  misses fails the build and is named · deriving it from the graph would leave out the dialogs the
  barrel exports and move them to the chunk the pages share.
- The kit's barrel and its stylesheet of layers resolve from the folder of `vite.config.ts`, and
  a stylesheet without its `@layer` statement is named in the error · `exec(...)![0]` failed with a
  bare `TypeError`.

## Verification

- Gate: see `2026-11-17-performance-pass.md` (the same run): 133 files, 1,869 tests passed,
  coverage 99.76 / 97.97 / 100 / 99.93 %, build with no warning.
- The guards: the two specs of a browser with no paint observer failed with a `TypeError` before
  the guard; `settings.panes` taken out of `UI_ON_DEMAND` → the build fails naming
  `components/settings-dialog/settings.panes.tsx`.
- The build (before → after):
    - the kit before the first paint: 232.8 kB of script → 55.4 kB, 129.1 kB of blocking style →
      35.8 kB;
    - the on-demand chunk is 26.2 kB of script and 11.0 kB of style;
    - what two pages or more share is 60.4 kB and 35.0 kB, fetched with the first page that needs
      it;
    - no chunk of the kit imports one the entry loads after it; the whole build is 4.6 kB larger
      (the on-demand code).
- First visit (Edge through playwright-core, the build served in-process, Fast 4G, CPU four times
  slower, median of five; before → after):

    | What                            | Home          | Catalog (`/ui/fields`) |
    | ------------------------------- | ------------- | ---------------------- |
    | First contentful paint          | 1.62 → 1.11 s | 1.26 → 0.98 s          |
    | The frame (menu) is there       | 1.32 → 0.99 s | 1.51 → 1.35 s          |
    | Largest contentful paint        | 1.62 → 1.11 s | 1.93 → 1.75 s          |
    | Bytes before the first paint    | 763 → 490 kB  | 714 → 490 kB           |
    | Requests before the first paint | 15 → 13       | 13 → 12                |

- Nothing lost: the same 110 full-page screenshots, identical pixel by pixel to the build before.
- On demand, in Edge: the chunk is asked for 6 ms after the first contentful paint, never before;
  a confirmation opens with the focus on its cancel button and gives it back to its opener; with
  the chunk blocked, «Settings» shows the toast and no window; unblocked, the window opens without
  a reload, the focus on its tab, and Escape closes it with the focus back on its button. No
  console error.

## Not included / assumptions

- The catalog page of overlays imports `AlertDialog` itself, so it takes the on-demand chunk with
  it: its failure path (the toast) is shown by the settings and covered by the specs.
- The toaster sits at the top right, over the settings button: after a failed load, the button is
  pressed again once the notice is closed. As before this change.
- Not checked: Safari and Firefox, a real low-end device, HTTP/2.
