# Environment variables (`env/`)

This folder defines the app's environment variables for each environment (`dev`, `release`).
[`@calvear/env`](https://github.com/calvear93/env) (the `env` command) gathers them from several
sources, validates them against a schema and injects them into `process.env` before running Vite or
Vitest, after `:`.

```bash
pnpm start:dev       # the dev server with the dev configuration
pnpm build:release   # the build for release
pnpm test:dev        # the tests with the dev configuration
```

## 1. Files

| File                     | Committed | Written by   | Purpose                                             |
| ------------------------ | --------- | ------------ | --------------------------------------------------- |
| `appsettings.json`       | Yes       | The team     | Variables, per environment and per mode             |
| `settings/settings.json` | Yes       | The team     | `env` configuration: nesting delimiter, …           |
| `settings/schema.json`   | Yes       | `env schema` | Validation schema of the variables                  |
| `<env>.env.json`         | No        | You          | Build-time values that must not be committed        |
| `<env>.local.env.json`   | No        | You          | Your personal values; they win over everything else |

`env/.gitignore` only lets `appsettings.json`, `settings/` and this README through. In VS Code,
`<env>.local.env.json` gets autocompletion from `settings/schema.json` (`.vscode/schemas/`).

## 2. Environments and modes

`env -e <environment> -m <mode> [<mode>…] : <command>`

| Environment | Use                              |
| ----------- | -------------------------------- |
| `dev`       | Development                      |
| `release`   | The configuration of the release |

| Mode    | Use                                     |
| ------- | --------------------------------------- |
| `build` | Production build (`build:*`, `preview`) |
| `debug` | Dev server (`start:*`)                  |
| `test`  | Tests (`test:*`)                        |

**The environment is inferred from the script name:** `pnpm start:dev` loads `dev` without `-e`,
because `env` takes the last segment after `:`. A suffix that is not a defined environment (a typo
like `build:relase`) aborts the command. Scripts whose suffix is not an environment pass `-e`
(`preview`, `env:schema`), and so does any call outside a pnpm script.

**There is one build per environment** (`build:dev`, `build:release`): the `APP_*` variables are
written into the bundle when it is built, so each environment needs its own.

## 3. Where each variable comes from

The sources are merged in this order; each one wins over the previous ones:

1. `package-json`: `NAME`, `VERSION`, `ENV`… from `package.json`.
2. `app-settings`, from `appsettings.json`:
    1. `|DEFAULT|`: shared values;
    2. `|ENV|.<environment>`;
    3. `|MODE|.<mode>`, in `-m` order;
    4. `appsettings.<environment>.json` and `appsettings.<mode>.json`, if they exist;
    5. `|LOCAL|.<environment>` and `appsettings.<environment>.local.json`, skipped in CI.
3. `secrets`: `<environment>.env.json`.
4. `local`: `<environment>.local.env.json`, skipped in CI.

```json
{
	"$schema": "../node_modules/@calvear/env/schemas/env.schema.json",
	"|DEFAULT|": {
		"BASE_URL": "/",
		"FONT_FAMILY": "Quicksand",
		"APP": {
			"ENV": "[[ENV]]",
			"NAME": "[[NAME]]",
			"VERSION": "[[VERSION]]"
		}
	},
	"|MODE|": {
		"build": { "NODE_ENV": "production", "BASE_URL": "/(((base-path)))" },
		"debug": { "NODE_ENV": "development", "PORT": 3003 }
	}
}
```

- **Nested keys:** flattened with `_` (`nestingDelimiter`), so `APP.NAME` arrives as `APP_NAME`.
- **Interpolation:** `[[KEY]]` reads another variable (`expand`); `[[NAME]]` comes from
  `package.json`.
- **Arrays add up:** a higher layer does not replace an array, it is appended to the one below.
- **Skipped keys:** a key starting with `#` is not loaded, so it serves as a note.
- **No comments:** these are strict JSON files; a `//` breaks them.
- **Everything is text:** `true` arrives as `'true'` and `3003` as `'3003'`.

## 4. Secrets

A browser app cannot keep secrets: everything that reaches the bundle can be read in the browser.
Credentials belong to a backend; the app only carries public identifiers (URLs, client ids).
`<environment>.env.json` is still useful for build-time values you do not want committed (they reach
the bundle only if their name starts with `APP_`).

## 5. Validation

`settings/schema.json` has one section per provider. With `schemaValidate` on, the variables are
validated against it before the command runs. `pnpm env:schema` rebuilds it from what `dev` loads in
`build` mode and merges the changes with the existing schema.

## 6. Using them in the code

- **Only `APP_*` reaches the browser:** `vite.config.ts` sets `envPrefix: 'APP_'`, so
  `import.meta.env` exposes only those variables (plus Vite's own: `BASE_URL`, `MODE`, `DEV`,
  `PROD`). Everything `APP_*` is written into the bundle and is public.
- **The rest is for the build:** `vite.config.ts` reads `BASE_URL`, `PORT`, `FONT_FAMILY`,
  `FONT_WEIGHTS` and `SERVICE_WORKER` from `process.env` (base path, dev server, fonts, PWA).
- **Types:** `src/env.d.ts` registers `appsettings.json` and `settings/schema.json` in
  `@calvear/env`, which types `import.meta.env` (the `APP_*` variables) and `process.env` (every
  variable, for `vite.config.ts`) by itself: a new variable in `appsettings.json` is typed without
  touching that file. Booleans are `'false' | 'true'` and the rest `string`. `import.meta.env` is
  strict (Vite's `strictImportMetaEnv`): a variable that is not in `appsettings.json` or lacks the
  `APP_` prefix does not compile, instead of being `any` and reaching the browser `undefined`.
- **Logs:** with `--log debug` (`start:dev`, `build:*`) every resolved variable is printed.

## 7. Reference

| Script                        | Command                              |
| ----------------------------- | ------------------------------------ |
| `start:dev` / `start:release` | `env -m debug : vite`                |
| `build:dev` / `build:release` | `env -m build : vite build`          |
| `preview`                     | `env -e dev -m build : vite preview` |
| `test:dev` / `test:release`   | `env -m test : vitest`               |
| `env:schema`                  | `env schema -e dev -m build`         |

`start:dev` and the `build:*` scripts add `--log debug`. Every `env` option is described in the
[`@calvear/env` README](https://github.com/calvear93/env#readme).
