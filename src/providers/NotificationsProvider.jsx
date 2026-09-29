// QAMPUS Notifications Provider
// Provides the current user's notifications, unread badge counts, and read state actions.

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { notificationsService } from '@/services/notifications.service';
import { useAuth } from './AuthProvider';

const NotificationsContext = createContext(null);

export function NotificationsProvider({ children }) {
  const { user } = useAuth();
  const userId = user?.id;

  const [items, setItems] = useState(() => {
    return userId ? notificationsService.getUserNotifications(userId) : [];
  });
  const [status, setStatus] = useState('ready');

  useEffect(() => {
    if (!userId) return;

    const unsubscribe = notificationsService.subscribe(() => {
      const userNotifs = notificationsService.getUserNotifications(userId);
      setItems(userNotifs);
      setStatus('ready');
    });

    return unsubscribe;
  }, [userId]);

  const actions = useMemo(
    () => ({
      markRead: notificationsService.markRead,
      markAllRead: notificationsService.markAllRead,
    }),
    []
  );

  const unreadCount = useMemo(() => {
    return items.filter((n) => !n.isRead).length;
  }, [items]);

  const value = useMemo(
    () => ({
      status,
      items,
      unreadCount,
      actions,
    }),
    [status, items, unreadCount, actions]
  );

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationsContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationsProvider');
  }
  return context;
}
