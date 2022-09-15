import { ComponentType, lazy, LazyExoticComponent } from 'react';

type MetaModule = Record<
    string,
    () => Promise<{ default: ComponentType<any> }>
>;

export type MetaLazyComponentModule = Record<
    string,
    LazyExoticComponent<ComponentType<any>>
>;

/**
 * Search for any matching module
 * generating a lazy load component.
 *
 * @returns {MetaLazyComponentModule}
 */
export const discoverRouteModules = (): MetaLazyComponentModule => {
    const modules = import.meta.glob(
        '/src/app/**/*.(page|layout).(t|j)sx'
    ) as MetaModule;

    return Object.keys(modules).reduce((map, route) => {
        const path = route.replace(/^.*[/\\]/, '').replace(/\.[^./]+$/, '');

        map[path] = lazy(modules[route]);

        return map;
    }, {} as MetaLazyComponentModule);
};
