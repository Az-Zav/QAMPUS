import { registerForPush } from '@/lib/push';
import { useQueueData } from '@/providers/QueueDataProvider';
import { useSession } from '@/providers/SessionProvider';
import * as Notifications from 'expo-notifications';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';

// While signed in with push switched on: register this phone for "your turn" pushes (refreshing the token on every
// app start) and open Home when one is tapped. Waits for the live profile, so a switch that is off is never overridden.
export function usePushRegistration() {
  const { user } = useSession();
  const { profile } = useQueueData();
  const router = useRouter();
  const uid = user?.id ?? null;
  const enabled = !!profile && profile.push_enabled !== false;

  useEffect(() => {
    if (!uid || !enabled) return;
    registerForPush(uid).catch((error) => console.warn('Could not register for push', error));
  }, [uid, enabled]);

  // A tap on the push brings the app forward; the called dialog appears from the ticket as it does for a live call
  useEffect(() => {
    const sub = Notifications.addNotificationResponseReceivedListener(() => router.navigate('/home'));
    return () => sub.remove();
  }, [router]);
}
