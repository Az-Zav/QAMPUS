import { db } from '@/lib/firebase';
import { displayState, watchQueue } from '@qampus/backend';
import { useEffect, useState } from 'react';
import { useCampusDay } from './useCampusDay';

// D01: what the public display shows for an office: { isOpen, nowServing, next } (CODE-SEQ numbers only, no names or
// personal data on a public screen), or { error: true } when the queue cannot be read, or null until it has loaded.
export function useDisplayQueue(office) {
  const dayKey = useCampusDay();
  const officeId = office?.id ?? null;
  const key = `${officeId}_${dayKey}`;
  // Tagged with the key it was loaded for, so yesterday's queue is never shown as today's
  const [state, setState] = useState({ key: null, queue: null, error: false });

  useEffect(() => {
    if (!officeId) return undefined;
    return watchQueue(
      db,
      officeId,
      new Date(),
      (queue) => setState({ key, queue, error: false }),
      (error) => {
        console.warn('Could not load the queue', error);
        setState({ key, queue: null, error: true });
      },
    );
  }, [officeId, key]);

  if (!office || state.key !== key) return null;
  if (state.error) return { error: true };
  return displayState({ office, queue: state.queue });
}
