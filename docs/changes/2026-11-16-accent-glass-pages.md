---
status: done # planned | in-progress | done | dropped
---

# An accent to choose, more glass, and the sample pages refined

## Goal

A person chooses the accent color of the app among six, as on a Mac; the shell reads more like a
recent macOS (a floating glass side bar over a faint glow of the accent); and the home and detail
pages are composed with more care.

## Plan

- [x] An accent to choose: tokens, the store, the pre-paint script, the settings, the catalog
- [x] Glass: a more translucent material, a floating side bar, a glow of the accent behind
- [x] The home page as the welcome of the template; the detail page in two columns
- [x] The lib README and the skill

Tests first where it applies; gate green after each step; checked in a real browser.

## Decisions

- An accent is one token: `:root[data-accent='purple']` sets `--ui-color-primary`, and the link,
  the ring, what is chosen and the dark theme's lighter color are worked out from it · adding
  one is a line of CSS, a name and an entry of `ACCENTS` · a set of tokens per accent.
- Six of them, no red: the color of the app (royal blue), purple, pink, orange, green, graphite
  · red is what went wrong and what destroys · each a color white text reads on (4.5:1), checked
  with what is derived from it in light, dark and pure black before it was written.
- The color of the app is `--ui-accent-default`, the first of the accents: an app with its own
  sets that, and a person who chooses none keeps it · `data-accent` is absent then.
- The accents are radios drawn as their color, each named · the arrows move among them as among
  any radios, and the one chosen is told by a ring, not by its color alone.
- More glass, on what floats: the side bar is a panel afloat over the page, and dialogs, the
  drawer and tooltips are glass too; a surface keeps 62 % (a bar), 72 % (a popup) or 88 % (a
  panel) of its color · cards, fields and tables stay solid.
- Behind the shell the page takes a little of the accent, in two wide stains (10 %) · glass with
  a flat page behind it is a flat surface · none on a pure black page (its pixels are off), with
  more contrast, with less transparency asked for or with forced colors. The lowest text on the
  page was worked out at the heart of the glow, for every accent: 4.7:1.
- The home page is the welcome of the template: its name, what it is, and a grouped list of what
  it brings, each row leading to where it shows · a page component of its own (`FeatureList`),
  made of kit components and tokens.
- The detail page is its header (trail, id, environment) over two cards: the facts of the route
  as a `DataGrid` and the fetch box, which says «Nothing fetched yet», a skeleton, then the
  answer · its tests follow the markup: the id and the environment are no longer headings.

## Verification

- Gate: `pnpm lint` and `pnpm stylelint` clean (0 warnings), `tsc --noEmit` clean, `pnpm build:dev`
  built; `pnpm test:dev --coverage --run` → 129 files, 1811 tests passed; coverage 99.75 %
  statements, 97.94 % branches, 100 % functions, 99.93 % lines.
- Manual (Edge through playwright-core, the build served in-process): the nine sections of the
  catalog in every mode and both languages with the color of the app, and with each of the five
  other accents in light, dark and pure black: 261 loads with no console error or warning and no
  button without a name; some 27,100 texts measured on their computed colors, the lowest 4.72:1
  (white on the green). The glow is none on a pure black page and with more contrast; the bar and
  the side bar have their `backdrop-filter`, and none with more contrast.
- Manual, by using it (21 checks): an accent chosen in the settings turns the solid button, the
  focus ring and the page's mark at once, moves with the arrows, survives a reload, and is
  written by the pre-paint script before the app runs; the home page lists its five features and
  its rows lead through the router; the detail page shows its id and its trail, and its fetch box
  goes from «Nothing fetched yet» through busy to the answer; both pages fit a phone of 390 px.
- Regression: the 28 checks of use from the two changes before (language, dates, amounts, a file
  dropped, the router) pass.
- Looked at in screenshots: home and detail in light, dark and pure black, with other accents and
  on a phone; the settings with the accents. Two things seen there and fixed: the rows of the
  home list squeezed their text on a phone, and the legend of the themes sat on the top edge of
  its card.

## Not included / assumptions

- Red, yellow or a free color as an accent.
- A setting of its own for transparency: glass follows the system and the contrast chosen.
- Glass on cards, fields or tables.
- Not checked: Safari and Firefox, a real phone, a real screen reader.
