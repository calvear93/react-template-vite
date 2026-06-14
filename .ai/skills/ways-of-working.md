# Ways of working — autonomy, quality, and non-technical users

The operating manual every agent follows in this repo, on top of [`AGENTS.md`](../../AGENTS.md).
It exists so you deliver **high-quality, production-ready** changes with **as little
back-and-forth as possible** — even when the person you're helping is **not technical**.

Read this first. The other agent roles (`.ai/agents/*`) and the spec skills point here for
the autonomy policy, the Definition of Done, and how to talk to the user.

## 1. Who you're working for

- Assume the requester may be **non-technical**: they describe outcomes ("let people reset
  their password", "show me who signed up this week"), not implementations. It is **your**
  job to translate intent into this template's patterns.
- **Mirror the user's language** in everything you _say_ to them — questions, summaries,
  "how to try it". Keep everything you _write into the repo_ — code, identifiers, comments,
  docs, commit messages — in **English** (per `AGENTS.md`).
- Explain in plain terms. No jargon dumps. If you must name a technical thing, add one clause
  on what it does for them.

## 2. Default to action (autonomy policy)

- **Bias to doing, not asking.** Make every _technical_ decision yourself from §3 and the
  template's existing patterns.
- Ask the user **only** when the answer changes _what gets built_ (a product / intent choice)
  and you genuinely cannot infer it. Then ask **1–3 short, plain-language questions**, batched,
  each with a recommended option.
- For everything else: pick the sensible default, **state the assumption** in your close-out
  ("I assumed X — tell me if that's wrong"), and proceed.
- Never block on a decision you are equipped to make. Never invent a _product_ fact silently —
  surface it as an assumption.

## 3. Decide technical forks yourself (defaults)

When a technical choice comes up, take the default below instead of asking. These are the
template's established patterns — the best-practice skills in `.ai/skills/` have the details.

| Fork                           | Default in this template                                                                                                                                                        |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| New code of any kind           | Start from the matching scaffold in `.vscode/__templates__/<pattern>/`                                                                                                          |
| Local UI state                 | `useState` in the component                                                                                                                                                     |
| State shared across components | A store module (internal `_innerStore` + public read/write) under `src/app/store/*.store.ts`                                                                                    |
| Calling an API / fetching data | An injected service bound in `app.ioc.ts`, consumed via `useInjection` — never raw `fetch` in components                                                                        |
| Config, URLs, secrets          | Never hardcode. Define in `env/` (`@calvear/env`), parse with Zod in the config layer, bind in `app.ioc.ts`, consume via `useInjection`. After adding a var → `pnpm env:schema` |
| Request / response shapes      | A zod schema (`*.schema.ts`); derive types with `z.infer`; validate with `.safeParse()`                                                                                         |
| A new service / dependency     | Bind it in `app.ioc.ts`; consume with `useInjection(Token)`                                                                                                                     |
| Styling                        | CSS Modules (`*.module.css`) + UnoCSS utility classes                                                                                                                           |
| A new screen / route           | Add it to `app.routes.tsx`, lazy-load the page, give it an error boundary                                                                                                       |
| Risky / experimental behavior  | Guard it behind a feature flag via `#libs/feature` (`useFeature(...)`)                                                                                                          |
| Imports                        | `#libs/*` aliases; keep `.ts`/`.tsx` on relative imports                                                                                                                        |
| Tests                          | Colocated `*.spec.ts(x)`, Vitest + React Testing Library + IoC mocks (`InversionOfControlProvider` + a values `Map`)                                                            |

If a fork isn't covered here, read the relevant skill (`react-patterns`, `atomic-design`,
`ioc-binding`, `zod-schema`, `vitest-tdd`, `vite-config`, `typescript`) and follow the existing code.

## 4. Right-size the process

The spec-driven loop (`AGENTS.md`) is the backbone and keeps the living specs accurate.
**Scale the ceremony to the change**, and always surface **plain-language checkpoints** the
user can actually judge:

- **Trivial / obvious** (copy tweak, tiny fix): just do it, pass the Definition of Done, give a
  one-line close-out.
- **Small, clear change**: state a brief plan in plain language, build it, pass the gate.
- **Non-trivial / ambiguous / new capability**: run the OpenSpec loop (intake → propose →
  [design] → tasks → implement → archive). Present each checkpoint in the user's language —
  _"Here's what I understood / what I'll build / what I built / how to try it"_. The user
  approves **in their own words**; never make them read RFC-2119 requirements or spec deltas.

In the spec-implement loop, drive the work with `pnpm test:dev` → `pnpm build:dev` → `pnpm lint`.

Whatever the size, keep the specs truthful (deltas + living specs) — they are the project's
durable memory, written for the next agent, not for the user.

## 5. Definition of Done (the single quality gate)

A change is **DONE** only when **all** of these hold. This is _the_ checklist — other agent
roles reference it instead of keeping their own copy.

- ☑️ Tests written **first** and passing — `pnpm test:dev --coverage --run`
- ☑️ Lint, styles, and types clean — `pnpm lint`, `pnpm stylelint`, `tsc --noEmit`
- ☑️ No `any`, no disabled TS checks, no hardcoded config / URLs / secrets (inject via IoC; env via `@calvear/env`, `pnpm env:schema` after changes)
- ☑️ Inputs and outputs validated with zod at the edges
- ☑️ Every UI handles **loading, empty, and error** states
- ☑️ Accessible — semantic HTML, ARIA where needed, keyboard reachable
- ☑️ It **actually runs**: verify the behavior (`pnpm start:dev` / `pnpm preview`), don't just trust the diff
- ☑️ **User-facing close-out** delivered (§7), in the user's language

Do not hand back partial or broken work. If a gate fails, fix it and re-run (§6).

## 6. Fix your own failures

- If tests / lint / types fail, **you own it**: read the error, find the root cause, fix it,
  re-run. Loop until green.
- Do **not** weaken a test to make it pass, `// eslint-disable` to dodge a rule, or `as any` to
  silence the type checker. Solve the real problem.
- Use the `debug` role's systematic approach for stubborn bugs (reproduce → isolate root
  cause → fix → verify).
- If genuinely stuck after honest attempts, stop and explain — in plain language — what's
  blocking you and the options you see.

## 7. Close out in plain language

End every task with a short summary **in the user's language**. Lead with what they care about,
not file paths or test counts:

```
✅ What you can do now: <the new capability, one sentence>
▶️ How to try it: <e.g. run `pnpm start:dev`, open the app, click …>
⚠️ Not included / I assumed: <limits + any assumptions you made>
```

Mention technical details (files changed, test counts, follow-ups) only if they ask, or briefly
at the end for a technical reviewer. The point is the user should always know **what changed for
them, how to see it, and what's left** — without reading code.
