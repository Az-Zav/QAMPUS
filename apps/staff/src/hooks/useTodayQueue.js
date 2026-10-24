import { db } from '@/lib/firebase';
import { watchQueue } from '@qampus/backend';
import { campusDate } from '@qampus/core/format';
import { useEffect, useState } from 'react';

// Today's queue doc for an office, or null until staff open it (and for no office).
// The doc id contains the campus day, so the listener restarts when the day rolls over.
export function useTodayQueue(officeId) {
  const [dayKey, setDayKey] = useState(() => campusDate().key);
  useEffect(() => {
    const id = setInterval(() => setDayKey(campusDate().key), 60000);
    return () => clearInterval(id);
  }, []);

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
