---
status: done # planned | in-progress | done | dropped
---

# A UI kit for the template, in royal blue and in the language of its user

## Goal

The template gets a UI kit (`#libs/ui-core`): some sixty components on CSS Modules and `--ui-*`
tokens, with no runtime dependency, a live catalog at `/ui`, and one `locale` setting (English by
default, Spanish included) that every `Intl` format and every text of the kit follows.

## Plan

- [x] The kit in `src/libs/ui-core`, its alias, the layered reset
- [x] A locale that can be set: its store, formats made per locale, the `en` and `es` texts
- [x] Dates, amounts, phones and names by locale; the week as the locale starts it
- [x] Tokens and themes on royal blue: light, dark and more contrast
- [x] The app on the kit: provider, layout, pages, the catalog, `APP_LOCALE`
- [x] The lib README, the skill, the scaffold

Tests first where it applies; gate green after each step; checked in a real browser.

## Decisions

- The locale is a small store next to the theme's (`format/locale.ts`), set by `UiProvider` and
  by the person (`setLocale`, remembered, wins) · a format is called from plain code too, where
  no React context reaches · a context alone.
- Every format takes the locale last and a component gives it the one of `useLocale()` · the
  React Compiler keeps what a call returned for the same arguments: a format that read the
  locale by itself would keep the old language · reading the store inside each format.
- The texts are two dictionaries by component (`i18n/en.ts`, the shape; `i18n/es.ts`), read with
  `useTexts()`; the exported `X_LABELS` are gone · one place to add a language, and no Spanish
  literal left in a component · a default per prop.
- What a person types follows the locale too: the shape of a date comes from
  `Intl.DateTimeFormat#formatToParts`, the day a week starts on from `Intl.Locale` (Monday
  without it), the separators and the decimals of an amount from its currency · a fixed
  `dd-mm-yyyy` and whole pesos, which is what the kit was written with.
- An amount keeps reading decimals written the other way (`1250000.50` pasted in pesos is
  `1.250.000`) · a hundred times more by a paste is the worst mistake of the field · reading by
  the symbols of the locale alone, which is simpler.
- A time stays in 24 hours everywhere, and `InputRut` stays a Chilean field · a 12-hour mask and
  panels are a component of their own; the RUT is useful as it is.
- Royal blue `#4169e1` is its own fill (white on it is 4.85:1); cool neutrals, a teal for
  information so it is not taken for the app's color, a gold as the accent; Inter as the one
  family, headings by weight · every pair of text and surface measured, the four modes.
- No brands: one color of the app in `styles/tokens/primary.css`, overridable on `:root` · the
  three-brand system belonged to where the kit came from.
- The specs that read Spanish texts and Chilean formats say so (`inChile()`) and stay; new ones
  cover English, other places and the switch of language · they are the tests of the second
  language, already written.

## Verification

- Gate: `pnpm lint` and `pnpm stylelint` clean (0 warnings), `tsc --noEmit` clean, `pnpm build:dev`
  built; `pnpm test:dev --coverage --run` → 127 files, 1790 tests passed (in UTC and in the time
  zone of the machine); coverage 99.74 % statements, 97.96 % branches, 100 % functions, 99.93 %
  lines.
- Manual (Edge through playwright-core, the build served in-process, requests off the machine
  aborted): the nine sections of the catalog in English and in Spanish, each in light, dark and
  both with high contrast (72 loads): no console error or warning, no button without a name;
  some 7,350 texts measured on their computed colors, the lowest contrast 4.85:1 (white on the
  royal blue), none under AA.
- Manual, by using it (28 checks, the real clipboard and a real drop): the home and detail pages
  framed by `AppShell`, a link of the kit following the router; the language chosen in the
  settings and in the catalog changes texts, dates (`11/05/2020` ↔ `05-11-2020`), amounts
  (`1,250,000.75` ↔ `1.250.000,75`), the calendar (Sunday ↔ Monday first) and `lang`, keeps the
  value of each field and survives a reload; a full date and a third decimal are refused; an
  amount pasted the other way keeps its value; a file dropped is told once.
- Looked at in screenshots, light and dark: a loading button showed its text under its spinner
  (the label has no box, so its opacity did nothing): hidden with `visibility` instead.

## Not included / assumptions

- A 12-hour time; languages besides English and Spanish (an app gives its own in `texts`);
  right-to-left languages; a phone validated or formatted by country.
- The sign of a currency sits before the amount in every locale.
- The specs marked `inChile()` keep Spanish sample texts: they are the tests of that language.
- The catalog's own copy is English in both languages: the kit translates only itself.
- `Badge` and `Progress` keep a tone named `brand` (the color of the app).
- Not checked: Safari, Firefox, a phone, a real screen reader.
