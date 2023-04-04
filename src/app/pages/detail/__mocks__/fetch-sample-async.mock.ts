export const fetchSampleAsyncMock = (): Promise<{
	status: number;
	json: () => any;
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
