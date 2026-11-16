# Skill: UI kit (`#libs/ui-core`)

The UI kit of the template, in React + plain CSS. **Every screen is built from it**: check the
kit before writing any element, and never redraw one it already has. API reference and tokens:
[`src/libs/ui-core/README.md`](../../src/libs/ui-core/README.md); live catalog: the `/ui` route
(`pnpm start:dev` → `http://localhost:3003/ui`).

## Pick the component

| Need                                      | Use                                                                                                         |
| ----------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| The frame of the app, a page, its heading | `AppShell` (in `AppLayout`), `Page`, `PageHeader`                                                           |
| An action / a link that looks like one    | `Button` (`href` makes it a link); secondary ones in a `DropdownMenu`                                       |
| A form field                              | `Field` + `Input` / `Textarea` / `Select` / `Checkbox` / `RadioGroup` / `Switch`                            |
| A phone, a date, a time                   | `InputPhone`, `DatePicker` (ISO `YYYY-MM-DD`), `TimePicker` (`HH:mm`; `picker`: columns, list, clock)       |
| A few known options, one                  | `Select` (native; an item with `options` is a group, a heading only)                                        |
| A long known list, one, searched          | `SearchSelect`                                                                                              |
| Several options at once                   | `MultiSelect` (`searchable` for a long list)                                                                |
| Options that come from an API, searched   | `Combobox`; people → `PeoplePicker`                                                                         |
| An amount of money                        | `InputAmount` (value: a number, or `null`; `currency` when it is not the app's)                             |
| Two to four exclusive options, as buttons | `SegmentedControl`; with descriptions → `RadioGroup`                                                        |
| A file                                    | `FileUpload`                                                                                                |
| A list from data                          | `DataTable` (+ `FilterBar` in its own `Card` above, `Pager` below: page it, do not show hundreds of rows)   |
| A record                                  | `Card` + `DataGrid`; history → `Timeline`; figures → `KpiRow`                                               |
| Loading / empty / error                   | `Spinner` or `Skeleton` / `EmptyState` / `Alert tone='danger'` or `ErrorAlert`                              |
| A status                                  | `Badge`, `StatusDot`                                                                                        |
| A modal task / a form that saves          | `Dialog` / `FormDialog`; beside the page → `Drawer`                                                         |
| A small panel hanging from a button       | `Popover` (not modal); a hint on a control → `Tooltip`                                                      |
| Sections that fold                        | `Accordion` + `AccordionItem`; one alone → `Collapsible`                                                    |
| «Are you sure?»                           | `const confirm = useConfirm()` → `await confirm({ title, tone })`; irreversible → `requireText`             |
| A notice to read, a choice, a text        | `const { alert, choose, prompt } = useDialogs()` → `await choose({ title, options })`                       |
| «Saved» / «could not save»                | `toast(message, { tone })` — inside a dialog, show the error in it                                          |
| Views of one subject, steps, a trail      | `Tabs`, `Stepper`, `Breadcrumb`                                                                             |
| The settings of the person                | `SettingsDialog` (theme, text size, language, contrast, links, motion + the app's `sections`); `useTheme()` |
| An icon                                   | `Icon name` (see `ICON_NAMES`)                                                                              |
| A Chilean RUT                             | `InputRut` (kept for apps of that country)                                                                  |

Not there? Compose it from kit components in `src/app/components/` (or the page's
`components/`). Only a piece that is generic and reusable goes into the lib — that is a change
under `src/libs/**`: non-trivial, with a change record.

## Rules

- Import from `#libs/ui-core` only (the barrel); never a deep path into the lib.
- **Style with tokens:** in a CSS Module use `var(--ui-space-*)`, `var(--ui-color-*)`,
  `var(--ui-font-size-*)`, `var(--ui-radius-*)`, `var(--ui-shadow-xs … xl)`,
  `var(--ui-duration-*)` — never a hex. A focus ring is
  `outline: var(--ui-ring-width) solid var(--ui-color-ring)`; a state is never told by a color
  alone.
- **Motion:** animate with `var(--ui-duration-*)` and nothing else is needed for reduced motion
  (the tokens become `0s`). Never `@media (prefers-reduced-motion)`: what needs its own rule uses
  `:root[data-motion='reduce'] &`. The kit's CSS lives in cascade layers, so a class passed
  through `className` always wins: no `!important`, no deeper selectors.
- **Links:** give `href` to the kit's components; they render through `RouterLink` (set once in
  `App.tsx`). Do not wrap a kit `Button` in a router `Link`.
- **Language:** the kit writes in the locale of the app (`APP_LOCALE`, given to `UiProvider`;
  English without one) or the one its user chose. Nothing a language decides is written by hand
  — no array of months, no `count === 1 ? … : …`, no separator, no «5 min ago», no date pattern.
  Use the functions of the kit (`formatDate`, `formatRelative`, `formatNumber`, `formatAmount`,
  `monthNames`, …) and, in a component, give them the `locale` of `useLocale()`:
  `formatDate(order.date, locale)`.
- **Texts:** the kit's own are those of the language and are overridable (`labels`, `messages`,
  `UiProvider texts`). The app's copy is the app's: the kit translates only itself.
- **Accessible by construction:** keep the names the components ask for (`label`, `legend`,
  `caption`, `aria-label` on an icon-only control). A field's error goes in `Field error`, not in
  a toast.
- **Dates** travel as ISO texts (`YYYY-MM-DD`) and are shown with `format*`; an amount travels as
  a number.

## Tests

- Wrap in `<UiProvider>` whatever uses `useConfirm()` or `useDialogs()`, raises toasts or needs
  router links (`link={RouterLink}` + a router). Call `dismissToast()` in `afterEach` when a test
  raises one.
- A test sees the kit as it is by itself: English, `en` formats, US dollars. Query by role and
  name (`getByRole('button', { name: 'Save' })`); a `Combobox` list is a `listbox` of `option`s,
  a `DatePicker` and a `TimePicker` open a `dialog`, `AlertDialog` is an `alertdialog`; a
  `SearchSelect` / `MultiSelect` is a `combobox` named by its label whose text is its value, and
  a `SegmentedControl` a `group` of `radio`s. The dialogs of `useDialogs()` are an `alertdialog`
  (notice, confirmation, choice) or a `dialog` with one `textbox` (prompt); `SettingsDialog` is a
  `dialog` whose categories are `tab`s.
- A test that changes the language (`setLocale`, `configureLocale`) undoes it in its cleanup
  (`setLocale(null)`, `configureLocale({})`).
- Vitest does not apply CSS: assert roles, names, ARIA and `data-*`, never a class or a color.

## Adding to the kit

1. Scaffold `react-ui-component` → `src/libs/ui-core/components/<kebab>/` (component, CSS Module
   inside `@layer ui.components`, spec); export it from `index.ts`.
2. Follow the lib README → _Conventions for components_ (native first, zero dependencies, no
   text outside `i18n/en.ts` and `i18n/es.ts`, `className` / `ref` passthrough, behaviour in a
   hook).
3. Add its example to a section of the catalog (`src/app/pages/ui-catalog/sections/`) and its row
   to the README table.
4. Check it in the browser in light, dark and high contrast, in both languages, at 1280 and
   390 px, and with the keyboard only.

A new icon: copy its shapes from lucide into `icon/icon.registry.ts`.
