// QAMPUS Service Store Factory
// Minimal reactive state store providing subscription-based state delivery to providers.

/**
 * Creates an observable state store.
 *
 * @template T
 * @param {T} initialState - Initial store state
 * @returns {{
 *   getState: () => T,
 *   setState: (updater: Partial<T> | ((prev: T) => T)) => T,
 *   subscribe: (listener: (state: T) => void) => () => void,
 *   notify: () => void
 * }}
 */
export function createStore(initialState) {
  let state = initialState;
  const listeners = new Set();

  return {
    getState: () => state,

    setState: (updater) => {
      const nextState =
        typeof updater === 'function' ? updater(state) : { ...state, ...updater };
      state = nextState;
      listeners.forEach((listener) => {
        try {
          listener(state);
        } catch (error) {
          console.error('[createStore] Listener error:', error);
        }
      });
      return state;
    },

    subscribe: (listener) => {
      listeners.add(listener);
      try {
        listener(state);
      } catch (error) {
        console.error('[createStore] Initial subscription listener error:', error);
      }
      return () => {
        listeners.delete(listener);
      };
    },

    notify: () => {
      listeners.forEach((listener) => {
        try {
          listener(state);
        } catch (error) {
          console.error('[createStore] Notify error:', error);
        }
      });
    },
  };
}
