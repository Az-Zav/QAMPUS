
import { useQueueStore } from '@/providers/QueueProvider';

import {
  getPenaltyState,
  getPenaltySummary,
} from '@/utils/penalties';

import { useMemo } from 'react';
import { useNow } from './useNow';
import { useOffenderProfiles } from './useOffenderProfiles';

// W04: Offense records and calculated penalty information.
export function useOffenses(search = '') {
  const {
    offenses,
    revokeOffense,
  } = useQueueStore();

  // Recalculate every minute so 24-hour bans expire
  // even while the staff console remains open.
  const now = useNow(60000);

  // The real strike count and ban of each offender (BUG-017)
  const userIds = useMemo(() => offenses.map((offense) => offense.holder?.user_id), [offenses]);
  const profiles = useOffenderProfiles(userIds);

  const summary = useMemo(
    () => getPenaltySummary(offenses, now, profiles),
    [offenses, now, profiles],
  );

  const results = useMemo(() => {
    const term = search.trim().toLowerCase();

    const sorted = [...offenses].sort(
      (a, b) =>
        new Date(b.created_at).getTime() -
        new Date(a.created_at).getTime(),
    );

    const statesByUser = new Map(
      summary.states.map((state) => [
        state.userId,
        state,
      ]),
    );

    const enriched = sorted.map((offense) => {
      const userId = offense.holder?.user_id;

      const penalty = statesByUser.get(userId) ??
        getPenaltyState(offenses, userId, now, profiles.get(userId) ?? null);

      return {
        ...offense,

        // The flag stored when the offense was recorded; a revoked offense no longer shows it
        resulted_in_ban:
          !offense.revoked_at &&
          penalty.triggerOffenseIds.includes(offense.id),

        currentStrikeCount: penalty.strikeCount,
        currentBanUntil: penalty.bannedUntil,

        isCurrentlyBanned:
          penalty.isBanned &&
          penalty.banOffenseIds.includes(offense.id),
      };
    });

    if (!term) {
      return enriched;
    }

    return enriched.filter((offense) =>
      [
        offense.holder?.name,
        offense.holder?.id_number,
        offense.ticket_number,
      ].some((field) =>
        String(field ?? '').toLowerCase().includes(term),
      ),
    );
  }, [offenses, search, summary, now, profiles]);

  return {
    offenses: results,
    total: offenses.length,
    summary,
    revokeOffense,
  };
}
