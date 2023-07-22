export const fetchSampleAsyncMock = (): Promise<{
	status: number;
	json: () => any;
}> =>
	new Promise((resolve) =>
		setTimeout(
			() =>
				resolve({
					json: () =>
						Promise.resolve({
							anyProp: 'anyValue',
						}),
					status: 200,
				}),
			2500,
		),
	);
