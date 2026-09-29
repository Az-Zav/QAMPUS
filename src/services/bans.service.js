// QAMPUS Bans & Offenses Service
// Tracks user infractions, offense history, and 24-hour queue joining bans.

import { NOTIFICATION_TYPE, OFFENSE_TYPE } from '@/constants/domain';
import { buildSeedData } from '@/data/mock';
import { createStore } from './createStore';
import { notificationsService } from './notifications.service';

const initialSeeds = buildSeedData();

const store = createStore({
  bans: initialSeeds.bans,
  offenses: initialSeeds.offenses,
});

export const bansService = {
  subscribe: store.subscribe,
  getState: store.getState,

  /**
   * Retrieves ban summary for a user ID.
   *
   * @param {string} userId
   * @returns {import('@/types').Bans}
   */
  getUserBans: (userId) => {
    return (
      store.getState().bans[userId] || {
        offenseCount: 0,
        ban: null,
      }
    );
  },

  /**
   * Retrieves all offenses for a user ID.
   *
   * @param {string} userId
   * @returns {import('@/types').Offense[]}
   */
  getUserOffenses: (userId) => {
    return store.getState().offenses.filter((o) => o.userId === userId);
  },

  /**
   * Records an infraction (NO_SHOW or CANCELLED_AFTER_CALL).
   * Automatically triggers a 24-hour ban when active offense count reaches 2.
   *
   * @param {{
   *   userId: string,
   *   ticketId: string,
   *   officeName: string,
   *   ticketNumber: string,
   *   type: import('@/types').OffenseTypeEnum
   * }} params
   */
  recordOffense: ({ userId, ticketId, officeName, ticketNumber, type }) => {
    const now = new Date();
    const currentBanData = bansService.getUserBans(userId);
    const newCount = currentBanData.offenseCount + 1;
    const willBan = newCount >= 2;

    const newOffense = {
      id: `off_${Date.now().toString().slice(-6)}`,
      userId,
      ticketId,
      officeName,
      ticketNumber,
      type,
      causedBan: willBan,
      revokedAt: null,
      createdAt: now.toISOString(),
    };

    const updatedBan = willBan
      ? {
          expiresAt: new Date(now.getTime() + 24 * 3600 * 1000).toISOString(),
          offenseIds: [
            ...((currentBanData.ban && currentBanData.ban.offenseIds) || []),
            newOffense.id,
          ],
        }
      : null;

    const state = store.getState();
    store.setState({
      offenses: [newOffense, ...state.offenses],
      bans: {
        ...state.bans,
        [userId]: {
          offenseCount: newCount,
          ban: updatedBan,
        },
      },
    });

    // Notify user of offense or warning
    if (willBan) {
      notificationsService.dispatchSystemNotification({
        userId,
        type: NOTIFICATION_TYPE.WARNING,
        title: 'Queue Joining Paused (24h)',
        message: `You reached 2 offenses. Joining queues is paused for 24 hours until ${new Date(now.getTime() + 24 * 3600 * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.`,
      });
    } else {
      notificationsService.dispatchSystemNotification({
        userId,
        type:
          type === OFFENSE_TYPE.NO_SHOW
            ? NOTIFICATION_TYPE.NO_SHOW
            : NOTIFICATION_TYPE.WARNING,
        title: 'Offense Recorded',
        message: `An offense was recorded for ticket ${ticketNumber}. One more offense will pause queue joining for 24 hours.`,
      });
    }

    return newOffense;
  },

  /**
   * Administratively revokes an offense (for staff event simulation / playground).
   *
   * @param {string} offenseId
   */
  revokeOffense: (offenseId) => {
    const state = store.getState();
    const target = state.offenses.find((o) => o.id === offenseId);
    if (!target || target.revokedAt) return;

    const nowIso = new Date().toISOString();
    const updatedOffenses = state.offenses.map((o) =>
      o.id === offenseId ? { ...o, revokedAt: nowIso } : o
    );

    const userBan = bansService.getUserBans(target.userId);
    const newCount = Math.max(0, userBan.offenseCount - 1);
    const updatedBan = newCount < 2 ? null : userBan.ban;

    store.setState({
      offenses: updatedOffenses,
      bans: {
        ...state.bans,
        [target.userId]: {
          offenseCount: newCount,
          ban: updatedBan,
        },
      },
    });

    notificationsService.dispatchSystemNotification({
      userId: target.userId,
      type: NOTIFICATION_TYPE.OFFENSE_REVOKED,
      title: 'Offense Revoked',
      message: `Your offense for ticket ${target.ticketNumber} at ${target.officeName} was revieewed and dismissed.`,
    });
  },
};
