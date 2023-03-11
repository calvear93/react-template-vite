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

	getLayout(layoutName: string): ComponentModule {
		return this.modules[`${layoutName}.layout`];
	}

	getPage(pageName: string): ComponentModule {
		return this.modules[`${pageName}.page`];
	}

	private discoverRouteModules(): MetaLazyComponentModule {
		const modules = import.meta.glob(
			'/src/app/**/*.(page|layout).(t|j)sx'
		) as MetaModule;

		return Object.keys(modules).reduce<MetaLazyComponentModule>(
			(map, route) => {
				const path = route
					.replace(/^.*[/\\]/, '')
					.replace(/\.[^./]+$/, '');

				map[path] = lazy(modules[route]);

				return map;
			},
			{}
		);
	}

	private readonly modules: MetaLazyComponentModule;
}

// singleton
export const routerService = new RouterService();
