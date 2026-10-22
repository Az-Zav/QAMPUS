import { daysBetween } from '@qampus/core/format';
import { useQueueStore } from '@/providers/QueueProvider';
import { useMemo } from 'react';
import { useNow } from './useNow';

// W05: the office's activity, newest first. `action` null = all; `days` null = all time,
// 0 = today, 1 = yesterday only, n > 1 = the last n days.
export function useActivityLog({ action = null, days = 0 } = {}) {
  const { activity } = useQueueStore();
  const now = useNow(60000); // re-bucket "today" across midnight

  const entries = useMemo(() => {
    return activity.filter((entry) => {
      if (action && entry.action !== action) return false;
      if (days === null) return true;
      const age = daysBetween(entry.created_at, now);
      return days <= 1 ? age === days : age < days;
    });
  }, [activity, action, days, now]);

  return { entries };
}
