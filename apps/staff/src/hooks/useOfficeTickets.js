import { db } from '@/lib/firebase';
import { watchOfficeTickets } from '@qampus/backend';
import { useEffect, useState } from 'react';
import { useCampusDay } from './useCampusDay';

const NONE = Object.freeze([]);

// Every ticket of the office for today (any status), as plain records; [] until loaded.
export function useOfficeTickets(officeId) {
  const dayKey = useCampusDay();
  // Tagged with the key it was loaded for, so yesterday's tickets are never shown as today's
  const [state, setState] = useState({ key: null, tickets: NONE });
  const key = `${officeId}_${dayKey}`;

  useEffect(() => {
    if (!officeId) return undefined;
    return watchOfficeTickets(
      db,
      officeId,
      new Date(),
      (tickets) => setState({ key, tickets }),
      (error) => {
        console.warn('Could not load the tickets', error);
        setState({ key, tickets: NONE });
      },
    );
  }, [officeId, key]);

  return officeId && state.key === key ? state.tickets : NONE;
}
