// Live queue data for the student app: every office, today's queue per office, and the signed-in
// student's own tickets and notifications. One set of Firestore listeners for the whole app; the hooks read from here.

import { db } from '@/lib/firebase';
import { useSession } from '@/providers/SessionProvider';
import { watchBoard, watchMyNotifications, watchMyOffenses, watchMyTickets, watchMyTicketsSync, watchProfile } from '@qampus/backend';
import { campusDate } from '@qampus/core/format';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const QueueDataContext = createContext(null);

const EMPTY_BOARD = Object.freeze({ offices: [], queues: {} });
const EMPTY_TICKETS = Object.freeze([]);
const EMPTY_OFFENSES = Object.freeze([]);
const EMPTY_NOTIFICATIONS = Object.freeze([]);

const OFFLINE_DELAY_MS = 3000;

const warn = (label) => (error) => console.warn(label, error);

export function QueueDataProvider({ children }) {
  const { user } = useSession();
  const uid = user?.id ?? null;

  // The queue doc id contains the campus day, so listeners restart when the day rolls over
  const [dayKey, setDayKey] = useState(() => campusDate().key);
  useEffect(() => {
    const id = setInterval(() => setDayKey(campusDate().key), 60000);
    return () => clearInterval(id);
  }, []);

  const [board, setBoard] = useState(EMPTY_BOARD);
  const [tickets, setTickets] = useState(EMPTY_TICKETS);
  const [offenses, setOffenses] = useState(EMPTY_OFFENSES);
  // The mailbox is tagged with the uid it was loaded for: it is only "loaded" once Firestore has answered
  const [mailbox, setMailbox] = useState({ uid: null, list: EMPTY_NOTIFICATIONS });
  // The student's own profile, live: the session copy is read once at sign-in, so strikes and bans would be stale
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    if (!uid) return undefined;
    return watchBoard(db, new Date(), setBoard, warn('Could not load offices'));
  }, [uid, dayKey]);

  useEffect(() => {
    if (!uid) return undefined;
    return watchMyTickets(db, uid, setTickets, warn('Could not load tickets'));
  }, [uid]);

  // Offline sign (BUG-021): the tickets listener answers from the cache while the server cannot be reached.
  // Going offline waits a few seconds so a cold start (cache first, server a moment later) does not flash it;
  // coming back clears it at once.
  const [fromCache, setFromCache] = useState(false);
  const [offline, setOffline] = useState(false);
  useEffect(() => {
    if (!uid) return undefined;
    return watchMyTicketsSync(db, uid, setFromCache, warn('Could not follow the connection'));
  }, [uid]);
  useEffect(() => {
    if (!fromCache) return undefined;
    const id = setTimeout(() => setOffline(true), OFFLINE_DELAY_MS);
    return () => {
      clearTimeout(id);
      setOffline(false);
    };
  }, [fromCache]);

  useEffect(() => {
    if (!uid) return undefined;
    return watchMyOffenses(db, uid, setOffenses, warn('Could not load offenses'));
  }, [uid]);

  useEffect(() => {
    if (!uid) return undefined;
    return watchProfile(db, uid, setProfile, warn('Could not load the profile'));
  }, [uid]);

  useEffect(() => {
    if (!uid) return undefined;
    return watchMyNotifications(db, uid, (list) => setMailbox({ uid, list }), warn('Could not load notifications'));
  }, [uid]);

  // Signed out: show nothing, whatever the last user left in state
  const value = useMemo(
    () => ({
      board: uid ? board : EMPTY_BOARD,
      tickets: uid ? tickets : EMPTY_TICKETS,
      offenses: uid ? offenses : EMPTY_OFFENSES,
      profile: uid ? profile : null,
      notifications: uid && mailbox.uid === uid ? mailbox.list : EMPTY_NOTIFICATIONS,
      notificationsReady: !!uid && mailbox.uid === uid,
      offline: !!uid && offline,
      uid,
    }),
    [uid, board, tickets, offenses, profile, mailbox, offline],
  );

  return <QueueDataContext.Provider value={value}>{children}</QueueDataContext.Provider>;
}

export function useQueueData() {
  const context = useContext(QueueDataContext);
  if (!context) throw new Error('useQueueData must be used within a QueueDataProvider');
  return context;
}
