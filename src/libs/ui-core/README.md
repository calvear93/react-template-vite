# 🎨 #libs/ui-core — UI kit

A UI kit in React 19 and plain CSS: design tokens on a royal blue, light / dark / high-contrast
themes, icons and some sixty components that write in the language of their user. No Tailwind,
no utility framework and no runtime dependency besides React. The live catalog is the `/ui` route of the
app (`src/app/pages/ui-catalog/`): open it before building a screen.

## Setup

```tsx
// src/app/App.tsx
import { UiProvider } from '#libs/ui-core';

<UiProvider link={RouterLink} locale={import.meta.env.APP_LOCALE}>
	<AppRouter />
</UiProvider>;
```

- Importing `#libs/ui-core` loads the kit's global CSS (tokens, themes, page base) once.
- `UiProvider` keeps the theme and contrast in step with the person's choice and the system, says
  the language and the place the kit writes in (see [Language](#language)), and receives the
  app's router link (see [Links](#links)).
- `index.html` loads `/ui-theme-init.js` in its `<head>`, so a dark page never flashes white. It
  is a file (not inline) because the app's CSP is `script-src 'self'`.
- The kit names its font in `--ui-font-body`: the font of the system where it is Apple's (San
  Francisco), and **Inter** everywhere else, which the app loads (`FONT_FAMILY` in
  `env/appsettings.json`, downloaded by `vite-plugin-webfont-dl`). An app with another font sets
  that token.

## Layers

```css
@layer reset, ui.tokens, ui.base, ui.components;
```

Every rule of the kit lives in a cascade layer; the app's reset is in `reset`, below them. So
**any unlayered rule wins over the kit** — an app CSS Module passed through `className`
overrides a component without a specificity fight. A project that adds a utility framework
which writes to cascade layers puts those layers after `ui.components` in `styles/index.css`.

## Tokens

All custom properties are `--ui-<category>-<role>[-<variant>]`. Use them in the app's CSS Modules
(`var(--ui-color-primary-fill)`). **Never a hex, a raw size or a z-index in a component.**

| Category                | Tokens                                                                                                                                                                                 |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `--ui-font-*`           | `body`, `heading` (the same family: headings are told by weight and size), `size-11 … size-55` (rem)                                                                                   |
| `--ui-heading-*`        | `display`, `1 … 6`, `module` × `size`, `weight` (smaller below 1024 px)                                                                                                                |
| `--ui-space-*`          | `2, 4, 8, 12, 16, 20, 24, 32, 40, 48, 56, 64, 80` (px)                                                                                                                                 |
| `--ui-size-*`           | `control-xs/sm/md/lg` (32/36/42/48), `icon-xs/sm/md/lg` (12/16/20/24), `touch-min` (44), `container-max`                                                                               |
| `--ui-radius-*`         | `base` (8), `control` (10), `surface` (16), `full`                                                                                                                                     |
| `--ui-shadow-*`         | one scale: `xs` (a knob, the chosen tab), `sm` (a card at rest), `md` (hover on what navigates), `lg` (popups, toasts), `xl` (dialogs); `side-start` / `side-end` (a panel at an edge) |
| `--ui-z-*`              | `base, raised, sticky, header, overlay, panel, dialog, toast`                                                                                                                          |
| `--ui-duration-*`       | `fast` (.12s, states), `normal` (.2s, what appears), `slow` (.28s, what crosses the screen); `--ui-easing-default`, `--ui-easing-exit`                                                 |
| `--ui-ring-width`       | the width of the focus ring (2px; 3px with high contrast): `outline: var(--ui-ring-width) solid var(--ui-color-ring)`                                                                  |
| `--ui-opacity-disabled` | the one opacity of what is disabled                                                                                                                                                    |
| `--ui-color-*` app      | `primary`, `primary-fill` (AA with white: use it for fills), `primary-foreground`, `secondary`, `secondary-foreground`, `accent` (+ `-foreground`), `ring`                             |
| `--ui-color-*` surfaces | `page`, `background`, `card`, `popover`, `surface-2`, `muted`, `line`, `line-soft`, `border`, `input` (+ `-hover`), `overlay`, `hover`                                                 |
| `--ui-color-*` inks     | `foreground`, `foreground-soft`, `foreground-faint`, `heading`, `link`, `muted-foreground`, `placeholder`                                                                              |
| `--ui-color-*` status   | `info`, `success`, `warning`, `danger` × `strong`, `base`, `subtle`, `text`; `danger-line`; `destructive`, `destructive-fill`                                                          |
| `--ui-color-*` controls | `control-checked` (+ `-foreground`): what is on or chosen, and the color of the app as a graphic (a progress bar, a spinner, the line of a tab)                                        |
| `--ui-color-neutral-*`  | `50, 100, 200, 300, 400, 500, 900`                                                                                                                                                     |

**The palette.** Surfaces are neutral: a page of light gray, white cards and near-black text in
light; near-black grays in dark. The color of the app, royal blue (`#4169e1`: white text on it is
4.85:1, so it is its own fill), is **an accent and never a surface**: it paints what acts (a
solid button), what is on or chosen (a checked box, the current tab, the current page of the
menu), the focus ring and a link. `secondary` is the quiet gray fill of a second action. The
information color is a teal, so it is never taken for the color of the app; `accent` is a gold,
for what must be found at a glance, sparingly.

**Glass.** What floats over the page lets a little of it through, blurred: the bar of
`AppShell` (the page scrolls under it) and its side bar, a panel afloat over the page; menus and
every other popup; toasts and tooltips; the panel of a dialog and of a drawer, and the page
behind them (out of focus, hardly). It is one material in the tokens (`--ui-material-bar`,
`--ui-material-popup`, `--ui-material-panel`: how much of its own color a surface keeps;
`--ui-material-filter`, `--ui-material-veil`, `--ui-material-edge`), mixed by each of those
components with its own surface. Cards, fields and tables are never glass. Behind it all the
shell breathes a little of the color of the app into the page (`--ui-material-glow`): what the
glass has to show. Glass and glow turn themselves off — the tokens become opaque, no component
has a rule for it — with more contrast (`data-contrast='more'`), when the system asks for less
transparency, with forced colors and in a browser without `backdrop-filter`; a pure black page
has no glow.

**Accents.** A person may choose the accent of the app among six, as on a Mac: the color of the
app (royal blue here), purple, pink, orange, green and graphite — no red, which is the color of
what went wrong. Each is a color white text reads on; the link, the ring, what is chosen and the
dark theme's lighter one are worked out from it. `styles/tokens/accent.css` holds them
(`--ui-accent-purple` …), `ACCENTS` lists them, and `data-accent` on `<html>` says which.

**Another color.** An app with its own sets `--ui-accent-default` on `:root`, after the kit's
sheet (and `--ui-color-primary-fill`, when white on it is under 4.5:1): the link, the ring and
what is chosen follow it, in every theme. It is the first of the accents a person can choose;
name it for them with `labels={{ accentDefault: '…' }}` on `SettingsDialog`.

**Contrast.** Text reaches 4.5:1; the borders of controls, the graphics that say a state and the
focus ring, 3:1 — in light, dark and both with high contrast. Two colors are **not** for text
or for the only sign of a state: `--ui-color-destructive` (an accent: the fill for white text is
`--ui-color-destructive-fill`) and `--ui-color-warning-strong` (text is
`--ui-color-warning-text`). In the dark theme shadows alone do not separate surfaces, so each
level also carries a light top edge and the surfaces step up (page → card → popover).

## Themes and the preferences of the person

| Attribute on `<html>` | Values                                     | Written by       |
| --------------------- | ------------------------------------------ | ---------------- |
| `data-theme`          | `light`, `dark` (always the resolved one)  | the theme store  |
| `data-dark`           | `black` on a dark page (absent otherwise)  | the theme store  |
| `data-accent`         | `purple`, `pink`, … (absent: the app's)    | the theme store  |
| `data-contrast`       | `more` (absent otherwise)                  | the theme store  |
| `data-motion`         | `reduce`, `full` (always the resolved one) | the theme store  |
| `data-text`           | `large` (absent otherwise)                 | the theme store  |
| `data-links`          | `underline` (absent otherwise)             | the theme store  |
| `lang`                | the locale (`en`, `es-CL`)                 | the locale store |

```tsx
const { theme, resolvedTheme, highContrast, reducedMotion, system } =
	useTheme();
const { setTheme, setContrast, setMotion, setTextSize, setUnderlineLinks } =
	useTheme();
const { accent, pureBlack, setAccent, setPureBlack } = useTheme();

setTheme('auto'); // 'auto' follows the system · 'light' · 'dark'
setContrast('more'); // 'more' · 'normal' · null follows the system (prefers-contrast)
setMotion('reduce'); // 'reduce' · 'full' · null follows the system (prefers-reduced-motion)
setTextSize('large'); // 'large' · 'normal'
setUnderlineLinks(true);
setPureBlack(true); // the dark theme on a black page (OLED screens); `pureBlack` says it
setAccent('purple'); // one of `ACCENTS`; null is the color of the app again; `accent` says it
```

`SettingsDialog` is where a person chooses all of it, and their language; `system` says what the
system asks for (`contrast`, `reducedMotion`), whatever was chosen.

**Motion.** With reduced motion (`data-motion='reduce'`: the person's choice, or the system's
while there is none) the duration tokens are `0s`: every transition and every way in or out that
takes its time from `--ui-duration-*` happens at once, with no rule of its own. So **always
animate with the tokens**. What must keep moving (a spinner) or moves without a duration (a lift
on hover) says so itself:

```css
.spinner {
	animation: spin 0.8s linear infinite;

	:root[data-motion='reduce'] & {
		animation-duration: 2.4s;
	}
}
```

Do not write `@media (prefers-reduced-motion)` in a component: the attribute already follows the
system, and the person can choose either way. `public/ui-theme-init.js` writes these attributes
before the first paint (a dark page never flashes white, nothing animates for who asked it not
to); until it has run, the tokens ask the system directly.

- The preferences are remembered per browser (`localStorage`: `ui.theme`, `ui.contrast`,
  `ui.motion`, `ui.text`, `ui.links`, `ui.black`, `ui.accent`, `ui.locale`). A blocked storage keeps the choice for the
  page.
- **Pure black** is a choice for the dark theme, not a theme: with it a dark page (chosen, or
  the system's at night) is black, each surface over it a step of near black told by its line. A
  light page never wears it; the settings dialog has its switch.
- The dark theme lives in `styles/themes/dark.css` and redefines tokens only. The browser's high
  contrast (`forced-colors`) is respected by each component.
- A new component is checked in the modes (light, dark, pure black, and each with high contrast) and in
  both languages: the catalog's toolbar switches them.

## Language

One setting, the **locale**, decides how the kit writes: every `Intl` format and every text of
its components. An app says its own with `UiProvider` (`locale`, and with it `timeZone` and
`currency`); without one the kit is in English, in the time zone of the browser and in US dollars.

```tsx
<UiProvider locale='es-CL' currency='CLP' timeZone='America/Santiago'>
	…
</UiProvider>;

const { locale, currency, timeZone, setLocale } = useLocale();

setLocale('es-CL'); // the choice of this person: remembered, and it wins over the app's
setLocale(null); // back to the language of the app
```

**What follows the locale**

| What                            | How                                                                                                                                               |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| A date in figures               | The order of its parts and what goes between them: `11/05/2026` (`en-US`), `05/11/2026` (`en-GB`), `05-11-2026` (`es-CL`), `05.11.2026` (`de-DE`) |
| What `DatePicker` takes         | The same shape: its mask, its placeholder, a date pasted whole and what it says is wrong. Its value is always ISO                                 |
| Months, weekdays, a spoken date | `Intl.DateTimeFormat`; a week starts on the day the place starts it (`Calendar`: Sunday in the United States, Monday in Chile)                    |
| Numbers, percentages, plurals   | `Intl.NumberFormat`, `Intl.PluralRules`                                                                                                           |
| An amount of money              | The separators of the locale and the decimals of the **currency** (two for US dollars, none for Chilean pesos)                                    |
| How long ago                    | `Intl.RelativeTimeFormat`                                                                                                                         |
| A short name                    | The first word and the last; in Spanish, the first of the two surnames a name ends with                                                           |
| The texts of the components     | Those of the language of the locale (`es-CL` reads the Spanish ones); English for a language the kit does not speak                               |

**Formats.** Each helper takes the locale last and, without one, the current one:
`formatDate(value, locale)`. A component gives it the one of `useLocale()`, so it is drawn again
when the language changes; never call a format without it inside a component (the React Compiler
would keep the old text).

```tsx
const { locale } = useLocale();

<td>{formatDate(order.date, locale)}</td>;
```

A formatter of your own is made once per locale with `byLocale` (`format/locale.ts`), as the
kit's are. Never write a month, a plural or a separator by hand.

**Texts.** They live in `i18n/en.ts` (the shape: `UiTexts`) and `i18n/es.ts`, by component. A
component reads them with `useTexts()` and puts over them the ones it is given:

```tsx
<Dialog closeLabel='Dismiss' … />                           {/* one text of one component */}
<DatePicker labels={{ open: 'Pick a day' }} … />             {/* some of its texts */}
<UiProvider texts={{ dialog: { submit: 'Apply' } }}>…</UiProvider> {/* for the whole app */}
```

A text with a blank is a function of what fills it (`pager.pageOf(page, pages)`) or a template
with its name in braces (`dateMessages.max`: `{date}`). To add a language, write its `UiTexts`
next to the others and register it in `i18n/texts.ts`; an app can also give a whole one in
`texts`. `SettingsDialog` offers English and Spanish (`languages` changes the list).

**What does not follow it**

- A time is typed and shown in 24 hours (`hh:mm`) everywhere.
- A RUT (`InputRut`, `format/rut.ts`) is a Chilean identifier: its mask is its own.
- The search that ignores accents (`fold`) and the line that says what a `MultiSelect` holds
  (names joined with commas: the value of a field, not a sentence).

## Links

Components that navigate take an `href` and render it through the link given to `UiProvider`
(default: a plain `<a>`). The lib never imports the router; the app adapts it once:

```tsx
// src/app/components/atoms/router-link/RouterLink.tsx
export const RouterLink = ({
	'aria-current': current,
	href,
	...props
}: LinkProps) => {
	const { pathname } = useLocation();
	const to = useResolvedPath(href).pathname;
	const marked = isCurrent(pathname, to) ? 'page' : undefined;

	return <Link aria-current={current ?? marked} to={href} {...props} />;
};
```

The link marks the current page by itself, which is what `AppShell`, `Tabs` and `Breadcrumb`
show; one the kit already marked (`aria-current`) is not asked to work it out. It is **one
element type either way**: a link that swapped components when it became the current page would
be remounted and drop the focus it was followed with.

An `href` that leaves the app (another origin, `mailto:`, `tel:`), has a `target` or a `download`
stays a plain anchor.

## Icons

```tsx
<Icon name='search' />                                          {/* decorative: aria-hidden */}
<Icon name='alert-triangle' size='sm' label='Needs attention' /> {/* role="img" + name */}
```

`IconName` is the union of the registry (`icon/icon.registry.ts`, 66 [lucide](https://lucide.dev)
shapes, ISC license): `ICON_NAMES` lists them. To add one, copy its shapes from lucide into the
registry, sorted. Sizes: `xs` 12 · `sm` 16 · `md` 20 (default) · `lg` 24. An icon takes the color
of its text. The kit has no logo of its own: `AppShell` draws the one the app gives it (`logo`).

## Components

Every component is documented in its source (JSDoc with an example) and drawn live in the catalog
(`/ui`). The tables say what each one is for and the props that matter; all of them take
`className` and spread the native props of their element.

Shared conventions:

- **Native controls** (`Input`, `Textarea`, `Select`, `Checkbox`, `Switch`, `InputPhone`) take
  the native props: `value` / `defaultValue` / `onChange`, `name`, `ref`.
- **Composite controls** (`RadioGroup`, `SegmentedControl`, `InputRut`, `InputAmount`,
  `DatePicker`, `TimePicker`, `Calendar`, `Combobox`, `PeoplePicker`, `SearchSelect`,
  `MultiSelect`, `Tabs`) take `value` / `defaultValue` / `onValueChange`, and send a normalized
  value with the form through `name`. A reset of their form puts them back to `defaultValue`.
- **`onChange` of a composite control built on an input** (`InputRut`, `InputAmount`,
  `DatePicker`, `TimePicker`, `Combobox`) is the event of that input: it hears what is typed or
  pasted in it, a date pasted whole included. What is picked in a panel or a list (a day,
  «Today», «Clear», a time, a result) changes the value without an event of the input:
  `onValueChange` hears every change, and is the one to follow the value with. The `onChange` of
  a `FileUpload` hears a file chosen, dropped or taken away.
- **Open state** is `open` / `onOpenChange` (dialogs are controlled; `DropdownMenu`, `Popover`
  and `Collapsible` also run uncontrolled with `defaultOpen`).
- **Motion**: what appears (a popup, a dialog, a toast) comes in and leaves with a short
  transition, and is gone from the page once it ends; with reduced motion (the person's choice
  in the settings, or the system's) nothing moves and it is gone at once. Spinners and progress
  bars keep running.
- **Texts** are those of the language (see [Language](#language)); a component with one takes a
  prop for it (`closeLabel`), one with several takes `labels` (and `messages` for what is wrong).
- Inside a `Field` a control takes its label, hint, error and `required` from it.

### Shell and page

| Component        | What it is                                                                                                                                                                                                            | Main props                                                                                                                                                   |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `UiProvider`     | The root of the kit: the preferences of the person, the language, the router link, `useDialogs()` and the toasts                                                                                                      | `link`, `locale`, `timeZone`, `currency`, `texts`                                                                                                            |
| `AppShell`       | Header, side bar with the menu (folds to icons that say their name on hover and focus; a panel below 900 px, the page inert under it) and the content; skip link first                                                | `title`, `subtitle`, `logo`, `menu`, `utilities`, `pageKey`, `home`                                                                                          |
| `UserMenu`       | The signed-in person at the end of the header, as a button that opens their menu                                                                                                                                      | `name`, `detail`, `roleLabel`, `photo`, children (`DropdownMenuItem`)                                                                                        |
| `SettingsDialog` | The settings window: categories in a side bar, their options in rows. Brings «Appearance» (theme, text size, language) and «Accessibility»; the app adds its own with `sections`, built with `SettingsGroup` and rows | `open`, `onOpenChange`, `sections` (`id`, `label`, `icon`, `description`, `content`), `defaultSection`, `languages`, `labels`; row: `label`, `hint`, `group` |
| `Page`           | The body of a page: its blocks stacked with one gap, centered                                                                                                                                                         | `narrow`                                                                                                                                                     |
| `PageHeader`     | The `<h1>` of a page with its trail, a line under it and its actions                                                                                                                                                  | `title`, `meta`, `actions`, `breadcrumb`                                                                                                                     |

### Actions and status

| Component          | What it is                                                                                               | Main props                                                                                                                                              |
| ------------------ | -------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Button`           | An action; with `href`, a link drawn as a button                                                         | `variant` (`solid`, `outlined`, `ghost`, `filled`, `link`, `destructive`, `inverse`), `size`, `icon`, `iconEnd`, `iconOnly`, `loading`, `block`, `href` |
| `ButtonGroup`      | Buttons that belong together                                                                             | `label`                                                                                                                                                 |
| `DropdownMenu`     | Secondary actions behind one button (`DropdownMenuItem`, `…Separator`, `…Group`)                         | `label`, `icon`, `align`, `header`, `renderTrigger`; item: `onSelect`, `href`, `icon`, `tone`, `disabled`                                               |
| `Popover`          | A panel with any content that hangs from a button; not modal                                             | `label`, `icon`, `align`, `variant`, `renderTrigger`, `open` / `defaultOpen` / `onOpenChange`                                                           |
| `Tooltip`          | A hint on hover or keyboard focus that describes a control, drawn in the top layer; goes away on a press | `content`, `side`, `describes` (`false` when it only repeats the name), `disabled`                                                                      |
| `SegmentedControl` | Two to four options as joined buttons, one always chosen (native radios)                                 | `legend`, `options` (`label`, `value`, `icon`), `value`, `onValueChange`, `name`, `size`                                                                |
| `Badge`            | A short status                                                                                           | `tone`, `dot`, `size`                                                                                                                                   |
| `StatusDot`        | A state as a dot and its name                                                                            | `tone`, `label`, `pulse`                                                                                                                                |
| `Chip`             | A choice already made, removable                                                                         | `count`, `onRemove`, `removeLabel`                                                                                                                      |
| `Avatar`           | A person: initials, the photo over them                                                                  | `name`, `src`, `size`                                                                                                                                   |
| `Spinner`          | Something loading (`role='status'`)                                                                      | `label`, `showLabel`, `block`                                                                                                                           |
| `Skeleton`         | The shape of content that is loading                                                                     | `width`, `height`                                                                                                                                       |
| `Progress`         | How far a task is                                                                                        | `value`, `max`, `label`, `tone`                                                                                                                         |
| `Separator`        | A line between groups                                                                                    | `orientation`, `decorative`                                                                                                                             |

### Fields

| Component      | What it is                                                                                                                    | Main props                                                                                                       |
| -------------- | ----------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `Field`        | A labelled control with its hint and its error, tied for assistive technology                                                 | `label`, `hint`, `error`, `required`, `optional`                                                                 |
| `Label`        | The label of a control used without `Field`                                                                                   | `required`, `optional`                                                                                           |
| `Input`        | Free text in one line                                                                                                         | native, `size`                                                                                                   |
| `Textarea`     | Free text in several lines                                                                                                    | native, `size`                                                                                                   |
| `Select`       | One of a few known options: the native select, its list drawn by the kit where the browser allows                             | `options` (an item with its own `options` is a group), `placeholder`, `size`                                     |
| `SearchSelect` | One option of a long known list, with a search box; groups are only headings                                                  | `options`, `value`, `onValueChange(value)`, `name`, `placeholder`, `clearable`, `labels`                         |
| `MultiSelect`  | Several options at once; closed, a one-line summary and a counter; groups select nothing                                      | `options`, `value`, `onValueChange(values)`, `name` (one value each), `searchable`, `labels`                     |
| `Checkbox`     | A yes / no that waits for a submit                                                                                            | children (its name), `description`                                                                               |
| `Switch`       | A setting that applies at once                                                                                                | children (its name), `description`, `stateLabels`                                                                |
| `RadioGroup`   | One of a few options, all in view                                                                                             | `legend`, `options`, `variant='cards'`, `orientation`                                                            |
| `InputPhone`   | A phone number; a `prefix` (the code of a country) is shown and never typed                                                   | native, `prefix`                                                                                                 |
| `InputAmount`  | Money as the locale writes it, with the decimals of its currency; the form gets the clean number                              | `value`, `onValueChange(amount)` (a number, or `null`), `currency`, `min`, `max`, `messages`, `name`             |
| `DatePicker`   | A date typed as the locale writes one (masked) or picked in a calendar; value is ISO `YYYY-MM-DD`                             | `min`, `max`, `onValueChange(iso)`, `labels`, `messages`                                                         |
| `TimePicker`   | A time typed (`hh:mm`, 24 hours, masked) or picked in a panel: two columns, a list of times or a clock face; value is `HH:mm` | `picker` (`columns`, `list`, `clock`), `minuteStep`, `interval`, `min`, `max`, `onValueChange(time)`, `messages` |
| `Calendar`     | A month to pick a day in, fully keyboard navigable                                                                            | `min`, `max`, `onValueChange(iso)`, `focusOnMount`                                                               |
| `Combobox`     | A search box that finds one of many (remote or local), late answers discarded                                                 | `search(query, signal)`, `getLabel`, `getKey`, `renderOption`, `minLength`, `delay`, `clearOnPick`               |
| `PeoplePicker` | A `Combobox` of people: initials, name with the match marked, email and a `detail`                                            | `search`, `getKey`, `clearOnPick`                                                                                |
| `InputRut`     | A Chilean RUT (an identifier of Chile, kept for apps of that country): formats while typing, checks the digit on blur         | `onValueChange(rut, status)`, `messages`                                                                         |
| `FileUpload`   | One file asked for: what document, its requirements, the file chosen; drop is a shortcut                                      | `label`, `requirements`, `accept`, `required`, `error`, `onFileChange(file)`                                     |
| `FilterBar`    | The filters of a list as a form; with `autoSubmit` they apply by themselves                                                   | `onSubmit(formData)`, `autoSubmit`, `delay`, `layout`                                                            |
| `FilterChips`  | One filter as a row of chips with counts                                                                                      | `label`, `options`, `value`, `onValueChange`, `allLabel`                                                         |

### Content and feedback

| Component        | What it is                                                | Main props                                                                                 |
| ---------------- | --------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| `Card`           | A surface for one subject                                 | `title`, `description`, `label`, `actions`, `footer`, `elevation`                          |
| `GroupHeader`    | The title of a group of fields or cards                   | `title`, `context`, `action`, `icon`, `highlighted`                                        |
| `Collapsible`    | A section that folds (`<details>`)                        | `title`, `summary`, `defaultOpen`, `open`, `onOpenChange`                                  |
| `Accordion`      | Sections that fold, one under the other (`AccordionItem`) | `type` (`single`, `multiple`), `value`, `onValueChange`; item: `value`, `title`, `summary` |
| `DataGrid`       | The pairs of a record: label over value                   | `entries`, `booleanLabels`, `emptyLabel`                                                   |
| `KpiRow`         | A row of figures                                          | `items`                                                                                    |
| `Timeline`       | What happened, in order                                   | `items`                                                                                    |
| `Alert`          | A message in the page; `danger` is announced at once      | `tone`, `title`, `actions`, `onClose`                                                      |
| `ErrorAlert`     | The alert of an action that failed, from the error thrown | `error`, `title`                                                                           |
| `InfoNote`       | A quiet note next to what it explains                     | `tone`, `title`, `icon`                                                                    |
| `EmptyState`     | A list without items: why, and what to do                 | `title`, `action`, `icon`, `compact`                                                       |
| `Highlight`      | A text with the words of a search marked                  | `text`, `query`                                                                            |
| `VisuallyHidden` | Text for assistive technology only                        | —                                                                                          |

### Dialogs and notices

| API                           | What it is                                                                                                                | Main props                                                                                                                                    |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| `Dialog`                      | A modal over the page (native `<dialog>`: focus trapped, Escape, focus back)                                              | `open`, `onOpenChange`, `title`, `description`, `footer`, `size`, `locked`                                                                    |
| `FormDialog`                  | A dialog with a form that saves: locked while pending, the error shown inside                                             | `onSubmit(formData, form)`, `submitLabel`, `cancelLabel`                                                                                      |
| `AlertDialog`, `useConfirm()` | A question before something that cannot be undone; `notice` for something to read, `requireText` for a text to type first | `await confirm({ title, message, confirmLabel, tone, requireText })`; `tone` (`info`, `success`, `warning`, `danger`)                         |
| `useDialogs()`                | The questions an app asks with one call, each a promise: `alert`, `confirm`, `choose`, `prompt` (one at a time)           | `await choose({ title, options })` → the value or `undefined`; `await prompt({ title, label, required, validate })` → the text or `undefined` |
| `ChoiceDialog`                | One of several answers: a row of buttons, or a list when they explain themselves                                          | `options` (`value`, `label`, `description`, `icon`, `tone`), `onChoose`                                                                       |
| `PromptDialog`                | Asks for one text, said to be missing or wrong under its field                                                            | `label`, `required`, `multiline`, `validate`, `onSubmit(text)`                                                                                |
| `Drawer`                      | A secondary task beside the page                                                                                          | `open`, `onOpenChange`, `title`, `footer`, `side`, `size`                                                                                     |
| `toast()`, `dismissToast()`   | A short notice that goes by itself (`Toaster` is mounted by `UiProvider`)                                                 | `toast(message, { tone, description, duration })`                                                                                             |

### Navigation and tables

| Component    | What it is                                                                 | Main props                                                                                                             |
| ------------ | -------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| `Tabs`       | Views of one subject (`TabsList`, `Tab`, `TabsPanel`)                      | `value`, `defaultValue`, `onValueChange`, `variant`                                                                    |
| `Breadcrumb` | The trail to the current page                                              | `items`                                                                                                                |
| `Stepper`    | The steps of a process, the current one said in words                      | `steps`, `current`, `orientation`, `compact`                                                                           |
| `Pagination` | Pages of a list, by number                                                 | `page`, `pages`, `onPageChange` or `href`, `edges`, `brief`                                                            |
| `Pager`      | Pagination with the range shown, the page size and a jump                  | `page`, `pages`, `total`, `size`, `sizes`, `onPageChange`, `onSizeChange`, `jump`, `noun`                              |
| `Table`      | A plain table with the kit's look                                          | native                                                                                                                 |
| `DataTable`  | A table from data: sortable columns, row actions, cards on a narrow screen | `caption`, `columns`, `rows`, `getRowId`, `sort`, `onSortChange`, `onRowOpen`, `empty`, `toolbar`, `footer`, `density` |

### Functions

Every format takes an optional `locale` last (see [Language](#language)).

| Module      | Exports                                                                                                                                                                                                                                                       |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Language    | `useLocale()`, `setLocale`, `getLocale`, `configureLocale`, `DEFAULT_LOCALE`, `DEFAULT_CURRENCY`, `LOCALE_STORAGE_KEY`; `useTexts()`, `UI_TEXTS_EN`, `UI_TEXTS_ES`, `UiTexts`, `UiTextsOverride`                                                              |
| Dates       | `formatDate`, `formatTime`, `formatDateTime`, `formatRelative`                                                                                                                                                                                                |
| ISO dates   | `todayIso`, `toIsoDate`, `isoDateParts`, `displayIsoDate`, `parseTypedDate`, `maskTypedDate`, `maskPastedDate`, `datePattern`, `DATE_DIGITS`, `addDays`, `addMonths`, `weekdayOf`, `firstWeekday`, `spokenDate`, `clampIsoDate`, `monthNames`, `weekdayNames` |
| Times       | `toTime`, `timeParts`, `parseTypedTime`, `maskTypedTime`, `TIME_DIGITS`, `nowTime`, `timeSlots`, `isTimeWithin`, `clampTime`                                                                                                                                  |
| Amounts     | `maskAmount`, `parseAmount`, `formatAmount`, `isAmountText`, `amountShape`, `AMOUNT_MAX_DIGITS`                                                                                                                                                               |
| Names, more | `shortName`, `initials`, `formatNumber`                                                                                                                                                                                                                       |
| RUT (Chile) | `formatRut`, `normalizeRut`, `maskRut`, `RUT_MAX_LENGTH`, `rutStatus`, `cleanRut`, `checkDigit`                                                                                                                                                               |
| Preferences | `useTheme()` (theme, pure black, accent, contrast, motion, text size, links, what the system asks), `ACCENTS`, `THEMES`, the `*_STORAGE_KEY`s                                                                                                                 |

### Known limits

- A toast raised while a modal is open is inert under it: say the error of a dialog inside it
  (`FormDialog` does).
- A controlled `InputRut` / `DatePicker` only moves between valid values and `''`: remount it
  with a new `key` to drop a half-typed text.
- `DataTable` with `onRowOpen` wraps the first cell in a button: that cell must be plain content.
- `FileUpload` takes one file; the size of a file is for the app (or the server) to check, and
  to say through `error`.
- `SearchSelect` and `MultiSelect` filter a list the app already has; options that come from
  an API as the person types are a `Combobox`. No chips, no «select all», no option creation.
- An `InputAmount` given `value={null}` is empty, whatever its `defaultValue`: `null` is an amount
  that was given (none), and only one without a `value` starts with its default.
- An amount has at most fifteen digits, its decimals included, and no more decimals than its
  currency. A full field takes no more: a key or a paste that would leave more is refused whole,
  none of its digits lost. A `value` or a text with more is no amount (`maskAmount` gives `''`,
  `parseAmount` gives `null`), never one cut to fit.
- The decimals of an amount are read from what was just typed or pasted only, as the locale
  writes them (`1,250.50` in the United States) or as the other half of the world does (a last
  separator of thousands with one or two digits after it: `1.250,50`). In a currency without
  decimals they are left out (`1250000.50` pasted in Chilean pesos is `1.250.000`, not a hundred
  times more). The sign of the currency sits before the amount in every locale.
- A control that sends its value through a hidden input (`InputAmount`, `InputRut`, `DatePicker`,
  `TimePicker`, `Combobox`, `SearchSelect`, `MultiSelect`) sends none while it is `disabled`; the
  ones built on an input send it to the form named by `form`, when that is given.
- A masked field (`InputAmount`, `DatePicker`, `TimePicker`) reads into what was just typed or
  pasted only: a key takes away no digit it did not touch. `DatePicker` takes a date pasted whole
  in the place of what it had, with a day or a month of one digit (`11/5/2026`) or as an ISO
  date; `TimePicker` gives its zero to an hour of one digit (`9:30`) when it was just typed or
  pasted, not when a digit of the hour was taken away.
- A masked field that is full (`InputAmount`, `DatePicker`, `TimePicker`, `InputRut`) takes no
  more: a key or a paste that does not fit is refused whole, its caret left where it was, as a
  `maxLength` does. To change a character, type over it or take it away. The masks themselves
  (`maskTypedDate`, `maskTypedTime`, `maskRut`) cut nothing: a text with more characters than a
  date, a time or a RUT has is none of them.
- A `DatePicker` or an `InputAmount` writes its value again when the language changes while the
  page is open; a text that was half typed is left as it is.
- `TimePicker` holds a wall-clock time: 24 hours in every language, no seconds, no time zone. A
  date and a time are a `DatePicker` and a `TimePicker` side by side. An hour picked alone stays
  within `min` and `max` (08 with a minimum of 08:30 is 08:30); in its columns, a minute picked
  before any hour gives 00 as the hour and keeps the panel open.
- `timeZone` and `currency` are set once, by `UiProvider`: a component drawn before they change
  keeps what it wrote until it is drawn again.
- Languages written from right to left are not supported.
- `Calendar` has a fixed width (its seven days): its month and year selects do not size to their
  chosen option, so it is the same size whatever month it shows.
- Long lists are drawn whole, not windowed: every option stays in the page, so the keys, a screen
  reader and find-in-page reach it. A `SearchSelect` / `MultiSelect` was measured with 2,000
  options (each label is folded once, an arrow key draws two options); keep `options` the same
  array between renders, since a new one is folded and drawn again. A `DataTable` draws only
  the rows that change while `columns` and `onRowOpen` are the same between renders, but a new
  order still lays every row out again: page it (`Pager`) rather than show hundreds of rows.
- A module of the kit has no side effect on import: what must run once goes in `UiProvider`.
- `Tooltip` shows on hover and focus only: never the only place of something a touch screen
  needs.
- Not verified with a real screen reader, nor in Safari or Firefox (developed against Chromium);
  forced colors were checked in Chromium's emulation only.
- Glass has no setting of its own: it follows the system («reduce transparency») and the
  contrast chosen. Text over it is on a surface that keeps at least 62 % of its color, over a blur.
- Charts are not part of the kit.

## Conventions for components

- One folder per component in `components/<kebab>/`: `<Pascal>.tsx`, `.module.css` (inside
  `@layer ui.components`, tokens only) and `.spec.tsx`. Start from the `react-ui-component`
  scaffold (`.vscode/__templates__/`).
- English API. **No text in a component**: each one is in `i18n/en.ts` and `i18n/es.ts`, read
  with `useTexts()`, and overridable by a prop. One text is a prop of its own
  (`closeLabel ?? texts.close`); several go in one object (`labels`, `messages`) put over those
  of the language with `{ ...useTexts().calendar, ...defined(labels) }`: one given as
  `undefined` is one not given, and the text of the language stays (a plain `...labels` would put
  `undefined` in its place).
- A format called in a component takes the `locale` of `useLocale()`.
- `className` and `ref` pass through to the root element; native props spread onto it.
- Progressive enhancement: the build target includes browsers without the Popover API, `:has()`
  or `appearance: base-select`. Each use has a working fallback; never `light-dark()`, relative
  color syntax or anchor positioning.
- Inside the lib, import relatively (never through the barrel); never import `src/app`, the IoC
  container, the store or the router.
- A component renders and wires events; behaviour with state goes in a `<name>.hook.ts` next to
  it (`combobox.hook.ts`, `app-shell.hook.ts`), and what several share in `internal/` (never
  exported): `Modal`, `Popup` + `position.ts`, `HiddenInput`, `useControllableState`,
  `useFormReset`, `useMaskedCaret`, `insertedRange`, `undoChange`, `writeInput`, `defined`,
  `readPreference` / `writePreference`, `useOutsidePress`, `useDebouncedCallback`.
- The build splits the kit by rule, not by size (`vite.config.ts`): what the entry needs is one
  chunk, what two pages or more use another, what one page alone uses stays in that page's chunk.
  A module of the kit must not rely on being imported for a side effect: only the barrel and the
  stylesheets are kept for one. `kitLayers` writes the order of the cascade layers at the top of
  every stylesheet of the kit: the first one a browser reads decides it.
- A rule that changes what the stylesheet of another module sets (`control.control`) goes through a
  parent (`.root > .select`, the selects of `Calendar`): both are in `ui.components`, and with one
  class each the stylesheet read last would win, which the chunks decide, not the imports.
- CSS authoring: nest `@media` / `@container` / `@supports` inside the rule they change, and
  variants through a custom property of the component rather than a more specific selector.

## Testing

Specs assert roles, names, ARIA and `data-*` state — never class names (Vitest does not process
CSS). Helpers for what happy-dom lacks live in `__mocks__/`: `mockMatchMedia()` (system theme
and contrast), `mockPopover()` (the top-layer path of a popup; without it the fixed-box fallback
runs) and `mockRect()` (geometry: placement is tested in `internal/position.spec.ts`). Each one
restores itself when the test ends, whatever its outcome: call its `restore()` only to take it
away before that.

A spec runs as the kit is by itself: English, US dollars. One that reads Spanish texts or Chilean
formats says so once, at its top, with `inChile()` (`__mocks__/locale.mock.ts`); one that needs
another place gives the locale to the format it calls, or calls `configureLocale` and undoes it
in its cleanup.

In an app spec, render what the kit needs around the component: `<UiProvider>` for anything that
asks (`useConfirm()`, `useDialogs()`), shows toasts or links through the router
(`link={RouterLink}`), and call `dismissToast()` after each test — the toasts live beyond the
tree.
