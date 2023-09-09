export * from 'react-router-dom';
export { Page } from './components/Page';
export * from './hoc/create-router.hoc';
export * from './router.hook';
export * from './types/route.d';

declare module 'react-router-dom' {
	function useLoaderData<T = unknown>(): T;
}
