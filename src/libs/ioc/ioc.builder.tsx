import {
	atom,
	createStore,
	type PrimitiveAtom,
	Provider,
	useAtomValue,
} from 'jotai';
import { useHydrateAtoms } from 'jotai/utils';
import type { PropsWithChildren } from 'react';

/**
 * Injects a new value to atom.
 */
const HydrateAtom = ({ atom, children, values }: HydrateAtomsProps) => {
	useHydrateAtoms([[atom, values]]);
	return children;
};

/**
 * Creates a new Inversion of Control container.
 *
 * @example
 * ```ts
 *	// app.ioc.ts
 *	import { createContainer } from '#libs/ioc';
 *
 *	export const { container, useInjection } = = createContainer();
 *	// tokens
 *	export const MY_CUSTOM_PROVIDER = 'custom_provider';
 *	// bindings
 *	container.bind(HttpClient, new HttpClient()); // bind using a class
 *	container.bind(MY_CUSTOM_PROVIDER, new MyCustomProvider()); // bind using a class
 *
 *	// AnyComponent.ts
 *	import { useInjection, MY_CUSTOM_PROVIDER } from './app.ioc.ts';
 *
 *	export const AnyComponent: React.FC = (): React.ReactElement => {
 *		const httpClient = useInjection(HttpClient);
 *		const myCustomProvider = useInjection<MyCustomProvider>(MY_CUSTOM_PROVIDER);
 *
 *		...
 *	};
 *```
 */
export const createContainer = (store = createStore()) => {
	const container = atom(new Map());

	return {
		InversionOfControlProvider: ({
			children,
			values,
		}: InversionOfControlProviderProps) => {
			return (
				<Provider store={store}>
					<HydrateAtom atom={container} values={values}>
						{children}
					</HydrateAtom>
				</Provider>
			);
		},
		container: {
			bind: (key: any, value: any) => {
				store.get(container).set(key, value);
			},
			resolve: <
				T,
				K = unknown,
				R = K extends { new (...args: any): infer C } ? C : T,
			>(
				key: K,
			): R => {
				return store.get(container).get(key);
			},
			unbind: (key: any) => {
				store.get(container).delete(key);
			},
		},
		useInjection: <
			T,
			K = unknown,
			R = K extends { new (...args: any): infer C } ? C : T,
		>(
			key: K,
		): R => {
			return useAtomValue(container).get(key);
		},
	};
};

export interface HydrateAtomsProps extends PropsWithChildren {
	atom: PrimitiveAtom<any>;
	values: unknown;
}

export interface InversionOfControlProviderProps extends PropsWithChildren {
	values: Map<unknown, unknown>;
}
