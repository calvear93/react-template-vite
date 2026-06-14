import type { AsyncSampleResult } from '../store/async.store.ts';

export const fetchSampleAsyncMock = (): Promise<{
	status: number;
	json: () => Promise<AsyncSampleResult>;
}> =>
	new Promise((resolve) =>
		setTimeout(
			() =>
				resolve({
					status: 200,
					json: () =>
						Promise.resolve({
							anyProp: 'anyValue',
						}),
				}),
			2500,
		),
	);
