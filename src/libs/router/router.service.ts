import { ComponentType, lazy, LazyExoticComponent } from 'react';

type MetaModule = Record<
    string,
    () => Promise<{ default: ComponentType<any> }>
>;

export type ComponentModule = LazyExoticComponent<ComponentType<any>>;

export type MetaLazyComponentModule = Record<string, ComponentModule>;

class RouterService {
    constructor() {
        // pages and layouts components modules
        this.modules = this.discoverRouteModules();
    }

    /**
     * Returns layout module.
     *
     * @param {string} layoutName
     *
     * @returns {ComponentModule}
     */
    getLayout(layoutName: string): ComponentModule {
        return this.modules[`${layoutName}.layout`];
    }

    /**
     *
     * @param {string} pageName
     *
     * @returns {ComponentModule}
     */
    getPage(pageName: string): ComponentModule {
        return this.modules[`${pageName}.page`];
    }

    /**
     * Layouts and pages components modules.
     *
     * @private
     * @type {MetaLazyComponentModule}
     */
    private readonly modules: MetaLazyComponentModule;

    /**
     * Search for any matching module
     * generating a lazy load component.
     *
     * @private
     * @returns {MetaLazyComponentModule}
     */
    private discoverRouteModules(): MetaLazyComponentModule {
        const modules = import.meta.glob(
            '/src/app/**/*.(page|layout).(t|j)sx'
        ) as MetaModule;

        return Object.keys(modules).reduce((map, route) => {
            const path = route.replace(/^.*[/\\]/, '').replace(/\.[^./]+$/, '');

            map[path] = lazy(modules[route]);

            return map;
        }, {} as MetaLazyComponentModule);
    }
}

// singleton
export const routerService = new RouterService();
