/**
 * Routes definition.
 *
 * Here you must define your app routes
 * per namespace.
 * A namespace helps you to organize your
 * routes, for example 'app', 'public',
 * 'private', etc.
 *
 * This routes should be used in createRouter
 * function from @router module.
 */
export const routes = {
    app: {
        Main: '/',
        Detail: ['/detail', '/detail/:id']
    }
};
