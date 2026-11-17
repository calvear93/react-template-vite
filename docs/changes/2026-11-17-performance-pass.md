---
status: done # planned | in-progress | done | dropped
---

# Faster gate, lighter tooling, and fewer redraws in the kit

## Goal

The gate pays for what it already did, the image installs again for any change, and a few kit
components do work nobody sees: a hint opens its popup before its delay, a list of times redraws
its 1,440 rows for each pick, a filter bar sets its listener at every render. Each one measured
before and after.

## Plan

- [x] Tooling: the `tsc` cache out of `dist/`, a short test output on a desk, the install layer of
      the image cached, three tiny preloaded chunks into the entry, four unused dependencies out
- [x] Libs: the ioc provider hands down the container itself; the feature storage reads only its
      own keys
- [x] Catalog: one demo fixture; the pickers section folds the query once
- [x] Kit: `Tooltip` opens after its delay; memoized time rows; `Combobox` marks the query its
      results were found for; `FilterBar` sets its listener once; `InputRut` through
      `HiddenInput`; the `Listbox` draw count holds with and without the compiler; `Select` and
      `Calendar` reach another module's rules through a parent

## Decisions

- The incremental cache of `tsc` goes to `node_modules/.cache/tsc/` · `outDir` is `dist/`, which
  every build empties, so each gate checked everything again · `incremental: false` (slower).
- The list of every test and the five coverage reports are written only when `CI` is set · a run
  on a desk printed about 1,900 lines; it now prints what failed and what is not fully covered.
  There is no workflow yet: a GitHub Actions run sets `CI` by itself.
- The image installs from `package.json`, `pnpm-lock.yaml` and `pnpm-workspace.yaml` before the
  sources, and the nginx stage does its upgrade and its `sed`/`chown` before taking the build ·
  any change of a source installed every dependency again · a cache mount (needs BuildKit).
- The router, ioc and feature libs go in the entry · three chunks of 0.5 to 1.3 kB, two of them
  preloaded, each one a request of its own.
- `tslib`, `@types/eslint`, `stylelint-config-recommended` and `postcss` removed · nothing imports
  or extends them (`stylelint-config-standard` brings the recommended config itself).
- Ten dependencies to the newest version of their major (`jotai` 3.0.2, `vite` 8.3.8,
  `@vitejs/plugin-react` 6.3.0, `eslint` 10.15.0, `typescript-eslint` 8.72.2,
  `eslint-plugin-perfectionist` 5.14.0, `eslint-plugin-jest-dom` 5.10.2, `prettier` 3.10.1,
  `@testing-library/user-event` 14.6.12, `vite-plugin-webfont-dl` 3.14.1) · the new majors
  (`eslint-plugin-unicorn` 80, `typescript` 7, `vitest-mock-extended` 6) and `oxc-transform-react`
  0.158 wait for their own change.
- The ioc provider hands down `values ?? container`, not a memoized copy · a dependency bound after
  it mounted was not found.
- The feature storage reads key by key and only the values with its prefix · it copied every
  value of local and session storage at start, the tokens of another library included.
- A hint opens its `Popup` when its delay has passed · a cold pointer opened it at once (the top
  layer, a measure, an observer, two listeners) and the 300 ms were only an `animation-delay` · the
  CSS delay. A warm pointer and the focus still show it at once; the glass of the bubble is as it
  was.
- The rows of a list of times are memoized and take no handler; the list hears the presses with
  one listener · a list by the minute drew its 1,440 rows for each time picked.
- A `Combobox` marks the query its results were found for · the live text redrew every result
  with each key, and marked letters the results were not found by.
- `InputRut` keeps its value in `HiddenInput` · a RUT given from outside was not told to a
  `FilterBar` that applies by itself.
- `.root > .select` and `& > :is(.month, .year) > select` · with one class each, the stylesheet
  read last won; once the kit is split (see `2026-11-17-kit-code-splitting.md`), the chunks
  decide that order.

## Verification

- Gate: `pnpm lint` and `pnpm stylelint` clean, `tsc --noEmit` clean, `pnpm build:dev` built with
  no warning, `pnpm test:dev --coverage --run` → 133 files, 1,869 tests passed; coverage 99.76 %
  statements, 97.97 % branches, 100 % functions, 99.93 % lines (99.75 / 97.94 / 100 / 99.93
  before). Run together with the record of the kit split, which shares this branch.
- Tests that failed before their fix: a hint with a bubble in the page before its delay; a hint
  that did not wait being shown again; a hint waiting while it leaves the page; a list by the
  minute drawing its 1,440 rows for a new time (2 now); three `change` listeners of a `FilterBar`
  after three renders (1); a RUT given from outside not applied; a `Combobox` marking «Santi» in
  results found for «San»; a dependency bound after the provider mounted; the feature storage
  reading a key that is not its own.
- Tooling: `tsc --noEmit` after a build 6.3 s → 2.0 s; a test run with coverage prints 307 lines
  where 1,914; `modulepreload` links 7 → 5.
- Edge through playwright-core, the build served in-process: a pointer swept twenty times over
  the three links of the folded menu, 60 ms on each, CPU six times slower: popovers opened 33 → 0,
  layouts 115 → 0, script 457 → 102 ms.
- Nothing lost: 110 full-page screenshots (11 pages × light, dark, more contrast, large text, pure
  black × 1280 and 390 px, motion reduced) identical pixel by pixel to the build before; two runs
  of that build are identical too. No console error, no failed request.
- After the update of the dependencies: the same files, `modulepreload` and stylesheet links;
  the 110 screenshots identical again; the settings and a confirmation open as before.

## Not included / assumptions

- The image was not built: Docker was not running. Its layers were reordered by reading.
- Assumed: a future pipeline sets `CI` (GitHub Actions does).
- The `clean` script removes `.node_modules`, which looks like a typo for `node_modules/.cache`;
  not changed here.
