#### App configuration

## 1. Routes

App routes definition in `app.routes.ts`.

You can define nested routes and reuse lazy loaded components, improving code
splitting.

Use `payload` property for add specific static info for your route.

## 2. Store (Redux)

This app uses `@redux-toolkit` so you must declare _slices_ for manage your
store.

`App.store` contains _reducers_ declaration, so you can add new slices.

## 3. Layouts

Application shared layouts.

## 3. Pages

Application pages, use `app.routes.ts` for import.
