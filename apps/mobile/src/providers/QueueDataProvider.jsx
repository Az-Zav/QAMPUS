// Live queue data for the student app: every office, today's queue per office, and the signed-in
// student's own tickets. One set of Firestore listeners for the whole app; the hooks read from here.
// Guests have no Firebase account yet, so they see no live data until their slice exists.

import { USER_ROLE } from '@/constants';
import { db } from '@/lib/firebase';
import { useSession } from '@/providers/SessionProvider';
import { watchBoard, watchMyTickets } from '@qampus/backend';
import { campusDate } from '@qampus/core/format';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const QueueDataContext = createContext(null);

const EMPTY_BOARD = Object.freeze({ offices: [], queues: {} });
const EMPTY_TICKETS = Object.freeze([]);

const warn = (label) => (error) => console.warn(label, error);

export function QueueDataProvider({ children }) {
  const { user } = useSession();
  const uid = user?.role === USER_ROLE.STUDENT ? user.id : null;

  // The queue doc id contains the campus day, so listeners restart when the day rolls over
  const [dayKey, setDayKey] = useState(() => campusDate().key);
  useEffect(() => {
    const id = setInterval(() => setDayKey(campusDate().key), 60000);
    return () => clearInterval(id);
  }, []);

  const [board, setBoard] = useState(EMPTY_BOARD);
  const [tickets, setTickets] = useState(EMPTY_TICKETS);

  useEffect(() => {
    if (!uid) return undefined;
    return watchBoard(db, new Date(), setBoard, warn('Could not load offices'));
  }, [uid, dayKey]);

  useEffect(() => {
    if (!uid) return undefined;
    return watchMyTickets(db, uid, setTickets, warn('Could not load tickets'));
  }, [uid]);

  // Signed out (or a guest): show nothing, whatever the last student left in state
  const value = useMemo(
    () => ({ board: uid ? board : EMPTY_BOARD, tickets: uid ? tickets : EMPTY_TICKETS }),
    [uid, board, tickets],
  );

  return <QueueDataContext.Provider value={value}>{children}</QueueDataContext.Provider>;
}

export function useQueueData() {
  const context = useContext(QueueDataContext);
  if (!context) throw new Error('useQueueData must be used within a QueueDataProvider');
  return context;
}
