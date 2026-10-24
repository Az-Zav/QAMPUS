import { useQueueData } from '@/providers/QueueDataProvider';
import { useMemo } from 'react';

// The signed-in student's strike count, ban and offense history, newest first (R-10 – R-14).
// Strikes and the ban come from the live profile; the history from the offense records.
export function usePenaltyRecord() {
  const { profile, offenses } = useQueueData();

  return useMemo(
    () => ({
      strikeCount: profile?.strike_count ?? 0,
      bannedUntil: profile?.banned_until ?? null,
      offenses: [...offenses].sort((a, b) => b.created_at.localeCompare(a.created_at)),
    }),
    [profile, offenses],
  );
}
