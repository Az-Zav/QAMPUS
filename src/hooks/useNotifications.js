import { MOCK_NOTIFICATIONS } from '@/data/mock';
import { useMemo } from 'react';

// The signed-in user's in-app notifications (R-25).
// Backend swap: replace MOCK_NOTIFICATIONS with a Firestore `users/{uid}/notifications` subscription.
export function useNotifications() {
  return useMemo(
    () => ({
      notifications: MOCK_NOTIFICATIONS,
      unreadCount: MOCK_NOTIFICATIONS.filter((n) => !n.is_read).length,
    }),
    [],
  );
}
