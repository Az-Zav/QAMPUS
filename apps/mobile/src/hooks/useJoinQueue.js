import { db } from '@/lib/firebase';
import { useSession } from '@/providers/SessionProvider';
import { joinQueue, TicketingError } from '@qampus/backend';
import { useCallback, useState } from 'react';

// Joins `office` (an office view) for the signed-in student.
// join(office) resolves to null on success, or a TicketingError code the screen maps to copy.
export function useJoinQueue() {
  const { user } = useSession();
  const [joining, setJoining] = useState(false);

  const join = useCallback(
    async (office) => {
      setJoining(true);
      try {
        await joinQueue(db, { user, office });
        return null;
      } catch (error) {
        console.warn('Join failed', error);
        return error.code ?? TicketingError.UNKNOWN;
      } finally {
        setJoining(false);
      }
    },
    [user],
  );

  return { join, joining };
}
