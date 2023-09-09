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

## ⛩ **Structure**

```bash
├── env/
│   └── appsettings.json
├── src/
│   ├── __tests__/
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

-   Install [NodeJS](https://nodejs.org/es/).
-   Install [PNPM](https://pnpm.io/installation)
-   Execute `pnpm install` command.
-   Execute `pnpm env:schema` command.
-   Run either `pnpm start:dev` or `pnpm test:dev` commands.

-   Using Docker.
    -   Exec `docker build --no-cache --build-arg ENV=dev -f Dockerfile --tag image_name .`
    -   Exec `docker run -d -it -p 8080:8080/tcp --name container_name image_name`
    -   Open `http://localhost:8080/` in browser
    -   **CAUTION !!!**: if you use a BASE_PATH different from root '/', create a `dev.env.local.json` file in `env/` with:

```json
{
	"BASE_URL": "/"
}
```

## 📋 **Branches and Environments**

Project has 2 environments.

-   **dev (development)**: environment with breaking changes and new features.
-   **release (production)**: release environment.

## 🧪 **Executing**

Project uses **npm scripts** for eases execution, testing and building.
Many of these script run on a defined environment, specified after ':', and
it environment may be 'dev' or 'release'.

| Command                      | Action                       |
| ---------------------------- | ---------------------------- |
| pnpm start:`<env>`           | executes the app             |
| pnpm build:`<env>`           | build the app                |
| pnpm test:`<env>`            | executes tests               |
| pnpm test:`<env>` --coverage | executes tests with coverage |
| pnpm env:schema              | updates env JSON schema      |
| pnpm format                  | code format                  |
| pnpm lint                    | code review                  |
| pnpm lint -- -- --fix        | code review/fix              |
| pnpm stylelint               | stylesheets review           |
| pnpm stylelint -- -- --fix   | stylesheets review/fix       |
