<h2 align="center"><b>Vite React Skeleton</b></h2>
<h3 align="center"><b>SPA</b></h3>

<br />

<p align="center">
  <a href="https://reactjs.org/" target="blank"><img src="https://upload.wikimedia.org/wikipedia/commons/a/a7/React-icon.svg" width="220" alt="React Logo" /></a>
</p>

<p align="center">
  Vite skeleton for React with TypeScript.
</p>

<p align="center">
  <a href="https://github.com/calvear93/react-template" target="_blank">
	<img src="https://img.shields.io/github/license/calvear93/react-template" alt="Package License" />
  </a>
</p>

## 📥 **Getting Started**

> ⚡ **Quick start:** run `pwsh ./INIT.ps1` to configure the project interactively — it fills the placeholders below, formats the result, and removes itself.

Otherwise, replace these terms across the project by hand:

- `(((project-name)))` — project name, e.g. `my-project`
- `(((app-name)))` — app name, e.g. `home-web`
- `(((app-title)))` — app title, e.g. `Sample App`
- `(((app-description)))` — short description of the app
- `(((base-path)))` — public base path, e.g. `web` (empty = root `/`)

1. Install [Node.js](https://nodejs.org/) — see `engines.node` in `package.json`.
2. Install [pnpm](https://pnpm.io/installation) — see `engines.pnpm` in `package.json`.
3. Run `pnpm install`.
4. Run `pnpm env:schema` to keep the env JSON schema in sync.
5. Start with `pnpm start:dev` (or run tests with `pnpm test:dev`).

### 🐳 Docker

- Build: `docker build --no-cache --build-arg ENV=dev -f Dockerfile --tag image_name .`
- Run: `docker run -d -it -p 8080:8080/tcp --name container_name image_name`
- Open `http://localhost:8080/` in your browser.

## 📋 **Environments**

This template uses an environment loader (`env` CLI) and ships with two environment names:

- **dev**: local development
- **release**: production-like settings

You can add more environments (e.g. `qa`, `prod`) by creating the corresponding files under `env/` and updating `env/appsettings.json` if needed.

## 🧪 **Executing**

Project uses **pnpm scripts** to run, test, and build.
Many scripts are environment-scoped via `:<env>` where `<env>` is typically `dev` or `release`.

| Command                      | Action                         |
| ---------------------------- | ------------------------------ |
| pnpm start:`<env>`           | executes the app               |
| pnpm build:`<env>`           | build the app                  |
| pnpm preview                 | builds and serves the app      |
| pnpm test:`<env>`            | executes tests                 |
| pnpm test:`<env>` --coverage | executes tests with coverage   |
| pnpm test:`<env>` --run      | executes tests without watcher |
| pnpm env:schema              | updates env JSON schema        |
| pnpm format                  | code format                    |
| pnpm lint                    | code/styles review             |
| pnpm stylelint               | CSS linting                    |
| pnpm test:mutation           | mutation testing (Stryker)     |

## 🏗️ **Architecture Overview**

This React SPA is built around a few in-house libraries; each ships its own README with usage and examples:

- **📦 Dependency Injection (IoC)** — React-context IoC container · [`src/libs/ioc`](src/libs/ioc/README.md)
- **🛣️ Routing** — central route config with lazy loading and nested layouts · [`src/libs/router`](src/libs/router/README.md)
- **🎛️ Feature Flags** — runtime feature toggles for controlled rollouts · [`src/libs/feature`](src/libs/feature/README.md)
- **⚛️ State** — Jotai atoms for fine-grained reactive state
- **🧩 Components** — co-located components, hooks, and CSS Modules

## 📚 **Documentation**

Conventions, patterns, and worked examples live in the docs — start with whichever fits:

| Topic                                               | Where                                              |
| --------------------------------------------------- | -------------------------------------------------- |
| Project contract (stack, rules, conventions)        | [`AGENTS.md`](AGENTS.md)                           |
| Architecture, coding standards, copy-paste patterns | [`.github/instructions/`](.github/instructions/)   |
| Reusable skills & the OpenSpec spec-driven workflow | [`.ai/`](.ai/README.md)                            |
| Canonical code scaffolds for new files              | [`.vscode/__templates__/`](.vscode/__templates__/) |
| High-quality examples already in this repo          | [`exemplars.md`](exemplars.md)                     |
| Library usage (IoC · Router · Feature flags)        | [`src/libs/`](src/libs/)                           |

## 🧰 Configuring fnm (Fast Node Manager)

fnm (Fast Node Manager) is a lightweight Node.js version manager used by this template to run multiple Node versions easily.

- Install fnm following the official instructions: https://github.com/Schniz/fnm
- On Windows, fnm stores the default Node alias file at:
  `C:\Users\{username}\AppData\Roaming\fnm\aliases\default`

Important: Add `C:\Users\{username}\AppData\Roaming\fnm\aliases\default` to your Windows System PATH so Node MCP servers can find the fnm-managed Node; then restart your terminals.
