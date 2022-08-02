/**
 * Storage data and memoizing utilities.
 *
 * @see https://github.com/nbubna/store
 *
 * @summary Storage data and memoizing utilities.
 */

import storage from 'store2';

export type StorageType = 'local' | 'session';

export interface StorageContainerData<T> {
    expiration: number;

    data: T;
}

/**
 * Persists the result from an asynchronous
 * callback, storing it in browser storage.
 *
 * @template I item type
 * @template T async function type
 *
 * @param {string} key
 * @param {T} getter async function
 * @param {number} [expiration=0] expiration in seconds, 0 without expiration
 * @param {StorageType} [storageType='local'] local or session
 *
 * @returns {T} wrapped function
 */
export function memoizedAsyncCallback<
    I,
    T extends (...args: any[]) => Promise<I>
>(
    key: string,
    getter: T,
    expiration = 0,
    storageType: StorageType = 'local'
): (...args: Parameters<T>) => Promise<I> {
    const store = storage[storageType];

    return async (...args: Parameters<T>) => {
        const cache: StorageContainerData<ReturnType<T>> | undefined =
            store.get(key);

        if (cache && cache.expiration > 0 && Date.now() < cache.expiration)
            return cache.data;

        const data = await getter(args);

        store.set(key, {
            expiration: Date.now() + expiration * 1000,
            data
        });

        return data;
    };
}

export { default as storage } from 'store2';
