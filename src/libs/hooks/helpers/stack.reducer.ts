export interface StackStateController<T> {
    push: (item: T) => void;
    pop: () => T | undefined;
    peek: () => T | undefined;
    clear: () => void;
}

export type StackStateAction<T> =
    | {
          type: 'push';
          payload: Parameters<StackStateController<T>['push']>[0];
      }
    | {
          type: 'pop' | 'clear';
      };

/**
 * Stack handler reducer
 * for useStack hook.
 *
 * Allows to insert or remove
 * items from a stack.
 *
 * @param {T[]} state current state
 * @param {StackStateAction<T>} action action dispatched
 *
 * @returns {T[]} current array state
 */
export function stackReducer<T>(state: T[], action: StackStateAction<T>): T[] {
    switch (action.type) {
        // inserts and item to the top
        case 'push':
            return [action.payload, ...state];

        // extracts an item
        case 'pop':
            return [...state.slice(1)];

        // removes all items
        case 'clear':
            return [];

        default:
            return state;
    }
}
