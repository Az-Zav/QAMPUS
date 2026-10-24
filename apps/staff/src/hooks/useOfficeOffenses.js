import { db } from '@/lib/firebase';
import { watchOfficeOffenses } from '@qampus/backend';
import { useEffect, useState } from 'react';

const NONE = Object.freeze([]);

// Every offense recorded at the office (any status), as plain records; [] until loaded.
export function useOfficeOffenses(officeId) {
  // Tagged with the office it was loaded for, so another office's offenses are never shown
  const [state, setState] = useState({ officeId: null, offenses: NONE });

  useEffect(() => {
    if (!officeId) return undefined;
    return watchOfficeOffenses(
      db,
      officeId,
      (offenses) => setState({ officeId, offenses }),
      (error) => {
        console.warn('Could not load the offenses', error);
        setState({ officeId, offenses: NONE });
      },
    );
  }, [officeId]);

  return officeId && state.officeId === officeId ? state.offenses : NONE;
}
