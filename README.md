<h2 align="center"><b>React Skeleton</b></h2>
<h3 align="center"><b>SPA</b></h3>

<br />

<p align="center">
  <a href="https://reactjs.org/" target="blank"><img src="https://upload.wikimedia.org/wikipedia/commons/a/a7/React-icon.svg" width="220" alt="React Logo" /></a>
</p>

<p align="center">
  A JavaScript library for building user interfaces.
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
the hood this skeleton uses <a href="https://create-react-app.dev/"
target="_blank">Create React App</a>.

### Easy SPA Webs using React CRA with TypeScript.

Main feature are:

-   `typescript` ready
-   `eslint` with `prettier`
-   `stylelint` for `css` and `sass`
-   `react router` 6 with declarative routing handler
-   `service worker` ready
-   `redux` ready using `@redux-toolkit`
-   `docker` ready

## ⛩ **Structure**

```bash
├── README.md
├── .vscode/ # vscode debug config
├── env/
│   └── appsettings.json # non secret environment variables
├── src/
│   ├── app/ # initialization
│   │   ├── assets/
│   │   │   └── assets.d.ts # assets and modules declaration
│   │   ├── config/
│   │   ├── components/ # shared components
│   │   ├── hooks/ # shared hooks
│   │   ├── styles/ # global styles
│   │   ├── providers/ # adapters, api connections
│   │   ├── slices/ # redux reducers and actions
│   │   ├── layouts/ # app layouts and containers
│   │   ├── pages/ # app pages, loaded in app/app.routes.ts
│   │   ├── App.tsx
│   │   ├──  app.routes.ts # application routes
│   │   ├──  App.store.tsx # redux
│   │   └──  App.router.tsx
│   ├── tests/ # e2e tests
│   ├── libs/ # libraries shared with other apps
│   │   └── router/ # routing using react router v6
│   ├── env.d.ts # .env environment types declaration
│   ├── assets.d.ts # assets types declaration
│   ├── vendor.d.ts # providers types overriding
│   ├── service-worker.ts
│   └── index.tsx
├── Dockerfile
├── tsconfig.json
├── webpack.config.js # webpack config (craco)
└── package.json
```

## 📥 **Getting Started**

-   Replace globally these terms:

    -   `<base-path>` web base path, i.e. web (for get /web/\*)
    -   `<app-name>` app name, i.e. home-web
    -   `<project-name>` project name, i.e. my-project
    -   `<project-title>` project title, i.e. My Project
    -   `<project-description>` project description, i.e. Web for show account info

-   Set up your `dev.local.env.json` with:

```json
{
    "PUBLIC_URL": "",
    "BASE_PATH": "/"
}
```

-   Install [NodeJS](https://nodejs.org/es/) for your machine.
-   Execute `npm install` command. (`npm i --force` in case of conflicts).
-   Execute the app with `npm run start:dev`.

## 📋 **Branches and Environments**

Project has 3 environments (infrastructure) base for project building.

-   **dev (development)**: environment with breaking changes and new features.
-   **qa (quality assurance)**: environment for testing and quality assurance.
-   **prod (production)**: productive environment.

## 🧪 **Executing**

Project uses **npm scripts** for eases execution, testing and building.
Many of these script run on a defined environment, specified after ':', and
it environment may be 'dev', 'qa' or 'prod'.

| Command               | Action                        |
| --------------------- | ----------------------------- |
| npm run start:`<env>` | executes the app              |
| npm run build:`<env>` | build the app                 |
| npm run test:`<env>`  | executes tests                |
| npm run test:coverage | testing coverage report       |
| npm run env:schema    | updates env JSON schema       |
| npm run lint          | code format review            |
| npm run lint:fix      | code format review/fix        |
| npm run stylelint     | stylesheets format review     |
| npm run stylelint:fix | stylesheets format review/fix |

## ⚙️ **Commands**

### **1. Docker**

| Command                                                                                                 | Action       |
| ------------------------------------------------------------------------------------------------------- | ------------ |
| docker build --build-arg ENV=`<env>` --tag `<image_name>` `<build-context>`                             | docker build |
| docker run -d -it -p `<expose_port>`:`<container_app_port>`/tcp --name `<instance_name>` `<image_name>` | docker exec  |

### **2. Node Tools**

| Command                      | Action                    |
| ---------------------------- | ------------------------- |
| npm install -g npm@latest    | npm update                |
| npm update --save/--save-dev | soft updated for packages |
| npx npm-check-updates -u     | hard update for packages  |

### **3. Git Helpful Commands**

| Command                                   | Action                             |
| ----------------------------------------- | ---------------------------------- |
| git config core.ignorecase false          | case-sensitive enable              |
| git rebase -i `<commit-hash>` --autostash | rebase history                     |
| git push --force                          | force push your rebase             |
| git checkout `<branch>`                   | select branch                      |
| git fetch `<remote>` `<branch>`           | retrieves branch remote changes    |
| git reset --hard `<remote>`/`<branch>`    | resets your branch to remote state |
| git gc --prune=now --aggressive           | repository maintenance command     |

### **4. Git Subtree**

| Command                                                                  | Action              |
| ------------------------------------------------------------------------ | ------------------- |
| git remote add -f `<remote-name>` `<branch>`                             | adds a remote       |
| git subtree add --prefix `<path>` `<remote-name>` `<branch>` [--squash]  | attaches a subtree  |
| git fetch `<remote-name>` `<branch>`                                     | fetches a remote    |
| git subtree pull --prefix `<path>` `<remote-name>` `<branch>` [--squash] | pulls from subtree  |
| git subtree push --prefix `<path>` `<remote-name>` `<branch>` [--squash] | push subtree change |

## 🧿 **Linting**

Project use linters, for code formatting and code styling normalizing.

-   **[eslint](https://eslint.org/)**: tool for identifying and reporting on patterns found in ECMAScript/JavaScript code
-   **[prettier](https://prettier.io/)**: opinionated code formatter
-   **[stylelint](https://stylelint.io/)**: linter that helps you avoid errors and enforce conventions in your styles

For correct interpretation of linters, is recommended to use [Visual Studio Code](https://code.visualstudio.com/) as IDE and install the plugins in .vscode folder at 'extensions.json'.

## 🛠️ **Troubleshooting**

-   **I want to debug my code with breakpoints**:

    First, you should run your app with `npm run start:dev` so you can debug in Visual Studio Code,
    using the `launch.json` profile in .vscode, pressing F5 or in Run and Debug sidebar option.

-   **`<cmd>` is not recognized as an internal or external command, operable program or batch file.**:

    In Windows, sometimes appear this message, because some node module isn't installed for your system version.
    In example, if you execute `npm i` in WSL, and execute `npm run start:dev` in Powershell, you get the error
    for `env-cmd` is not recognized.
    So, you should execute `npm i` in Powershell terminal for solve that.

*   **I can't see my console logs for my unit tests**:

    You can set "verbose": false in webpack.config.js for show your console logs.

*   **When pushing to remote subtree, you get the error below**:

```bash
To https://any.domain.com/repo/_git/project
  ! [rejected]        420a15d0c81da609f217d7a22f5581656dc3e9cf -> anyBranch (non-fast-forward)
  error: failed to push some refs to 'https://any.domain.com/repo/_git/project'
  hint: Updates were rejected because a pushed branch tip is behind its remote
  hint: counterpart. Check out this branch and integrate the remote changes
  hint: (e.g. 'git pull ...') before pushing again.
  hint: See the 'Note about fast-forwards' in 'git push --help' for details.
```

use commands below:

| Command                                                                            | Action                          |
| ---------------------------------------------------------------------------------- | ------------------------------- |
| git subtree split --prefix `<path>` --onto=`<subtree-remote-name>`/`<branch>`      | splits a subtree for force push |
| git push `<subtree-remote-name>` `<hash-returned-previous-cmd>`:`<branch>` --force | force push                      |

## 🧮 **Built with**

-   [Create React App](https://github.com/facebook/create-react-app) - Official React SPA framework.
-   [env-cmd](https://github.com/toddbluhm/env-cmd) - NodeJS app's environment utility.
-   [craco](https://github.com/gsoft-inc/craco) - CRA webpack config injector.
-   [Material Design Icons](https://materialdesignicons.com/)

---

⌨ by Alvear Candia, Cristopher Alejandro <calvear93@gmail.com>
