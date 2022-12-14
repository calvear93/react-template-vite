#### App configuration

## 1. Routes

App routes definition in `app.routes.ts`.

You can use the name of the page or layout for
the rote, and it will load lazily.
In example, if you have App.layout.tsx and Main.page.tsx,
you can define your route as

```javascript
const routes = {
	Main: {
		path: '/',
		layout: 'App',
	},
};
```

## 2. Store

This app uses `easy-peasy` for global store, so you must declare
_slices_ for manage your store.

`App.store` contains _slices_ imports.

## 3. Layouts

Application shared layouts.

## 3. Pages

Application pages.
