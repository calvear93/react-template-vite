import { atom } from 'jotai';

export interface SampleState {
	status: number;
	message: string;
}

const _innerAtom = atom<SampleState>({
	status: 0,
	message: 'loading',
});

export const sampleAtom = atom(
	(get) => get(_innerAtom).message,
	(_get, set, status: number) => {
		set(_innerAtom, {
			status,
			message: status === 200 ? 'success' : 'error',
		});
	},
);
