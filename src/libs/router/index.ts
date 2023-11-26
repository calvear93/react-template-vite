export * from 'react-router-dom';
export { Page } from './components/Page.tsx';
export * from './hoc/create-router.hoc.tsx';
export * from './router.hook.ts';
export type * from './types/route.d.ts';

declare module 'react-router-dom' {
	function useLoaderData<T = unknown>(): T;
}
