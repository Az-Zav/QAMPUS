import { NOTIFICATION_TYPE } from '@/constants';
import { useEffect, useRef, useState } from 'react';
import { useNotifications } from './useNotifications';

// Shown on screen for this long
const TOAST_MS = 5000;
// Another dialog already announces these, or the student just did it themselves
const QUIET_TYPES = new Set([NOTIFICATION_TYPE.YOUR_TURN, NOTIFICATION_TYPE.WARNING]);

// The latest new notification to announce with a banner while the app is open, or null.
// The mailbox as it was when it first loaded is only remembered (it does not replay); every notification that
// arrives after that is announced. Not clock based. `muted` (the
// Notifications screen itself is open) still counts the notification as seen.
export function useNotificationToast({ muted = false } = {}) {
  const { notifications, ready } = useNotifications();
  const seen = useRef(null); // null until the loaded mailbox has been remembered
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (!ready) return;
    if (seen.current === null) {
      seen.current = new Set(notifications.map((n) => n.id));
      return;
    }
    const fresh = notifications.filter((n) => !seen.current.has(n.id));
    if (!fresh.length) return;
    fresh.forEach((n) => seen.current.add(n.id));

    const announce = fresh.find((n) => !n.is_read && !QUIET_TYPES.has(n.type));
    if (announce && !muted) setToast(announce);
  }, [notifications, ready, muted]);

  useEffect(() => {
    if (!toast) return undefined;
    const id = setTimeout(() => setToast(null), TOAST_MS);
    return () => clearTimeout(id);
  }, [toast]);

  return { toast, dismiss: () => setToast(null) };
}
