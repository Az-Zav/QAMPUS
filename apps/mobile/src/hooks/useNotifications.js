import { db } from '@/lib/firebase';
import { useQueueData } from '@/providers/QueueDataProvider';
import { markAllNotificationsRead, markNotificationRead } from '@qampus/backend';
import { useCallback, useMemo } from 'react';

// The signed-in student's in-app notifications (R-25), newest first, live. `markRead(id)` marks one read;
// `markAllRead()` marks them all. A failed mark only logs: the list stays as it was.
export function useNotifications() {
  const { notifications, notificationsReady, uid } = useQueueData();

  const markRead = useCallback(
    (id) => {
      if (uid) markNotificationRead(db, uid, id).catch((error) => console.warn('Could not mark it read', error));
    },
    [uid],
  );

  const markAllRead = useCallback(() => {
    if (uid) markAllNotificationsRead(db, uid).catch((error) => console.warn('Could not mark them read', error));
  }, [uid]);

  return useMemo(
    () => ({
      notifications,
      ready: notificationsReady,
      unreadCount: notifications.filter((n) => !n.is_read).length,
      markRead,
      markAllRead,
    }),
    [notifications, notificationsReady, markRead, markAllRead],
  );
}
