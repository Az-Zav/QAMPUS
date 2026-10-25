import { auth } from '@/lib/firebase';
import { useSession } from '@/providers/SessionProvider';
import { signInAnonymously } from 'firebase/auth';
import { useEffect, useState } from 'react';

export const PublicSession = Object.freeze({ LOADING: 'loading', READY: 'ready', ERROR: 'error' });

// The public display needs no staff login, but Firestore rules want a signed-in user. A tab opened from the staff
// console already has the staff session and reuses it; a bare screen (the counter's TV) signs in anonymously.
// (Never sign in anonymously over an existing session: it would replace the staff user in every open tab.)
export function usePublicSession() {
  const { authReady } = useSession();
  const [state, setState] = useState(PublicSession.LOADING);

  useEffect(() => {
    if (!authReady) return;
    const start = auth.currentUser ? Promise.resolve() : signInAnonymously(auth);
    start
      .then(() => setState(PublicSession.READY))
      .catch((error) => {
        console.warn('Could not start the public display session', error);
        setState(PublicSession.ERROR);
      });
  }, [authReady]);

  return state;
}
