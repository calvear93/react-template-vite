import { atom } from 'jotai';

export interface SampleState {
	message: string;
	status: number;
}

const _innerAtom = atom<SampleState>({
	message: 'loading',
	status: 0,
});

export const sampleAtom = atom(
	(get) => get(_innerAtom).message,
	(_get, set, status: number) => {
		set(_innerAtom, {
			message: status === 200 ? 'success' : 'error',
			status,
		});
	},
);
