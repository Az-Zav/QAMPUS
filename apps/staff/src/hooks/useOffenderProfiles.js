import { db } from '@/lib/firebase';
import { watchProfile } from '@qampus/backend';
import { useEffect, useMemo, useState } from 'react';

// The live strike count and ban of each student in `userIds` (BUG-017): the profile is what joins check, so
// the Offenses screen shows the same ban state as the student's own Bans & Warnings.
// Returns a Map uid -> profile. A uid is missing until its profile arrives, or when it could not be read
// (callers then fall back to the offense records). Staff may get one profile at a time (rules), which a doc
// listener is.
export function useOffenderProfiles(userIds) {
  const key = useMemo(() => [...new Set(userIds.filter(Boolean))].sort().join('|'), [userIds]);
  const [profiles, setProfiles] = useState(() => new Map());

  useEffect(() => {
    if (!key) return undefined;
    const stops = key.split('|').map((uid) =>
      watchProfile(
        db,
        uid,
        (profile) =>
          setProfiles((prev) => {
            const next = new Map(prev);
            if (profile) next.set(uid, profile);
            else next.delete(uid);
            return next;
          }),
        (error) => console.warn('Could not read a student profile', error),
      ),
    );
    return () => stops.forEach((stop) => stop());
  }, [key]);

  return profiles;
}
