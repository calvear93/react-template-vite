import { RouteDefinition } from '@router';

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
export const routes: Record<string, RouteDefinition[]> = {
    app: [
        {
            path: '/',
            render: {
                layout: 'App.layout',
                children: [
                    // root/home page
                    {
                        title: 'Home',
                        render: {
                            child: 'Main.page'
                        }
                    },
                    // detail page
                    {
                        path: 'detail',
                        title: 'Detail',
                        render: {
                            child: 'Detail.page',
                            children: [
                                // detail page with param
                                {
                                    title: 'Detail Param',
                                    path: ':id', // /detail/:id
                                    render: {
                                        child: 'Detail.page'
                                    }
                                }
                            ]
                        },
                        payload: {
                            header: {
                                title: 'HEADER DETAIL'
                            },
                            footer: {
                                text: 'FOOTER DETAIL'
                            }
                        }
                    }
                ]
            },
            payload: {
                header: {
                    title: 'HEADER BASE'
                },
                footer: {
                    text: 'FOOTER BASE'
                }
            }
        }
    ]
};
