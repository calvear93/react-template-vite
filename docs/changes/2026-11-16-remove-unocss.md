---
status: done # planned | in-progress | done | dropped
---

# UnoCSS removed

## Goal

One way to style the app: the components of the kit, and CSS Modules on its `--ui-*` tokens.
UnoCSS was wired into the build, the linter and the docs, and nothing used it.

## Plan

- [x] Take it out of the build: `uno.config.ts`, the Vite plugin, the imports of `main.tsx`
- [x] Take it out of the tooling: the packages, ESLint, stylelint's allowances, the editor
- [x] The docs that told to use its utilities

Gate green after it; the built CSS compared before and after.

## Decisions

- Removed, not kept as an option · no file of `src`, `index.html` or the scaffolds had a utility
  class, an `@apply`, a `theme()` or an icon class, and it still cost three packages of the project
  (77 installed), a Vite plugin and an ESLint plugin · keeping it for projects that may want
  utilities: such a project adds it back in three lines.
- What it did write to the build was wrong: 2.4 kB of rules made out of plain words of the code
  (`.grid`, `.hidden`, `.table`, `.container`, `.fixed`…), outside every cascade layer, so they
  would have won over the kit on any element given one of those class names.
- `@iconify-json/mdi` goes with it · it only fed the icons preset, and no icon class was ever
  used: the icons of the app are those of the kit (`Icon`, lucide shapes).
- stylelint no longer lets through `@apply`, `@screen`, `@tailwind`, `@variants`, `@responsive`
  and `theme()`, nor a font family named after an icon font · nothing writes them; the allowances
  for nesting syntax (`@each`, `@mixin`…) were not UnoCSS's and stay.

## Verification

- Gate: `pnpm lint` and `pnpm stylelint` clean, `tsc --noEmit` clean, `pnpm build:dev` built,
  `pnpm test:dev --coverage --run` → 129 files, 1811 tests passed; coverage 99.75 % statements,
  97.94 % branches, 100 % functions, 99.93 % lines (the same as before: no code of the app changed).
- The built CSS: the entry style sheet went from 6,227 to 3,833 bytes; no `--un-` property and no
  `.container` rule is left in `dist/assets/*.css`; `pnpm why unocss` finds nothing.
- Manual (Edge through playwright-core, the build served in-process): the nine sections of the
  catalog in every mode, both languages and the six accents, 261 loads with no console error or
  warning and the lowest contrast still 4.72:1; the 28 checks of use and the 21 of the accent and
  the pages pass. The home page looked at in a screenshot: nothing moved.

## Not included / assumptions

- A replacement for utilities: layout is written in CSS Modules, as every page already did.
- The editor settings that silence unknown at-rules (`css.lint.unknownAtRules`) stay: they also
  serve `@layer` and nesting.
