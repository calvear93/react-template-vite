import { useSelector } from 'react-redux';
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AppState } from 'app/App.store';
import { fetchSampleAsyncMock } from '../__mocks__/fetchSampleAsync.mock';

export interface FetchSampleAsyncResponse {
    anyProp: string;
}

export interface FetchSampleAsyncState {
    ready: boolean;
    loading: boolean;
    content: FetchSampleAsyncResponse;
}

/**
 * Async thunk for fetch some data.
 *
 * @example
 *  import { useDispatch, useSelector } from 'react-redux';
 *  import { AppState } from 'app';
 *  import {
 *      asyncSlice,
 *      fetchSampleAsync,
 *      FetchSampleAsyncState
 *  } from 'pages/detail/slices/async.slice';
 *
 *  export const AnyComponent = () => {
 *      const dispatch = useDispatch();
 *      const { loading, content } = useSelector<AppState, FetchSampleAsyncState>(
 *          ({ [asyncSlice.name]: slice }) => slice
 *      );
 *
 *      useEffect(() => {
 *          dispatch(fetchSampleAsync());
 *      }, []);
 *      ...
 *  }
 */
export const fetchSampleAsync = createAsyncThunk(
    'sample/fetchAsync',
    async (): Promise<FetchSampleAsyncResponse> => {
        const response = await fetchSampleAsyncMock();

        if (response.status !== 200) throw new Error('An error has ocurred');

        return await response.json();
    }
);

/**
 * Redux slice sample for async fetch.
 *
 * @returns {Slice}
 */
export const asyncSlice = createSlice({
    name: 'asyncFetch',
    initialState: {
        ready: false,
        loading: false,
        content: {}
    } as FetchSampleAsyncState,
    reducers: {},
    extraReducers: {
        [fetchSampleAsync.pending.type]: (state) => {
            state.ready = false;
            state.loading = true;
        },
        [fetchSampleAsync.fulfilled.type]: (
            state,
            { payload }: PayloadAction<FetchSampleAsyncResponse>
        ) => {
            state.ready = true;
            state.loading = false;
            state.content = payload;
        },
        [fetchSampleAsync.rejected.type]: (state) => {
            state.loading = false;
        }
    }
});

export const useAsyncFetchSelector = () =>
    useSelector<AppState, FetchSampleAsyncState>(
        ({ [asyncSlice.name]: slice }) => slice
    );
