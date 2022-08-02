import { Reducer, useReducer, useState } from 'react';
import {
    arrayReducer,
    ArrayStateAction,
    ArrayStateController,
    ArrayStateFilterAction,
    ArrayStateSortAction
} from './helpers/array.reducer';
import {
    queueReducer,
    QueueStateAction,
    QueueStateController
} from './helpers/queue.reducer';
import {
    stackReducer,
    StackStateAction,
    StackStateController
} from './helpers/stack.reducer';

type DictionaryKey = keyof any;

export type Dictionary<T> = Record<DictionaryKey, T>;

// static states
const States: Dictionary<any> = {};

export type UseStaticStateCallback<T> = T | ((value: T) => T);

/**
 * Binds a static state to react component.
 * State value keeps on mounting/un-mounting.
 *
 * @dependency useState from react
 *
 * @param {keyof StaticState} key state identifier
 * @param {T} def default values for state
 *
 * @returns {[T, Function]} static state and setter
 */
export function useStaticState<T>(
    key: DictionaryKey,
    def?: T
): [T | undefined, (value: T | UseStaticStateCallback<T>) => void] {
    const [state, setState] = useState<T>(States[key] ?? def);

    return [
        state,
        (args) => {
            if (args instanceof Function) {
                setState((prevState: T) => {
                    States[key] = args(prevState);

                    return States[key];
                });
            } else {
                States[key] = args;

                setState(args);
            }
        }
    ];
}

/**
 * Binds a complex state to react component.
 *
 * @dependency useState from react
 * @param {object} def default values for state
 *
 * @returns {[T, Function]} state and setter
 */
export function useDictionary<T>(
    def: Dictionary<T>
): [Dictionary<T>, (key: DictionaryKey, value: T) => void] {
    const [state, setState] = useState<Dictionary<T>>(def ?? {});

    return [
        state,
        (key: DictionaryKey, value: T) => {
            setState((prevState) => ({
                ...prevState,
                [key]: value
            }));
        }
    ];
}

/**
 * Binds an array state to react component
 * using a reducer with actions.
 *
 * Handler has the actions below:
 *  - put: pushes a new element to the beginning of the array.
 *  - append: pushes a new element to end of the array.
 *  - insert: inserts an item in specified index.
 *  - remove: removes one item.
 *  - removeAt: removes one item at specified index.
 *  - sort: sorts array items.
 *  - filter: filters array items.
 *  - clear: removes all items.
 *
 * @dependency useReducer from react
 * @param {T[]} [def] default values for state
 *
 * @returns {[T[], ArrayStateController<T>]} state and handler object
 */
export function useArray<T>(def?: T[]): [T[], ArrayStateController<T>] {
    const [state, dispatch] = useReducer<Reducer<T[], ArrayStateAction<T>>>(
        arrayReducer,
        def ?? []
    );

    return [
        state,
        {
            append: (item: T) => dispatch({ type: 'append', payload: item }),

            prepend: (item: T) => dispatch({ type: 'prepend', payload: item }),

            insert: (item: T, index: number) =>
                dispatch({
                    type: 'insert',
                    payload: [item, index]
                }),

            remove: (item: T) => dispatch({ type: 'remove', payload: item }),

            removeAt: (index: number) =>
                dispatch({ type: 'removeAt', payload: index }),

            sort: (sort: ArrayStateSortAction<T>) =>
                dispatch({ type: 'sort', payload: sort }),

            filter: (filter: ArrayStateFilterAction<T>) =>
                dispatch({ type: 'filter', payload: filter }),

            clear: () => dispatch({ type: 'clear' })
        }
    ];
}

/**
 * Binds a queue [FIFO] state to react component
 * using a reducer with actions.
 *
 * Handler has the actions below:
 *  - enqueue: inserts an item to the queue.
 *  - dequeue: extracts first inserted item.
 *  - peek: gets first inserted item.
 *  - clear: removes all items.
 *
 * @dependency useReducer from react
 * @param {T[]} [def] default values for state
 *
 * @returns {[T[], QueueStateController<T>]} state and handler object
 */
export function useQueue<T>(def?: T[]): [T[], QueueStateController<T>] {
    const [state, dispatch] = useReducer<Reducer<T[], QueueStateAction<T>>>(
        queueReducer,
        def ?? []
    );

    return [
        state,
        {
            enqueue: (item: T) => dispatch({ type: 'enqueue', payload: item }),

            dequeue: () => {
                if (state.length === 0) return undefined;

                dispatch({ type: 'dequeue' });

                return state[0];
            },

            peek: () => state[0],

            clear: () => dispatch({ type: 'clear' })
        }
    ];
}

/**
 * Binds a stack [LIFO] state to react component
 * using a reducer with actions.
 *
 * Handler has the actions below:
 *  - push: inserts an item to the stack.
 *  - pop: extracts last inserted item.
 *  - peek: gets first inserted item.
 *  - clear: removes all items.
 *
 * @dependency useReducer from react
 * @param {T[]} [def] default values for state
 *
 * @returns {[T[], StackStateController<T>]} state and handler object
 */
export function useStack<T>(def?: T[]): [T[], StackStateController<T>] {
    const [state, dispatch] = useReducer<Reducer<T[], StackStateAction<T>>>(
        stackReducer,
        def ?? []
    );

    return [
        state,
        {
            push: (item: T) => dispatch({ type: 'push', payload: item }),

            pop: () => {
                if (state.length === 0) return undefined;

                dispatch({ type: 'pop' });

                return state[0];
            },

            peek: () => state[0],

            clear: () => dispatch({ type: 'clear' })
        }
    ];
}
