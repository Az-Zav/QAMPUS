// QAMPUS Offices Service
// Mock office directory and queue state management.

import { MOCK_OFFICES } from '@/data/mock';
import { createStore } from './createStore';

const store = createStore({
  offices: [...MOCK_OFFICES],
});

export const officesService = {
  subscribe: store.subscribe,
  getState: store.getState,

  /**
   * Retrieves an office by code ('R', 'M', 'S').
   *
   * @param {string} code
   * @returns {import('@/types').Office | undefined}
   */
  getOfficeByCode: (code) => {
    return store.getState().offices.find((o) => o.code === code);
  },

  /**
   * Internal helper to adjust queue metrics when tickets are joined/served.
   *
   * @param {string} officeCode
   * @param {Partial<import('@/types').OfficeQueue>} queueDelta
   */
  updateQueue: (officeCode, queueDelta) => {
    const offices = store.getState().offices.map((office) => {
      if (office.code !== officeCode) return office;
      return {
        ...office,
        queue: {
          ...office.queue,
          ...queueDelta,
        },
      };
    });
    store.setState({ offices });
  },
};
