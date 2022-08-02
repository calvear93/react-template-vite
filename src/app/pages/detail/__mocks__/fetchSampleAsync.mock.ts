export const fetchSampleAsyncMock = (): Promise<{
    status: number;
    json: () => any;
}> =>
    new Promise((res) =>
        setTimeout(
            () =>
                res({
                    status: 200,
                    json: () =>
                        Promise.resolve({
                            anyProp: 'anyValue'
                        })
                }),
            3000
        )
    );
