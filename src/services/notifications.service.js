// QAMPUS Notifications Service
// Dispatches, stores, and marks read state for transactional and system notifications.

import { buildSeedData } from '@/data/mock';
import { authService } from './auth.service';
import { createStore } from './createStore';

const initialSeeds = buildSeedData();

const store = createStore({
  notifications: initialSeeds.notifications,
});

export const notificationsService = {
  subscribe: store.subscribe,
  getState: store.getState,

  /**
   * Retrieves notifications for a given user ID.
   *
   * @param {string} userId
   * @returns {import('@/types').Notification[]}
   */
  getUserNotifications: (userId) => {
    return store.getState().notifications.filter((n) => n.userId === userId);
  },

  /**
   * Marks a specific notification as read.
   *
   * @param {string} id
   * @returns {Promise<import('@/types').ActionResult<import('@/types').Notification>>}
   */
  markRead: async (id) => {
    const list = store.getState().notifications;
    const target = list.find((n) => n.id === id);
    if (!target) {
      return { ok: false, code: 'NOT_FOUND', message: 'Notification not found.' };
    }

    if (target.isRead) {
      return { ok: true, data: target };
    }

    const updated = { ...target, isRead: true };
    const notifications = list.map((n) => (n.id === id ? updated : n));
    store.setState({ notifications });

    return { ok: true, data: updated };
  },

  /**
   * Marks all notifications for current user as read.
   *
   * @returns {Promise<import('@/types').ActionResult<null>>}
   */
  markAllRead: async () => {
    const user = authService.getCurrentUser();
    if (!user) {
      return { ok: false, code: 'UNAUTHENTICATED', message: 'No active session.' };
    }

    const notifications = store.getState().notifications.map((n) => {
      if (n.userId !== user.id) return n;
      return { ...n, isRead: true };
    });

    store.setState({ notifications });
    return { ok: true, data: null };
  },

  /**
   * Dispatches a new notification to the store.
   *
   * @param {{
   *   userId: string,
   *   type: string,
   *   title: string,
   *   message: string
   * }} params
   */
  dispatchSystemNotification: ({ userId, type, title, message }) => {
    const newNotif = {
      id: `notif_${Date.now().toString().slice(-6)}`,
      userId,
      type,
      title,
      message,
      isRead: false,
      createdAt: new Date().toISOString(),
    };

    store.setState({
      notifications: [newNotif, ...store.getState().notifications],
    });
    return newNotif;
  },
};
