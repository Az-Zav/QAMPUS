import { db } from '@/lib/firebase';
import { watchQueue } from '@qampus/backend';
import { useEffect, useState } from 'react';
import { useCampusDay } from './useCampusDay';

// Today's queue doc for an office, or null until staff open it (and for no office).
export function useTodayQueue(officeId) {
  const dayKey = useCampusDay();
  // Tagged with the key it was loaded for, so yesterday's queue is never shown as today's
  const [state, setState] = useState({ key: null, queue: null });
  const key = `${officeId}_${dayKey}`;

  useEffect(() => {
    if (!officeId) return undefined;
    return watchQueue(
      db,
      officeId,
      new Date(),
      (queue) => setState({ key, queue }),
      (error) => {
        console.warn('Could not load the queue', error);
        setState({ key, queue: null });
      },
    );
  }, [officeId, key]);

  return officeId && state.key === key ? state.queue : null;
}
