import { atom } from 'jotai';

const _innerStore = atom<SampleState>({
	message: 'loading',
	status: 0,
});

export const sampleStore = atom(
	(get) => get(_innerStore).message,
	(_get, set, status: number) => {
		set(_innerStore, {
			message: status === 200 ? 'success' : 'error',
			status,
		});
	},
);

export interface SampleState {
	message: string;
	status: number;
}
