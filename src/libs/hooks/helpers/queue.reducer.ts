export interface QueueStateController<T> {
    enqueue: (item: T) => void;
    dequeue: () => T | undefined;
    peek: () => T | undefined;
    clear: () => void;
}

export type QueueStateAction<T> =
    | {
          type: 'enqueue';
          payload: Parameters<QueueStateController<T>['enqueue']>[0];
      }
    | {
          type: 'peek' | 'dequeue' | 'clear';
      };

/**
 * Queue handler reducer
 * for useQueue hook.
 *
 * Allows to insert or remove
 * items from a queue.
 *
 * @param {T[]} state current state
 * @param {QueueStateAction<T>} action action dispatched
 *
 * @returns {T[]} current array state
 */
export function queueReducer<T>(state: T[], action: QueueStateAction<T>): T[] {
    switch (action.type) {
        // enqueue an item
        case 'enqueue': {
            if (!action.payload) return state;

            return [...state, action.payload];
        }

        // dequeue an item
        case 'dequeue':
            return [...state.slice(1)];

        // removes all items
        case 'clear':
            return [];

        default:
            return state;
    }
}
