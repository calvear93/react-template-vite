export type ArrayStateSortAction<T> = ((a: T, b: T) => number) | undefined;

export type ArrayStateFilterAction<T> = (
    value: T,
    index: number,
    array: T[]
) => value is T;

export interface ArrayStateController<T> {
    append: (item: T) => void;
    prepend: (item: T) => void;
    insert: (item: T, index: number) => void;
    remove: (item: T) => void;
    removeAt: (index: number) => void;
    sort: (sort: ArrayStateSortAction<T>) => void;
    filter: (filter: ArrayStateFilterAction<T>) => void;
    clear: () => void;
}

export type ArrayStateAction<T> =
    | {
          type: 'append' | 'prepend' | 'remove';
          payload: Parameters<ArrayStateController<T>['append']>[0];
      }
    | {
          type: 'insert';
          payload: Parameters<ArrayStateController<T>['insert']>;
      }
    | {
          type: 'removeAt';
          payload: Parameters<ArrayStateController<T>['removeAt']>[0];
      }
    | {
          type: 'sort';
          payload: Parameters<ArrayStateController<T>['sort']>[0];
      }
    | {
          type: 'filter';
          payload: Parameters<ArrayStateController<T>['filter']>[0];
      }
    | {
          type: 'clear';
      };

/**
 * Array handler reducer
 * for useArray hook.
 *
 * Allows to insert or remove
 * items from an array.
 *
 * @param {T[]} state current state
 * @param {ArrayStateAction<T>} action action dispatched
 *
 * @returns {T[]} current array state
 */
export function arrayReducer<T>(state: T[], action: ArrayStateAction<T>): T[] {
    switch (action.type) {
        // pushes a new element to end of the array
        case 'append': {
            if (!action.payload) return state;

            return [action.payload, ...state];
        }

        // pushes a new element to the beginning of the array
        case 'prepend': {
            if (!action.payload) return state;

            return [...state, action.payload];
        }

        // inserts element at specified index
        case 'insert': {
            const [item, index] = action.payload;

            return [...state.slice(0, index - 1), item, ...state.slice(index)];
        }

        // removes the specified item
        case 'remove':
            return state.filter((i) => i !== action.payload);

        // removes element at specified index
        case 'removeAt':
            return [
                ...state.slice(0, action.payload - 1),
                ...state.slice(action.payload)
            ];

        // sorts array items
        case 'sort':
            return [...state.sort(action.payload)];

        // filters array items
        case 'filter':
            return state.filter(action.payload);

        // removes all items
        case 'clear':
            return [];

        default:
            return state;
    }
}
