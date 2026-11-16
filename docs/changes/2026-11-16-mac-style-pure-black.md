---
status: done # planned | in-progress | done | dropped
---

# The kit in neutral surfaces, with a pure black dark and a little glass

## Goal

The UI kit looks closer to a Mac app: neutral surfaces in light and in dark, the royal blue kept
for what is interactive, a «pure black» choice for the dark theme (OLED screens), and a restrained
glass on what floats over the page.

## Plan

- [x] A «pure black» preference: the store, the pre-paint script, the settings, the catalog
- [x] The palette: neutral light and dark, the blue as an accent and no surface
- [x] Shape: the font of the system first, rounder surfaces, softer shadows, a flat title bar
- [x] Glass: one material in the tokens, on the header, the popups, the toasts and the veil
- [x] The lib README and the skill

Tests first where it applies; gate green after each step; checked in a real browser.

## Decisions

- The color of the app is an accent, never a surface · asked for: pages, cards and quiet fills
  are neutral grays, and `secondary` (the fill of a second action, of the current page of the
  menu) is a gray with ink on it; the blue stays on what acts, what is chosen, the focus and a
  link · a pale tint of the blue under half the kit, as it was.
- Pure black is a choice for the dark theme, not a fourth theme · asked for: it also holds when
  the theme follows the system at night · `data-dark="black"` only on a dark page, written by the
  pre-paint script too.
- Only tokens changed for the palette: no component names a theme · the dark went from a night
  blue to neutral grays, and pure black redefines the surfaces and the lines over it.
- Glass is one material in the tokens (`--ui-material-*`), on four things: the bar of the shell,
  what pops up, the toasts and the veil of a dialog · «without overdoing it»: a surface that
  holds text keeps most of its color, and cards, fields and dialogs stay solid · glass on every
  surface.
- The tokens turn glass off (more contrast, less transparency asked of the system, forced colors,
  no `backdrop-filter`) · no component has a rule of its own for it · a setting of its own.
- The page scrolls under the bar of the shell, which sits over it · a glass bar with nothing
  behind it is a flat one · the title of the app is a plain one at the center of the bar, as a
  window's, and no longer hangs from it in a notch.
- The font of the system first where it is Apple's, Inter elsewhere; surfaces at 16 px of
  radius; shadows with a hairline and a wide soft cast · what a Mac draws.

## Verification

- Gate: `pnpm lint` and `pnpm stylelint` clean (0 warnings), `tsc --noEmit` clean, `pnpm build:dev`
  built; `pnpm test:dev --coverage --run` → 127 files, 1798 tests passed; coverage 99.75 %
  statements, 97.97 % branches, 100 % functions, 99.93 % lines.
- The palette, by calculation before writing it: 57 pairs of text or line and surface per theme
  (light, dark, pure black), none under AA (text 4.5:1, lines of controls and the ring 3:1).
- Manual (Edge through playwright-core, the build served in-process): the nine sections in both
  languages and seven modes (light, dark, pure black, each of the three with high contrast, and
  light with pure black chosen): 126 loads with no console error or warning and no button without
  a name; some 12,900 texts measured on their computed colors, the lowest 4.85:1. A pure black
  page is `rgb(0, 0, 0)`, a light one never wears it; the bar has its `backdrop-filter`, and none
  with high contrast.
- Regression: the 28 checks of use (language, dates, amounts, a file dropped, the router) pass.
- Looked at in screenshots: light, dark and pure black; the page scrolled under the bar; a menu
  open over content, in light and in pure black.

## Not included / assumptions

- A setting of its own for transparency: it follows the system and the contrast chosen.
- Glass on cards, a floating side bar, refraction.
- Not checked: Safari and Firefox (where `backdrop-filter` and the font of the system are worth a
  look), a phone, a real screen reader.
