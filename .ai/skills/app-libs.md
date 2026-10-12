# Skill: IoC, feature flags and routing

The full API for each library is in its README:
[`ioc`](../../src/libs/ioc/README.md) · [`feature`](../../src/libs/feature/README.md) ·
[`router`](../../src/libs/router/README.md).

## IoC (`#libs/ioc`, wired in `src/app/app.ioc.ts`)

- `createContainer()` returns `{ container, InversionOfControlProvider, useInjection }`.
  Register dependencies with `container.bind(token, value)`.
- Tokens are classes (the type is inferred) or strings (pass the generic:
  `useInjection<Api>('api')`).
- Import `useInjection` **relatively from `app.ioc.ts`**, not from `#libs/ioc`.
- `container.resolve(token)` works outside React too, for example in route loaders.
- Tests replace the container with
  `<InversionOfControlProvider values={new Map([[token, mock]])}>`. The map **replaces** the
  container; it is not merged with it.

## Feature flags (`#libs/feature`, wired in `src/app/app.features.ts`)

- Declare flags as `new FeatureHandler({ FLAG_NAME: boolean })`, with flag names in
  SCREAMING_SNAKE_CASE. `linkStorageToFeatureHandler` lets you override a flag in
  `localStorage`/`sessionStorage` with the `::FLAG_NAME` key.
- `useFeature('FLAG')` returns a **tuple**: `[enabled, setEnabled]`.
- Versioned components go in `X.v1.tsx` / `X.v2.tsx`. Use
  `withFeatures({ features: { FLAG: X_v1 | lazy(...) }, fallback, loading })`, which renders the
  first enabled variant (scaffold: `react-component-versioned`).

## Routing (`#libs/router`, table in `src/app/app.routes.tsx`)

- `#libs/router` re-exports `react-router`. Import `Link`, `useParams` and the rest from it.
- Routes are `{ <namespace>: RouteDefinition[] } satisfies Record<string, RouteDefinition[]>`.
- A `Layout` key wraps its children and `loading` sets the Suspense fallback for that branch.
  Use a layout route for guards such as auth (see the router README).
- `lazy: () => import('./pages/x/X.page.tsx')` code-splits the page, which is why pages need a
  default export. `loader` works with `useLoaderData`, and `ErrorBoundary` takes an error page.
- In tests, use `createRouter({ routes, type: 'memory', options: { initialEntries } })`.
