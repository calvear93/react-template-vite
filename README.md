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

## ✒ **Description**

<a href="https://reactjs.org/" target="_blank">React</a> is a library for
building semantic components in a very easy way. It uses modern JavaScript, and supports <a
href="http://www.typescriptlang.org" target="_blank">TypeScript</a>, and under
the hood this skeleton uses <a href="https://vitejs.dev/"
target="_blank">Vite</a>.

## ⛩ **Structure**

```bash
├── README.md
├── env/
│   └── appsettings.json
├── src/
│   ├── app/
│   │   ├── assets/
│   │   │   └── assets.d.ts
│   │   ├── components/
│   │   ├── layouts/
│   │   ├── pages/ # app pages, loaded in app/app.routes.ts
│   │   ├── slices/
│   │   ├── styles/
│   │   ├── App.tsx
│   │   ├──  app.routes.ts
│   │   ├──  App.store.tsx
│   │   └──  App.router.tsx
│   ├── tests/
│   ├── libs/
│   │   └── router/ # routing using react router v6
│   ├── env.d.ts
│   └── main.tsx # entry file
├── index.html # entry SPA HTML
├── Dockerfile
├── tsconfig.json
└── package.json
```

## 📥 **Getting Started**

-   Replace globally these terms:

    -   `(((base-path)))` web base path, i.e. web (for get /web/\*)
    -   `(((app-name)))` app name, i.e. home-web
    -   `(((app-title)))` app title, i.e. Sample API
    -   `(((project-name)))` project name, i.e. my-project
    -   `(((project-description)))` project description, i.e. API for manage user data

*   Set up your `dev.local.env.json` with:

```json
{
    "BASE_URL": "/"
}
```

-   Install [NodeJS](https://nodejs.org/es/).
-   Install [PNPM](https://pnpm.io/installation)
-   Execute `pnpm install` command.
-   Execute `pnpm env:schema` command.
-   Run either `pnpm start:dev` or `pnpm test:dev` commands.

## 📋 **Branches and Environments**

Project has 3 environments (infrastructure) base for project building.

-   **dev (development)**: environment with breaking changes and new features.
-   **release (production)**: release environment.

## 🧪 **Executing**

Project uses **npm scripts** for eases execution, testing and building.
Many of these script run on a defined environment, specified after ':', and
it environment may be 'dev', 'qa' or 'prod'.

| Command                      | Action                        |
| ---------------------------- | ----------------------------- |
| pnpm start:`<env>`           | executes the app              |
| pnpm build:`<env>`           | build the app                 |
| pnpm test:`<env>`            | executes tests                |
| pnpm test:`<env>` --coverage | executes tests                |
| pnpm env:schema              | updates env JSON schema       |
| pnpm lint                    | code format review            |
| pnpm lint --fix              | code format review/fix        |
| pnpm stylelint               | stylesheets format review     |
| pnpm stylelint --fix         | stylesheets format review/fix |

## 🧿 **Linting**

Project use linters, for code formatting and code styling normalizing.

-   **[eslint](https://eslint.org/)**: tool for identifying and reporting on patterns found in ECMAScript/JavaScript code
-   **[prettier](https://prettier.io/)**: opinionated code formatter
-   **[stylelint](https://stylelint.io/)**: linter that helps you avoid errors and enforce conventions in your styles

For correct interpretation of linters, is recommended to use [Visual Studio Code](https://code.visualstudio.com/) as IDE and install the plugins in .vscode folder at 'extensions.json'.

## 🛠️ **Troubleshooting**

-   **I want to debug my code with breakpoints**:

    First, you should run your app with `pnpm start:dev` so you can debug in Visual Studio Code,
    using the `launch.json` profile in .vscode, pressing F5 or in Run and Debug sidebar option.

-   **`<cmd>` is not recognized as an internal or external command, operable program or batch file.**:

    In Windows, sometimes appear this message, because some node module isn't installed for your system version.
    In example, if you execute `npm i` in WSL, and execute `pnpm start:dev` in Powershell, you get the error
    for `env-cmd` is not recognized.
    So, you should execute `npm i` in Powershell terminal for solve that.

*   **I can't see my console logs for my unit tests**:

    You can set "verbose": false in webpack.config.js for show your console logs.

---

⌨ by Alvear Candia, Cristopher Alejandro <calvear93@gmail.com>
