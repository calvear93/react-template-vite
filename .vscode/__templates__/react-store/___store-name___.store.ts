import { atom } from 'jotai';

export interface ___StoreName___State {
	anyValue: number;
}

const _inner___StoreName___Store = atom<___StoreName___State>({
	anyValue: 1,
});

/**
 * ___StoreName___ store module (Jotai-backed).
 *
 * @returns store primitive (read/write)
 */
export const ___storeName___Store = atom(
	(get) => get(_inner___StoreName___Store),
	(get, set, val: number) => {
		set(_inner___StoreName___Store, {
			anyValue: val,
		});
	},
);
