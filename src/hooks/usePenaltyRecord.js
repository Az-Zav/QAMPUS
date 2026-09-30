import { MOCK_OFFENSES } from '@/data/mock';
import { useSession } from '@/providers/SessionProvider';
import { useMemo } from 'react';

// The signed-in user's strike count, ban and offense history, newest first (R-10 – R-14).
// Backend swap: replace MOCK_OFFENSES with a Firestore `offenses` query on user_id.
export function usePenaltyRecord() {
  const { user } = useSession();

  return useMemo(() => ({
    strikeCount: user?.strike_count ?? 0,
    bannedUntil: user?.banned_until ?? null,
    offenses: MOCK_OFFENSES
      .filter((o) => o.user_id === user?.id)
      .sort((a, b) => b.created_at.localeCompare(a.created_at)),
  }), [user]);
}
