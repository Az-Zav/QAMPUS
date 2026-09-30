import { MOCK_OFFENSES, MOCK_PENALTY_PREVIEWS } from '@/data/mock';
import { useSession } from '@/providers/SessionProvider';
import { useMemo } from 'react';

// The signed-in user's strike count, ban and offense history, newest first (R-10 – R-14).
// `preview` other than 'live' returns a dev fixture from MOCK_PENALTY_PREVIEWS.
// Backend swap: replace MOCK_OFFENSES with a Firestore `offenses` query on user_id.
export function usePenaltyRecord(preview = 'live') {
  const { user } = useSession();

  return useMemo(() => {
    const fixture = preview !== 'live' && MOCK_PENALTY_PREVIEWS[preview];
    const source = fixture || {
      strike_count: user?.strike_count ?? 0,
      banned_until: user?.banned_until ?? null,
      offenses: MOCK_OFFENSES.filter((o) => o.user_id === user?.id),
    };

    return {
      strikeCount: source.strike_count,
      bannedUntil: source.banned_until,
      offenses: [...source.offenses].sort((a, b) => b.created_at.localeCompare(a.created_at)),
    };
  }, [preview, user]);
}
