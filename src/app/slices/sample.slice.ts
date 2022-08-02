import { useSelector } from 'react-redux';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AppState } from 'app/App.store';

export interface SampleState {
    state: number;

    message: string;
}

/**
 * Sample slice for redux store.
 *
 * @example
 *  import { AppState, useAppDispatch } from 'app';
 *  import { sampleSlice, SampleState } from 'slices';
 *  import { useSelector } from 'react-redux';
 *
 *  const { sample: sampleAction } = sampleSlice.actions;
 *
 *  export const AnyComponent = () => {
 *      const dispatch = useAppDispatch();
 *      const { message } = useSelector<AppState, SampleState>(
 *          ({ [sampleSlice.name]: slice }) => slice
 *      );
 *
 *      useEffect(() => {
 *          dispatch(sampleAction(200));
 *      }, []);
 *      ...
 *  }
 *
 * @returns {Slice} sample slice
 */
export const sampleSlice = createSlice({
    name: 'sample',
    initialState: { state: 0, message: 'loading' } as SampleState,
    reducers: {
        sample: (state, { payload }: PayloadAction<number>) => {
            state.state = payload;
            state.message = payload === 200 ? 'success' : 'error';
        }
    }
});

export const useSampleSelector = () =>
    useSelector<AppState, SampleState>(
        ({ [sampleSlice.name]: slice }) => slice
    );
